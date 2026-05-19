import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

const GPS_HTML = (domain: string) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
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

async function getTokenFromAppSid(domain: string, appSid: string) {
  const res = await fetch(`https://${domain}/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.BITRIX_CLIENT_ID!,
      client_secret: process.env.BITRIX_CLIENT_SECRET!,
      app_sid: appSid,
    })
  })
  return res.json()
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const domain = searchParams.get('DOMAIN') || 'dstech.bitrix24.com.br'
  const appSid = searchParams.get('APP_SID') || ''

  if (appSid && domain) {
    try {
      const data = await getTokenFromAppSid(domain, appSid)
      console.log('Token response:', JSON.stringify(data))
      if (data.access_token) {
        await redis.set(`bitrix_auth:${domain}`, JSON.stringify({
          access_token: data.access_token,
          refresh_token: data.refresh_token || '',
          domain,
          expires_in: data.expires_in || 3600,
          installed_at: Date.now()
        }))
      }
    } catch (e) {
      console.error('Token error:', e)
    }
  }

  return new NextResponse(GPS_HTML(domain), {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const domain = searchParams.get('DOMAIN') || 'dstech.bitrix24.com.br'

  return new NextResponse(GPS_HTML(domain), {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}
