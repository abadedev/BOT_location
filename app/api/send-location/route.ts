import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK = 'https://dstech.bitrix24.com.br/rest/249/ekxs4uynroohw0ry'
const DEFAULT_DIALOG_ID = 'chat5293'

export async function POST(req: NextRequest) {
  const { technician, technicianId, lat, lng, accuracy, dialogIds, timestamp, infraMotivo, infraCa } = await req.json()

  const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`
  const mention = technicianId ? `[USER=${technicianId}]${technician}[/USER]` : technician
  const motivoLine = infraMotivo && infraCa ? `\n Motivo : ${infraMotivo} - ${infraCa}` : ''
  const message = `📍 Localização\n👤 Colaborador: ${mention}${motivoLine}\n🕐 ${timestamp}\n📏 Precisão: ±${Math.round(accuracy)}m\n🗺️ ${mapsLink}`

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
