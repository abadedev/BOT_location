import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

const GPS_HTML = (domain: string) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta http-equiv="Cache-Control" content="no-cache">
<title>Enviar Localização</title>
<style>
body { margin: 0; background: #0a0a0a; }
iframe { width: 100%; height: 100vh; border: none; display: block; }
</style>
</head>
<body>
<iframe src="https://bot-location.vercel.app/gps-tracker.html?domain=${domain}" allow="geolocation *"></iframe>
</body>
</html>`

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const domain = searchParams.get('DOMAIN') || searchParams.get('domain') || ''

  if (code && domain) {
    try {
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
    } catch (e) {
      console.error('OAuth error:', e)
    }
  }

  return new NextResponse(GPS_HTML(domain), {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const params = new URLSearchParams(body)
  const domain = params.get('DOMAIN') || params.get('domain') || ''
  const code = params.get('code') || ''

  if (code && domain) {
    try {
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
    } catch (e) {
      console.error('OAuth error:', e)
    }
  }

  return new NextResponse(GPS_HTML(domain), {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}
