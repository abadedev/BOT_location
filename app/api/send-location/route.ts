import { NextRequest, NextResponse } from 'next/server'
import { bitrixCall } from '@/lib/bitrix'

const BOT_ID = '247'
const DOMAIN = 'dstech.bitrix24.com.br'
const DIALOG_ID = 'chat6401'

export async function POST(req: NextRequest) {
  const { technician, lat, lng, accuracy } = await req.json()

  const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`
  const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const message = `📍 *${technician}* — ${hora}\n🗺️ ${mapsLink}\n📏 Precisão: ±${Math.round(accuracy)}m`

  const result = await bitrixCall(DOMAIN, 'imbot.message.add', {
    BOT_ID,
    DIALOG_ID,
    MESSAGE: message,
    URL_PREVIEW: 'Y'
  })

  if (result.error) {
    return NextResponse.json({ error: result.error_description || result.error }, { status: 400 })
  }

  return NextResponse.json({ ok: true, result })
}
