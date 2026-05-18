import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

interface BitrixAuth {
  access_token: string
  refresh_token: string
  domain: string
  expires_in: number
  installed_at: number
}

export async function getAuth(domain: string): Promise<BitrixAuth | null> {
  const saved = await redis.get<BitrixAuth>(`bitrix_auth:${domain}`)
  if (!saved) return null

  const age = (Date.now() - saved.installed_at) / 1000
  if (age > saved.expires_in - 300) {
    return await refreshAuth(saved)
  }

  return saved
}

async function refreshAuth(auth: BitrixAuth): Promise<BitrixAuth | null> {
  const res = await fetch(`https://${auth.domain}/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.BITRIX_CLIENT_ID!,
      client_secret: process.env.BITRIX_CLIENT_SECRET!,
      refresh_token: auth.refresh_token,
    })
  })

  const data = await res.json()
  if (!data.access_token) return null

  const updated: BitrixAuth = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    domain: auth.domain,
    expires_in: data.expires_in,
    installed_at: Date.now()
  }

  await redis.set(`bitrix_auth:${auth.domain}`, JSON.stringify(updated))
  return updated
}

export async function bitrixCall(domain: string, method: string, params: Record<string, string>) {
  const auth = await getAuth(domain)
  if (!auth) throw new Error('not_installed')

  const body = new URLSearchParams({ ...params, auth: auth.access_token })
  const res = await fetch(`https://${domain}/rest/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  })
  return res.json()
}
