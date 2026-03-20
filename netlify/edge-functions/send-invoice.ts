import type { Context } from "https://edge.netlify.com";

export default async (request: Request, _context: Context) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { to, subject, html } = await request.json();
    const apiKey = Netlify.env.get("RESEND_API_KEY");

    if (!apiKey) {
      return new Response("Missing API key", { status: 500 });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "YGB Gold <inquiries@mail.ygbgold.com>",
        to: [to],
        reply_to: "inquiries@mail.ygbgold.com",
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[send-invoice] Resend error:", err);
      return new Response("Email send failed", {
        status: res.status,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    return new Response("OK", {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (err: any) {
    console.error("[send-invoice] Error:", err.message);
    return new Response("Internal Server Error", {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
};

export const config = { path: "/send-invoice" };
