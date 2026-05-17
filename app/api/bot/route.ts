import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const BOT_ID = '247'
const DIALOG_ID = 'chat6401'
const GPS_URL = 'https://bot-location.vercel.app/gps-tracker.html'

async function bitrixCall(domain: string, authToken: string, method: string, params: Record<string, string>) {
  const body = new URLSearchParams({ ...params, BOT_ID, auth: authToken })
  const res = await fetch(`https://${domain}/rest/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  })
  return res.json()
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const params = new URLSearchParams(body)

  const allFields: Record<string, string> = {}
  params.forEach((v, k) => { allFields[k] = v })
  console.log('BOT EVENT PAYLOAD:', JSON.stringify(allFields))

  const event = params.get('event')
  const domain = params.get('auth[domain]') || 'dstech.bitrix24.com.br'
  const authToken = params.get('auth[access_token]') || ''
  const appToken = params.get('auth[application_token]') || ''

  const tokenToSave = authToken || appToken
  if (tokenToSave) {
    await redis.set('bitrix_auth', JSON.stringify({ domain, authToken: tokenToSave }))
    console.log('Redis saved with token:', tokenToSave.slice(0, 8) + '...')
  } else {
    console.log('No token found in payload')
  }

  const dialogId = params.get('data[PARAMS][DIALOG_ID]') || DIALOG_ID

  if (event === 'ONIMBOTJOINCHAT' || event === 'ONIMBOTMESSAGEADD') {
    await bitrixCall(domain, tokenToSave, 'imbot.message.add', {
      DIALOG_ID: dialogId,
      MESSAGE: '📍 Clique para enviar sua localização:\n' + GPS_URL,
      URL_PREVIEW: 'Y'
    })
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const saved = await redis.get('bitrix_auth')
  return NextResponse.json({ status: 'online', redis_has_token: !!saved })
}
