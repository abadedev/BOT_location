import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK = 'https://dstech.bitrix24.com.br/rest/69/04xla54jit6aesgn'
const BOT_ID = '247'
const DIALOG_ID = 'chat6401'
const GPS_URL = 'https://bot-location.vercel.app/gps-tracker.html'

async function bitrixCall(method: string, params: Record<string, string>) {
  const body = new URLSearchParams({ ...params, BOT_ID })
  const res = await fetch(`${WEBHOOK}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  })
  return res.json()
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const params = new URLSearchParams(body)
  const event = params.get('event')

  if (event === 'ONIMBOTJOINCHAT') {
    const dialogId = params.get('data[PARAMS][DIALOG_ID]') || DIALOG_ID
    await bitrixCall('imbot.message.add', {
      DIALOG_ID: dialogId,
      MESSAGE: '📍 Clique no link para enviar sua localização ao grupo:\n' + GPS_URL,
      URL_PREVIEW: 'Y'
    })
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const result = await bitrixCall('imbot.message.add', {
    DIALOG_ID,
    MESSAGE: '📍 Envie sua localização:\n' + GPS_URL,
    URL_PREVIEW: 'Y'
  })
  return NextResponse.json(result)
}
