import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { bitrixCall } from '@/lib/bitrix'

const redis = Redis.fromEnv()
const BOT_ID = '247'
const GPS_URL = 'https://bot-location.vercel.app/gps-tracker.html'
const DIALOG_ID = 'chat6401'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const params = new URLSearchParams(body)
  const event = params.get('event')
  const domain = params.get('auth[domain]') || 'dstech.bitrix24.com.br'
  const authToken = params.get('auth[access_token]') || ''

  if (authToken) {
    const saved = await redis.get(`bitrix_auth:${domain}`)
    if (!saved) {
      await redis.set(`bitrix_auth:${domain}`, JSON.stringify({
        access_token: authToken,
        refresh_token: params.get('auth[refresh_token]') || '',
        domain,
        expires_in: parseInt(params.get('auth[expires_in]') || '3600'),
        installed_at: Date.now()
      }))
    }
  }

  const dialogId = params.get('data[PARAMS][DIALOG_ID]') || DIALOG_ID

  if (event === 'ONIMBOTJOINCHAT') {
    await bitrixCall(domain, 'imbot.message.add', {
      BOT_ID,
      DIALOG_ID: dialogId,
      MESSAGE: `📍 Clique para enviar sua localização:\n${GPS_URL}`,
      URL_PREVIEW: 'Y'
    })
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ status: 'online' })
}
