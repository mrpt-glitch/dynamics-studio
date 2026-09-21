const encoder = new TextEncoder();

function secret() {
  return String(
    Netlify.env.get("SESSION_SECRET") ||
    Netlify.env.get("CUSTOMER_ACCESS_CODE") ||
    "ds-session"
  );
}

async function hmac(text) {
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

export default async (request) => {
  if (request.method === "OPTIONS") return new Response("", { status: 204 });
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  let body = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }
  const expected = String(
    Netlify.env.get("CUSTOMER_ACCESS_CODE") ||
    Netlify.env.get("ACCESS_CODE") ||
    ""
  ).trim();
  if (!expected) {
    return new Response(JSON.stringify({ ok: false, error: "not_configured" }), {
      status: 503,
      headers: { "content-type": "application/json" }
    });
  }
  const given = String(body.code || "").trim();
  if (given !== expected) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 401,
      headers: { "content-type": "application/json" }
    });
  }
  const issued = String(Date.now());
  const token = issued + "." + (await hmac(issued));
  const headers = new Headers({ "content-type": "application/json" });
  headers.append(
    "set-cookie",
    `ds_session=${token}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax`
  );
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};

export const config = { path: "/api/access" };
