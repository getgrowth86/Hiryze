import { createSign } from 'crypto'

type ServiceAccount = { client_email: string; private_key: string }

export type GoogleTokenResult = { ok: true; token: string } | { ok: false; error: string }

let tokenCache: { token: string; exp: number } | null = null

export function loadServiceAccount(): ServiceAccount | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw || !raw.trim()) return null
  try {
    let text = raw.trim()
    if (!text.startsWith('{')) text = Buffer.from(text, 'base64').toString('utf8')
    const parsed = JSON.parse(text) as { client_email?: string; private_key?: string }
    if (!parsed.client_email || !parsed.private_key) return null
    return {
      client_email: parsed.client_email,
      private_key: parsed.private_key.includes('\\n')
        ? parsed.private_key.replace(/\\n/g, '\n')
        : parsed.private_key,
    }
  } catch {
    return null
  }
}

function signJwt(account: ServiceAccount, now: number): string {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claim = Buffer.from(JSON.stringify({
    iss: account.client_email,
    scope: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/analytics.readonly',
    ].join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).toString('base64url')
  const unsigned = `${header}.${claim}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsigned)
  return `${unsigned}.${signer.sign(account.private_key).toString('base64url')}`
}

export async function getGoogleAccessToken(): Promise<GoogleTokenResult> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim()) {
    return { ok: false, error: 'GOOGLE_SERVICE_ACCOUNT_JSON fehlt' }
  }
  const account = loadServiceAccount()
  if (!account) return { ok: false, error: 'GOOGLE_SERVICE_ACCOUNT_JSON ist kein gültiges Service-Account-JSON' }
  const now = Math.floor(Date.now() / 1000)
  if (tokenCache && tokenCache.exp - 90 > now) return { ok: true, token: tokenCache.token }
  let response: Response
  try {
    response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: signJwt(account, now),
      }),
      cache: 'no-store',
    })
  } catch {
    return { ok: false, error: 'Google-Token-Endpunkt nicht erreichbar' }
  }
  if (!response.ok) return { ok: false, error: `Google-Token abgelehnt (HTTP ${response.status})` }
  const json = (await response.json()) as { access_token?: string; expires_in?: number }
  if (!json.access_token) return { ok: false, error: 'Google-Token ohne Zugriffsschlüssel' }
  tokenCache = { token: json.access_token, exp: now + (json.expires_in ?? 3600) }
  return { ok: true, token: json.access_token }
}
