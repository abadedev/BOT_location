import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const WEBHOOK = 'https://dstech.bitrix24.com.br/rest/69/s8bbsedmo961dm9v'
const DEFAULT_DIALOG_ID = 'chat6401'

export async function POST(req: NextRequest) {
  const { technician, lat, lng, accuracy, dialogIds } = await req.json()

  const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`
  const horario = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const message = `📍 Localização do Técnico\n👤 Técnico: ${technician}\n🕐 Horário: ${horario}\n📏 Precisão: ${Math.round(accuracy)}m\n🗺️ ${mapsLink}`

  const chats = dialogIds && dialogIds.length > 0 ? dialogIds : [DEFAULT_DIALOG_ID]

  const results = await Promise.all(chats.map(async (dialogId: string) => {
    const body = new URLSearchParams({ DIALOG_ID: dialogId, MESSAGE: message, URL_PREVIEW: 'Y' })
    const res = await fetch(`${WEBHOOK}/im.message.add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    })
    return res.json()
  }))

  return NextResponse.json({ ok: true, results })
}
