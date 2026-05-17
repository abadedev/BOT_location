import { NextRequest, NextResponse } from 'next/server'

const BOT_ID = '247'
const DIALOG_ID = 'chat6401'
const GPS_URL = 'https://bot-location.vercel.app/gps-tracker.html'

async function bitrixCall(domain: string, authToken: string, method: string, params: Record<string, string>) {
  const body = new URLSearchParams({ ...params, BOT_ID, auth: authToken })
  console.log('bitrixCall', method, Object.fromEntries(body))
  const res = await fetch(`https://${domain}/rest/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  })
  const json = await res.json()
  console.log('bitrixCall result', JSON.stringify(json))
  return json
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  console.log('RAW BODY:', body)
  const params = new URLSearchParams(body)
  const event = params.get('event')
  const domain = params.get('auth[domain]') || 'dstech.bitrix24.com.br'
  const authToken = params.get('auth[access_token]') || ''
  const dialogId = params.get('data[PARAMS][DIALOG_ID]') || DIALOG_ID
  console.log('EVENT:', event, 'DOMAIN:', domain, 'TOKEN:', authToken, 'DIALOG:', dialogId)
  if (event === 'ONIMBOTJOINCHAT' || event === 'ONIMBOTMESSAGEADD') {
    const result = await bitrixCall(domain, authToken, 'imbot.message.add', {
      DIALOG_ID: dialogId,
      MESSAGE: '📍 Clique para enviar sua localização:\n' + GPS_URL,
      URL_PREVIEW: 'Y'
    })
    return NextResponse.json({ ok: true, result })
  }
  console.log('Evento não tratado:', event)
  return NextResponse.json({ ok: false, event })
}

export async function GET() {
  return NextResponse.json({ status: 'bot handler online' })
}
