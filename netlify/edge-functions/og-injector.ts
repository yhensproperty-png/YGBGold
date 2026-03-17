import type { Context } from "https://edge.netlify.com";

const SUPABASE_URL = "https://ivvgyrmyjfftqteaiyuf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2dmd5cm15amZmdHF0ZWFpeXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDc2OTEsImV4cCI6MjA4NzAyMzY5MX0.Jl1hyFgfQqUVNQM_Pz3eDO9hgHN5xXnmDu7OJY_oNaQ";

const BOT_UA_FRAGMENTS = [
  "facebookexternalhit",
  "facebot",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
  "telegrambot",
  "slackbot",
  "discordbot",
  "googlebot",
  "bingbot",
  "applebot",
  "embedly",
  "vkshare",
  "ia_archiver",
  "rogerbot",
  "showyoubot",
  "bufferbot",
  "pinterest",
  "outbrain",
];

function isSocialBot(ua: string): boolean {
  const lower = ua.toLowerCase();
  return BOT_UA_FRAGMENTS.some((f) => lower.includes(f));
}

export default async function handler(req: Request, ctx: Context): Promise<Response> {
  const { pathname } = new URL(req.url);
  const ua = req.headers.get("user-agent") ?? "";

  const match = pathname.match(/^\/property\/([^/]+)\/?$/);
  if (!match || !isSocialBot(ua)) {
    return ctx.next();
  }

  const slug = match[1];
  const ogPageUrl = `${SUPABASE_URL}/functions/v1/og-page?slug=${encodeURIComponent(slug)}`;

  try {
    const ogResponse = await fetch(ogPageUrl, {
      headers: {
        "user-agent": ua,
        "apikey": SUPABASE_ANON_KEY,
        "authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!ogResponse.ok) {
      console.error(`OG page fetch failed: ${ogResponse.status}`);
      return ctx.next();
    }

    const html = await ogResponse.text();

    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=0, must-revalidate",
        vary: "user-agent",
      },
    });
  } catch (error) {
    console.error("Error in OG injector:", error);
    return ctx.next();
  }
}
