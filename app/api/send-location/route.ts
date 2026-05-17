import { NextRequest, NextResponse } from 'next/server'

const USER_WEBHOOK = 'https://dstech.bitrix24.com.br/rest/69/s8bbsedmo961dm9v'
const DIALOG_ID = 'chat6401'

export async function POST(req: NextRequest) {
  const { technician, lat, lng, accuracy } = await req.json()

  const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`
  const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const message = `📍 *${technician}* — ${hora}\n🗺️ ${mapsLink}\n📏 Precisão: ±${Math.round(accuracy)}m`

  const body = new URLSearchParams({ DIALOG_ID, MESSAGE: message, URL_PREVIEW: 'Y' })
  const res = await fetch(`${USER_WEBHOOK}/im.message.add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  })
  const result = await res.json()
  return NextResponse.json(result)
}
