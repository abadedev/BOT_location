import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK = 'https://dstech.bitrix24.com.br/rest/249/ekxs4uynroohw0ry'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const offset = searchParams.get('offset') || '0'
  const limit = searchParams.get('limit') || '20'

  const res = await fetch(
    `${WEBHOOK}/im.search.chat.list.json?SEARCH=${encodeURIComponent(q)}&OFFSET=${offset}&LIMIT=${limit}`
  )
  const data = await res.json()

  const items = (data.result?.chats || data.result || []).map((item: any) => ({
    dialogId: item.type === 'chat' ? 'chat' + item.id : String(item.id),
    name: item.name || item.title,
    avatar: item.avatar || null,
    type: item.type,
    userCounter: item.users || 0,
    counter: 0,
  }))

  return NextResponse.json({
    items,
    next: data.next || null,
  })
}
