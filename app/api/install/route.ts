import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const domain = searchParams.get('DOMAIN') || searchParams.get('domain') || ''

  const html = `<!DOCTYPE html>
<html>
<head>
<meta http-equiv="refresh" content="0;url=https://bot-location.vercel.app/gps-tracker.html?domain=${domain}">
</head>
<body></body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  console.log('Install POST:', body)
  return NextResponse.json({ ok: true })
}
