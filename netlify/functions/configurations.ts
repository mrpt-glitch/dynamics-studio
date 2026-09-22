import { getStore } from "@netlify/blobs";

// Save lives in a Netlify Function (not an Edge Function) so @netlify/blobs
// can be installed from package.json. Edge bundling of npm modules is
// experimental and was failing deploys with "Could not resolve @netlify/blobs".
// Path stays /api/configurations so index.html and saved.html do not change.

function store() {
  return getStore("configurations");
}

async function saveConfiguration(data: { buildCode: string; price: number; spec: string; state: unknown }) {
  const id = String(Date.now());
  const row = {
    id,
    build_code: data.buildCode,
    price: data.price,
    spec: data.spec,
    state: data.state,
    created_at: new Date().toISOString()
  };
  await store().setJSON(id, row);
  return row;
}

async function listConfigurations(limit = 50) {
  const { blobs } = await store().list();
  const ids = blobs.map((b) => b.key).sort((a, b) => Number(b) - Number(a)).slice(0, limit);
  const rows = await Promise.all(ids.map((id) => store().get(id, { type: "json" })));
  return rows.filter(Boolean);
}

const encoder = new TextEncoder();

function envGet(key: string) {
  try {
    const n = (globalThis as { Netlify?: { env?: { get?: (k: string) => string | undefined } } }).Netlify;
    const fromNetlify = n?.env?.get?.(key);
    if (fromNetlify) return fromNetlify;
  } catch {
    /* not an Edge runtime */
  }
  const fromProcess = typeof process !== "undefined" ? process.env?.[key] : undefined;
  return fromProcess || "";
}

function secret() {
  return String(envGet("SESSION_SECRET") || envGet("CUSTOMER_ACCESS_CODE") || "ds-session");
}

async function hmac(text: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(text));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function cookie(request: Request, name: string) {
  const raw = request.headers.get("cookie") || "";
  for (const p of raw.split(/;\s*/)) {
    const i = p.indexOf("=");
    if (i > 0 && p.slice(0, i) === name) return p.slice(i + 1);
  }
  return "";
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

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

export default async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("", { status: 204 });
  if (!(await validSession(request))) return json({ error: "Not signed in." }, 401);

  if (request.method === "GET") {
    try {
      const url = new URL(request.url);
      const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200);
      return json(await listConfigurations(limit));
    } catch (err) {
      console.error("[Blobs] list failed:", err);
      return json({ error: "Could not load configurations." }, 500);
    }
  }

  if (request.method === "POST") {
    let body: { buildCode?: string; price?: number; spec?: string; state?: unknown } = {};
    try {
      body = await request.json();
    } catch {
      return json({ error: "Malformed JSON body." }, 400);
    }
    const { buildCode, price, spec, state } = body;
    if (!buildCode || typeof price !== "number" || !spec || !state) {
      return json({ error: "Expected { buildCode: string, price: number, spec: string, state: object }." }, 400);
    }
    try {
      return json(await saveConfiguration({ buildCode, price, spec, state }), 201);
    } catch (err) {
      console.error("[Blobs] save failed:", err);
      return json({ error: "Could not save configuration." }, 500);
    }
  }

  return json({ error: "Method not allowed." }, 405);
};

export const config = { path: "/api/configurations" };
