import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK = 'https://dstech.bitrix24.com.br/rest/69/04xla54jit6aesgn'
const BOT_ID = '247'
const DIALOG_ID = 'chat6401'
const GPS_URL = 'https://bot-location.vercel.app/gps-tracker.html'
const GPS_MESSAGE = '📍 Clique no link para enviar sua localização ao grupo:\n' + GPS_URL

async function sendViaWebhook(dialogId: string, message: string) {
  const body = new URLSearchParams({
    DIALOG_ID: dialogId,
    MESSAGE: message,
    URL_PREVIEW: 'Y',
  })
  const res = await fetch(`${WEBHOOK}/im.message.add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  return res.json()
}

async function sendViaBot(endpoint: string, token: string, dialogId: string, message: string) {
  const body = new URLSearchParams({
    BOT_ID,
    DIALOG_ID: dialogId,
    MESSAGE: message,
    URL_PREVIEW: 'Y',
    auth: token,
  })
  const res = await fetch(`${endpoint}imbot.message.add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  return res.json()
}

export async function POST(req: NextRequest) {
  let rawBody = ''
  try {
    rawBody = await req.text()
  } catch {
    return NextResponse.json({ ok: false, error: 'failed to read body' })
  }

  const params = new URLSearchParams(rawBody)
  const event = params.get('event')
  const accessToken = params.get('auth[access_token]') ?? ''
  const clientEndpoint = params.get('auth[client_endpoint]') ?? `${WEBHOOK}/`
  const dialogId = params.get('data[PARAMS][DIALOG_ID]') || DIALOG_ID

  if (event === 'ONIMBOTJOINCHAT') {
    // tenta via bot auth; se falhar, envia via webhook de usuário
    let result = await sendViaBot(clientEndpoint, accessToken, dialogId, GPS_MESSAGE)
    if (result.error) {
      result = await sendViaWebhook(dialogId, GPS_MESSAGE)
    }
    return NextResponse.json({ ok: true, event, result })
  }

  return NextResponse.json({ ok: true, event: event ?? 'none' })
}

// GET: disparo de teste manual — confirma que a rota está viva
export async function GET() {
  const result = await sendViaWebhook(DIALOG_ID, GPS_MESSAGE)
  return NextResponse.json({ ok: !result.error, result })
}
