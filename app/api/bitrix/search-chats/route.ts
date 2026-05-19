import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK = 'https://dstech.bitrix24.com.br/rest/249/ekxs4uynroohw0ry'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const offset = parseInt(searchParams.get('offset') || '0')
  const limit = parseInt(searchParams.get('limit') || '20')

  const [usersRes, chatsRes] = await Promise.all([
    fetch(`${WEBHOOK}/user.search.json?NAME=${encodeURIComponent(q)}&LIMIT=${limit}&OFFSET=${offset}`),
    fetch(`${WEBHOOK}/im.recent.list.json?LIMIT=100`),
  ])

  const usersData = await usersRes.json()
  const chatsData = await chatsRes.json()

  const items: any[] = []

  if (Array.isArray(usersData.result)) {
    for (const user of usersData.result) {
      const name = [user.NAME, user.LAST_NAME].filter(Boolean).join(' ')
      items.push({
        dialogId: String(user.ID),
        name,
        avatar: user.PERSONAL_PHOTO || null,
        type: 'user',
        userCounter: 1,
        counter: 0,
      })
    }
  }

  if (chatsData.result?.items) {
    const term = q.toLowerCase()
    for (const item of chatsData.result.items) {
      if (item.type === 'chat' && (item.title || item.name || '').toLowerCase().includes(term)) {
        items.push({
          dialogId: 'chat' + item.id,
          name: item.title || item.name,
          avatar: null,
          type: 'chat',
          userCounter: 0,
          counter: item.counter || 0,
        })
      }
    }
  }

  return NextResponse.json({ items, next: null })
}
