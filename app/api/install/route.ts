import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const CLIENT_ID = process.env.BITRIX_CLIENT_ID!
const CLIENT_SECRET = process.env.BITRIX_CLIENT_SECRET!
const GPS_URL = 'https://bot-location.vercel.app/gps-tracker.html'

const GPS_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Enviar Localização</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0a0a0a; }
iframe { width: 100%; height: 100vh; border: none; display: block; }
</style>
</head>
<body>
<iframe src="${GPS_URL}" allow="geolocation *"></iframe>
</body>
</html>`

async function getToken(domain: string, appSid: string) {
  const res = await fetch(`https://${domain}/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      app_sid: appSid,
    })
  })
  return res.json()
}

async function registerMobilePlacement(domain: string, token: string) {
  const body = new URLSearchParams({
    auth: token,
    PLACEMENT: 'MOBILE_NAVIGATION_MENU',
    HANDLER: `https://bot-location.vercel.app/api/install`,
    TITLE: '📍 Enviar Localização',
  })
  const res = await fetch(`https://${domain}/rest/placement.bind`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  })
  const data = await res.json()
  console.log('placement.bind result:', JSON.stringify(data))
  return data
}

async function registerToolbarPlacement(domain: string, token: string) {
  const body = new URLSearchParams({
    auth: token,
    PLACEMENT: 'IM_TOOLBAR',
    HANDLER: 'https://bot-location.vercel.app/gps-tracker.html',
    TITLE: 'Enviar GPS',
  })
  const res = await fetch(`https://${domain}/rest/placement.bind`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  })
  const data = await res.json()
  console.log('toolbar placement.bind result:', JSON.stringify(data))
  return data
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const domain = searchParams.get('DOMAIN') || 'dstech.bitrix24.com.br'
  const appSid = searchParams.get('APP_SID') || ''

  console.log('Install POST - domain:', domain, 'appSid:', appSid)

  if (appSid && domain) {
    try {
      const tokenData = await getToken(domain, appSid)
      console.log('Token data:', JSON.stringify(tokenData))

      if (tokenData.access_token) {
        await redis.set(`bitrix_auth:${domain}`, JSON.stringify({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || '',
          domain,
          expires_in: tokenData.expires_in || 3600,
          installed_at: Date.now()
        }))

        await registerMobilePlacement(domain, tokenData.access_token)
        await registerToolbarPlacement(domain, tokenData.access_token)
      }
    } catch (e) {
      console.error('Install error:', e)
    }
  }

  return new NextResponse(GPS_HTML, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const domain = searchParams.get('DOMAIN') || 'dstech.bitrix24.com.br'
  const appSid = searchParams.get('APP_SID') || ''

  if (appSid && domain) {
    try {
      const tokenData = await getToken(domain, appSid)
      if (tokenData.access_token) {
        await redis.set(`bitrix_auth:${domain}`, JSON.stringify({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || '',
          domain,
          expires_in: tokenData.expires_in || 3600,
          installed_at: Date.now()
        }))
        await registerMobilePlacement(domain, tokenData.access_token)
        await registerToolbarPlacement(domain, tokenData.access_token)
      }
    } catch (e) {
      console.error('Install GET error:', e)
    }
  }

  return new NextResponse(GPS_HTML, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}
