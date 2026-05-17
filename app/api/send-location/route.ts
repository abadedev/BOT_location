import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const BOT_ID = '247'
const DIALOG_ID = 'chat6401'

export async function POST(req: NextRequest) {
  const { technician, lat, lng, accuracy } = await req.json()

  const saved = await redis.get<{ domain: string; authToken: string }>('bitrix_auth')
  if (!saved) {
    return NextResponse.json({ error: 'token não disponível' }, { status: 503 })
  }

  const { domain, authToken } = saved
  const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`
  const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const message = `📍 *${technician}* — ${hora}\n🗺️ ${mapsLink}\n📏 Precisão: ±${Math.round(accuracy)}m`

  const body = new URLSearchParams({ BOT_ID, auth: authToken, DIALOG_ID, MESSAGE: message, URL_PREVIEW: 'Y' })
  const res = await fetch(`https://${domain}/rest/imbot.message.add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  })
  const result = await res.json()
  return NextResponse.json(result)
}
