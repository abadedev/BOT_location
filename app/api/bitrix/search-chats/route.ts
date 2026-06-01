import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK = 'https://dstech.bitrix24.com.br/rest/249/ekxs4uynroohw0ry'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const offset = searchParams.get('offset') || '0'
  const limit = searchParams.get('limit') || '20'

  const items: any[] = []

  // Busca usuários por nome
  const usersRes = await fetch(
    `${WEBHOOK}/user.search.json?NAME=${encodeURIComponent(q)}&LIMIT=${limit}&OFFSET=${offset}`,
    { cache: 'no-store' }
  )
  const usersData = await usersRes.json()

  if (Array.isArray(usersData.result)) {
    for (const user of usersData.result) {
      const name = [user.NAME, user.LAST_NAME].filter(Boolean).join(' ')
      if (name.toLowerCase().includes(q.toLowerCase())) {
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
  }

  // Busca usuários também pelo sobrenome
  const lastNameRes = await fetch(
    `${WEBHOOK}/user.search.json?LAST_NAME=${encodeURIComponent(q)}&LIMIT=${limit}&OFFSET=${offset}`,
    { cache: 'no-store' }
  )
  const lastNameData = await lastNameRes.json()

  if (Array.isArray(lastNameData.result)) {
    for (const user of lastNameData.result) {
      const id = String(user.ID)
      if (items.find(i => i.dialogId === id)) continue
      const name = [user.NAME, user.LAST_NAME].filter(Boolean).join(' ')
      items.push({
        dialogId: id,
        name,
        avatar: user.PERSONAL_PHOTO || null,
        type: 'user',
        userCounter: 1,
        counter: 0,
      })
    }
  }

  return NextResponse.json({
    ok: true,
    items,
    total: items.length,
    next: null,
  })
}
