import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const domain = searchParams.get('DOMAIN') || searchParams.get('domain') || ''

  return NextResponse.redirect(
    `https://bot-location.vercel.app/gps-tracker.html?domain=${domain}`
  )
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ ok: true })
}
