import type { Config, Context } from '@netlify/edge-functions'

const SESSION_SECONDS = 60 * 60 * 24 * 7

function decodeBase64Url(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4)
  return Uint8Array.from(atob(padded), character => character.charCodeAt(0))
}

async function validSession(session: string | undefined, secret: string) {
  if (!session) return false
  const [timestamp, signature, extra] = session.split('.')
  if (!timestamp || !signature || extra) return false
  const issuedAt = Number(timestamp)
  const now = Math.floor(Date.now() / 1000)
  if (!Number.isInteger(issuedAt) || issuedAt > now + 60 || now - issuedAt > SESSION_SECONDS) return false

  try {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
    return crypto.subtle.verify('HMAC', key, decodeBase64Url(signature), new TextEncoder().encode(timestamp))
  } catch {
    return false
  }
}

export default async (request: Request, context: Context) => {
  const secret = Netlify.env.get('ACCESS_SESSION_SECRET') || Netlify.env.get('CUSTOMER_ACCESS_CODE')
  if (secret && await validSession(context.cookies.get('scherer_access'), secret)) return
  return Response.redirect(new URL('/access.html', request.url), 302)
}

export const config: Config = {
  path: '/'
}
