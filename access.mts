import { createHmac, timingSafeEqual } from 'node:crypto'
import type { Config, Context } from '@netlify/functions'

const SESSION_SECONDS = 60 * 60 * 24 * 7

function matches(candidate: string, expected: string) {
  const left = Buffer.from(candidate)
  const right = Buffer.from(expected)
  return left.length === right.length && timingSafeEqual(left, right)
}

function sign(timestamp: string, secret: string) {
  return createHmac('sha256', secret).update(timestamp).digest('base64url')
}

export default async (request: Request, _context: Context) => {
  const accessCode = process.env.CUSTOMER_ACCESS_CODE?.trim()
  if (!accessCode) {
    return Response.json(
      { error: 'Access is not configured.' },
      { status: 503, headers: { 'cache-control': 'no-store' } }
    )
  }

  const sessionSecret = process.env.ACCESS_SESSION_SECRET?.trim() || accessCode

  let code = ''
  try {
    const payload = await request.json() as { code?: unknown }
    code = typeof payload.code === 'string' ? payload.code.trim() : ''
  } catch {
    return Response.json(
      { error: 'Invalid request.' },
      { status: 400, headers: { 'cache-control': 'no-store' } }
    )
  }

  if (!matches(code, accessCode)) {
    return Response.json(
      { error: 'Invalid access code.' },
      { status: 401, headers: { 'cache-control': 'no-store' } }
    )
  }

  const timestamp = Math.floor(Date.now() / 1000).toString()
  const session = `${timestamp}.${sign(timestamp, sessionSecret)}`
  return Response.json({ ok: true }, {
    status: 200,
    headers: {
      'cache-control': 'no-store',
      'set-cookie': `scherer_access=${session}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict`
    }
  })
}

export const config: Config = {
  path: '/api/access',
  method: 'POST'
}
