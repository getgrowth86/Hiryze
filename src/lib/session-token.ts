const textEncoder = new TextEncoder()

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function utf8ToBase64Url(value: string): string {
  return bytesToBase64Url(textEncoder.encode(value))
}

function base64UrlToUtf8(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return new TextDecoder().decode(bytes)
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(data))
  return bytesToBase64Url(new Uint8Array(signature))
}

function sameString(left: string, right: string): boolean {
  if (left.length !== right.length) return false
  let mismatch = 0
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index)
  return mismatch === 0
}

export const SESSION_COOKIE = 'hmc_session'
export const SESSION_MAX_AGE = 60 * 60 * 12

export async function createSessionToken(secret: string, now = Date.now()): Promise<string> {
  const payload = utf8ToBase64Url(JSON.stringify({ v: 1, exp: now + SESSION_MAX_AGE * 1000 }))
  const signature = await hmac(secret, payload)
  return `${payload}.${signature}`
}

export async function verifySessionToken(secret: string, token: string | undefined | null, now = Date.now()): Promise<boolean> {
  if (!secret || !token) return false
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [payload, signature] = parts
  const expected = await hmac(secret, payload)
  if (!sameString(expected, signature)) return false
  try {
    const data = JSON.parse(base64UrlToUtf8(payload)) as { exp?: unknown }
    return typeof data.exp === 'number' && data.exp > now
  } catch {
    return false
  }
}
