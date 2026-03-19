import type { Context } from "https://edge.netlify.com";

// Verify Resend webhook signature using Svix signing scheme (HMAC-SHA256)
async function verifySignature(request: Request, rawBody: string): Promise<boolean> {
  const secret = Netlify.env.get("RESEND_WEBHOOK_SECRET");
  if (!secret) return false;

  const svixId        = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) return false;

  // Reject requests older than 5 minutes to prevent replay attacks
  const ts = parseInt(svixTimestamp);
  if (Math.abs(Date.now() / 1000 - ts) > 300) return false;

  // Svix secret is prefixed with "whsec_" — strip it and base64-decode
  const secretBytes = Uint8Array.from(
    atob(secret.replace(/^whsec_/, "")),
    c => c.charCodeAt(0)
  );

  // Import as HMAC-SHA256 key
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Signed content format: "{svix-id}.{svix-timestamp}.{raw-body}"
  const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signedContent));
  const computedSig = btoa(String.fromCharCode(...new Uint8Array(signature)));

  // svix-signature header can contain multiple sigs: "v1,<b64> v1,<b64>"
  const providedSigs = svixSignature.split(" ").map(s => s.replace(/^v1,/, ""));
  return providedSigs.some(sig => sig === computedSig);
}

export default async (request: Request, context: Context) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const rawBody = await request.text();

    // Verify the webhook signature before processing
    const isValid = await verifySignature(request, rawBody);
    if (!isValid) {
      console.error("Webhook signature verification failed");
      return new Response("Unauthorized", { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const apiKey = Netlify.env.get("RESEND_API_KEY");

    // Only proceed if the event is a received email
    if (payload.type === "email.received") {
      const emailId = payload.data.email_id;
      console.log(`[resend-inbound] Using email_id from payload.data.email_id: ${emailId}`);

      // 1. Fetch the full email content from Resend — retry up to 3x on 404 (race condition)
      const MAX_ATTEMPTS = 3;
      const RETRY_DELAY_MS = 2000;
      let emailData: Record<string, unknown> | null = null;

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        console.log(`[resend-inbound] Attempt ${attempt}/${MAX_ATTEMPTS} fetching email ${emailId}`);

        const fetchRes = await fetch(`https://api.resend.com/emails/${emailId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${Netlify.env.get("RESEND_API_KEY")}`,
            "Content-Type": "application/json",
          },
        });

        if (fetchRes.ok) {
          emailData = await fetchRes.json();
          console.log(`[resend-inbound] Successfully fetched email on attempt ${attempt}`);
          break;
        }

        const errorText = await fetchRes.text();
        console.error(`[resend-inbound] Attempt ${attempt} failed — ${fetchRes.status}: ${errorText}`);

        if (fetchRes.status === 404 && attempt < MAX_ATTEMPTS) {
          console.log(`[resend-inbound] 404 received, waiting ${RETRY_DELAY_MS}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        } else {
          throw new Error(`Failed to fetch inbound email after ${attempt} attempt(s): ${fetchRes.status}`);
        }
      }

      if (!emailData) throw new Error("Failed to fetch inbound email content from Resend");

      // 2. Forward the content to your specific YGB Gmail address
      const forwardRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "inquiries@mail.ygbgold.com",
          to: ["ygbgoldbuysell@gmail.com"],
          subject: `New website inquiry: ${emailData.subject || "No Subject"}`,
          text: `Original sender: ${emailData.from}\n\n${emailData.text || "No text content found."}`,
          html: emailData.html || undefined
        })
      });

      if (!forwardRes.ok) throw new Error("Failed to forward email");
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Inbound Error:", err.message);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const config = {
  path: "/resend-inbound"
};
