import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK = 'https://dstech.bitrix24.com.br/rest/69/04xla54jit6aesgn'
const BOT_ID = '247'
const DIALOG_ID = 'chat6401'
const GPS_URL = 'https://bot-location.vercel.app/gps-tracker.html'

async function botMessage(endpoint: string, accessToken: string, dialogId: string, message: string) {
  const body = new URLSearchParams({
    BOT_ID,
    DIALOG_ID: dialogId,
    MESSAGE: message,
    URL_PREVIEW: 'Y',
    auth: accessToken,
  })
  const res = await fetch(`${endpoint}imbot.message.add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  return res.json()
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const params = new URLSearchParams(body)

  const event = params.get('event')
  const accessToken = params.get('auth[access_token]') ?? ''
  const clientEndpoint = params.get('auth[client_endpoint]') ?? `${WEBHOOK}/`

  if (event === 'ONIMBOTJOINCHAT') {
    const dialogId = params.get('data[PARAMS][DIALOG_ID]') || DIALOG_ID
    await botMessage(clientEndpoint, accessToken, dialogId,
      '📍 Clique no link para enviar sua localização ao grupo:\n' + GPS_URL)
  }

  return NextResponse.json({ ok: true })
}

// GET manual: abre no browser para disparar uma mensagem de teste
export async function GET() {
  const body = new URLSearchParams({
    BOT_ID,
    DIALOG_ID,
    MESSAGE: '📍 Envie sua localização:\n' + GPS_URL,
    URL_PREVIEW: 'Y',
  })
  const res = await fetch(`${WEBHOOK}/imbot.message.add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  const result = await res.json()
  return NextResponse.json(result)
}
