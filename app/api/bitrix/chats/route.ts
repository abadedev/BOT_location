import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK = 'https://dstech.bitrix24.com.br/rest/249/ekxs4uynroohw0ry'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lastMessageDate = searchParams.get('lastMessageDate')

  const params = new URLSearchParams({ LIMIT: '50' })
  if (lastMessageDate) params.set('LAST_MESSAGE_DATE', lastMessageDate)

  const res = await fetch(`${WEBHOOK}/im.recent.list.json?${params}`)
  const data = await res.json()

  const items = (data.result?.items || []).map((item: any) => ({
    dialogId: item.type === 'chat' ? 'chat' + item.id : String(item.id),
    name: item.title || item.name,
    avatar: item.avatar || null,
    type: item.type,
    counter: item.counter || 0,
    lastMessageDate: item.message?.date || null,
  }))

  return NextResponse.json({
    items,
    nextCursor: data.result?.hasMore ? items[items.length - 1]?.lastMessageDate : null,
  })
}
