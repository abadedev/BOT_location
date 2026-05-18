import { NextRequest, NextResponse } from 'next/server'
import { bitrixCall } from '@/lib/bitrix'

const BOT_ID = '247'
const DOMAIN = 'dstech.bitrix24.com.br'

export async function POST(req: NextRequest) {
  const { technician, lat, lng, accuracy, dialogIds } = await req.json()

  if (!Array.isArray(dialogIds) || dialogIds.length === 0) {
    return NextResponse.json({ error: 'no_chats_selected' }, { status: 400 })
  }

  const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`
  const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const message = `📍 *${technician}* — ${hora}\n🗺️ ${mapsLink}\n📏 Precisão: ±${Math.round(accuracy)}m`

  const results = await Promise.all(
    dialogIds.map(async (dialogId: string) => {
      const result = await bitrixCall(DOMAIN, 'imbot.message.add', {
        BOT_ID,
        DIALOG_ID: dialogId,
        MESSAGE: message,
        URL_PREVIEW: 'Y'
      })
      return { dialogId, result }
    })
  )

  const failures = results.filter(r => r.result.error)
  if (failures.length === results.length) {
    return NextResponse.json({ error: failures[0].result.error_description || failures[0].result.error, results }, { status: 400 })
  }

  return NextResponse.json({ ok: true, results })
}
