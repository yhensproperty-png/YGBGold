import type { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  // Check if the request is a POST from Resend
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const payload = await request.json();
    const apiKey = Netlify.env.get("RESEND_API_KEY");

    // Only proceed if the event is a received email
    if (payload.type === "email.received") {
      const emailId = payload.data.email_id;

      // 1. Fetch the full email content from Resend using the email_id
      const fetchRes = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
        headers: { "Authorization": `Bearer ${apiKey}` }
      });

      if (!fetchRes.ok) throw new Error("Failed to fetch inbound email content");
      const emailData = await fetchRes.json();

      // 2. Forward the content to your specific YGB Gmail address
      const forwardRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "inquiries@mail.ygbgold.com", // Your branded sender
          to: ["ygbgoldbuysell@gmail.com"],   // Your updated recipient
          subject: `New website inquiry: ${emailData.subject || "No Subject"}`,
          text: `Original sender: ${emailData.from}\n\n${emailData.text || "No text content found."}`,
          html: emailData.html || undefined // Forwards HTML formatting if available
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
