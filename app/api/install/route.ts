import { NextResponse } from 'next/server'

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<title>Enviar Localização</title>
<style>
body { margin: 0; background: #0a0a0a; }
iframe { width: 100%; height: 100vh; border: none; display: block; }
</style>
</head>
<body>
<iframe src="https://bot-location.vercel.app/gps-tracker.html" allow="geolocation *"></iframe>
</body>
</html>`

const headers = {
  'Content-Type': 'text/html',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'X-Frame-Options': 'ALLOWALL'
}

export async function GET() {
  return new NextResponse(html, { headers })
}

export async function POST() {
  return new NextResponse(html, { headers })
}
