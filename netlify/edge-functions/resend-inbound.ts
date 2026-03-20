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

    // Only proceed if the event is a received email
    if (payload.type === "email.received") {
      const emailId = payload.data.email_id;
      const from    = payload.data.from;
      const subject = payload.data.subject;
      console.log(`[resend-inbound] Received email from ${from}, subject: "${subject}", id: ${emailId}`);

      // Attempt to fetch full body via Resend's inbound-specific endpoint
      console.log(`[resend-inbound] Fetching body from /emails/receiving/${emailId}...`);
      const inboundRes = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${Netlify.env.get("RESEND_API_KEY")}`,
          "Content-Type": "application/json"
        }
      });

      console.log(`[resend-inbound] /emails/receiving response status: ${inboundRes.status}`);

      let textBody = "";
      let htmlBody = "";

      if (inboundRes.ok) {
        const inboundData = await inboundRes.json();
        console.log(`[resend-inbound] Inbound fetch succeeded. Keys: ${Object.keys(inboundData).join(", ")}`);
        textBody = inboundData.text || inboundData.content || "";
        htmlBody = inboundData.html || inboundData.content || "";
      } else {
        const errText = await inboundRes.text();
        console.error(`[resend-inbound] Inbound fetch failed — ${inboundRes.status}: ${errText}`);
        console.warn(`[resend-inbound] Falling back to metadata-only forward`);
      }

      const forwardRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Netlify.env.get("RESEND_API_KEY")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: `${from} <contact@mail.ygbgold.com>`,
          to: ["ygbgoldbuysell@gmail.com"],
          reply_to: from,
          subject: `New inquiry: ${subject || "No Subject"}`,
          text: `New Inquiry from: ${from}\n${"─".repeat(40)}\n\n${textBody || "(body unavailable — see Resend dashboard)"}`,
          html: htmlBody
            ? `<p><strong>New Inquiry from:</strong> ${from}</p><hr/>${htmlBody}`
            : `<p><strong>New Inquiry from:</strong> ${from}</p><p>(body unavailable — see Resend dashboard)</p>`
        })
      });

      if (!forwardRes.ok) {
        const errText = await forwardRes.text();
        console.error(`[resend-inbound] Forward failed — ${forwardRes.status}: ${errText}`);
        throw new Error("Failed to forward email");
      }

      console.log(`[resend-inbound] Email forwarded successfully to ygbgoldbuysell@gmail.com`);
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
