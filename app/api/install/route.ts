import { NextRequest, NextResponse } from 'next/server'

const GPS_PAGE = 'https://bot-location.vercel.app/gps-tracker.html'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const domain = searchParams.get('DOMAIN') || searchParams.get('domain') || ''

  return new NextResponse(
    `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
<title>Enviar Localização</title>
<style>
  body { margin: 0; background: #0a0a0a; display: flex; align-items: center; justify-content: center; height: 100vh; }
  iframe { width: 100%; height: 100vh; border: none; }
</style>
</head>
<body>
<iframe src="${GPS_PAGE}?domain=${domain}" allow="geolocation"></iframe>
</body>
</html>`,
    {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }
  )
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ ok: true })
}
