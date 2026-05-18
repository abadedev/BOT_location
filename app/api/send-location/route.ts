import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK = 'https://dstech.bitrix24.com.br/rest/69/s8bbsedmo961dm9v'

export async function POST(req: NextRequest) {
  const { technician, lat, lng, accuracy, dialogIds } = await req.json()

  const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`
  const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const message = `📍 *${technician}* — ${hora}\n🗺️ ${mapsLink}\n📏 Precisão: ±${Math.round(accuracy)}m`

  const chats = dialogIds && dialogIds.length > 0 ? dialogIds : ['chat6401']

  const results = await Promise.all(chats.map(async (dialogId: string) => {
    const body = new URLSearchParams({ DIALOG_ID: dialogId, MESSAGE: message, URL_PREVIEW: 'Y' })
    const res = await fetch(`${WEBHOOK}/im.message.add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    })
    return res.json()
  }))

  const hasError = results.some((r: any) => r.error)
  if (hasError) {
    return NextResponse.json({ error: results }, { status: 400 })
  }

  return NextResponse.json({ ok: true, results })
}
