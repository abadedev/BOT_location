import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const BOT_ID = '247'
const DIALOG_ID = 'chat6401'
const FALLBACK_WEBHOOK = 'https://dstech.bitrix24.com.br/rest/69/s8bbsedmo961dm9v'

export async function POST(req: NextRequest) {
  const { technician, lat, lng, accuracy } = await req.json()

  const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`
  const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const message = `📍 *${technician}* — ${hora}\n🗺️ ${mapsLink}\n📏 Precisão: ±${Math.round(accuracy)}m`

  const saved = await redis.get<{ domain: string; authToken: string }>('bitrix_auth')

  let url: string
  let body: URLSearchParams

  if (saved?.authToken) {
    const { domain, authToken } = saved
    url = `https://${domain}/rest/imbot.message.add`
    body = new URLSearchParams({ BOT_ID, auth: authToken, DIALOG_ID, MESSAGE: message, URL_PREVIEW: 'Y' })
  } else {
    url = `${FALLBACK_WEBHOOK}/im.message.add`
    body = new URLSearchParams({ DIALOG_ID, MESSAGE: message, URL_PREVIEW: 'Y' })
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  })
  const result = await res.json()
  return NextResponse.json(result)
}
