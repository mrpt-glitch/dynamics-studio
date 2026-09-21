import type { Config, Context } from "@netlify/edge-functions";

const encoder = new TextEncoder();

function cookie(request: Request, name: string) {
  const raw = request.headers.get("cookie") || "";
  for (const p of raw.split(/;\s*/)) {
    const i = p.indexOf("=");
    if (i > 0 && p.slice(0, i) === name) return p.slice(i + 1);
  }
  return "";
}

function secret() {
  return String(
    Netlify.env.get("SESSION_SECRET") ||
    Netlify.env.get("CUSTOMER_ACCESS_CODE") ||
    "ds-session"
  );
}

async function hmac(text: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(text));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function validSession(request: Request) {
  const token = cookie(request, "ds_session");
  if (!token || !token.includes(".")) return false;
  const [issued, sig] = token.split(".");
  if (!issued || !sig) return false;
  const age = Date.now() - Number(issued);
  if (!Number.isFinite(age) || age < 0 || age > 7 * 24 * 60 * 60 * 1000) return false;
  return sig === (await hmac(issued));
}

export default async (request: Request, context: Context) => {
  if (await validSession(request)) return context.next();
  const url = new URL(request.url);
  return Response.redirect(new URL("/access.html", url.origin), 302);
};

export const config: Config = {
  path: ["/", "/index.html", "/catalog.json"]
};
