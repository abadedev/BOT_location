import { NextResponse } from 'next/server'

const WEBHOOK = 'https://dstech.bitrix24.com.br/rest/249/ekxs4uynroohw0ry'

export async function GET() {
  const results: any[] = []

  const placements = [
    {
      PLACEMENT: 'IM_TOOLBAR',
      HANDLER: 'https://bot-location.vercel.app/gps-tracker.html',
      TITLE: 'Enviar GPS',
    },
    {
      PLACEMENT: 'MOBILE_NAVIGATION_MENU',
      HANDLER: 'https://bot-location.vercel.app/gps-tracker.html',
      TITLE: 'Enviar GPS',
    },
  ]

  for (const p of placements) {
    const body = new URLSearchParams(p)
    const res = await fetch(`${WEBHOOK}/placement.bind`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    })
    const data = await res.json()
    results.push({ placement: p.PLACEMENT, result: data })
  }

  return NextResponse.json({ ok: true, results })
}
