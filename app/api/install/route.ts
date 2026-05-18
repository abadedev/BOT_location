import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const domain = searchParams.get('domain')

  if (!code || !domain) {
    return NextResponse.json({ error: 'missing params' }, { status: 400 })
  }

  const res = await fetch(`https://${domain}/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.BITRIX_CLIENT_ID!,
      client_secret: process.env.BITRIX_CLIENT_SECRET!,
      code,
      redirect_uri: process.env.BITRIX_REDIRECT_URI!,
    })
  })

  const data = await res.json()

  if (data.access_token) {
    await redis.set(`bitrix_auth:${domain}`, JSON.stringify({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      domain,
      expires_in: data.expires_in,
      installed_at: Date.now()
    }))
  }

  return NextResponse.redirect(`https://${domain}/marketplace/`)
}
