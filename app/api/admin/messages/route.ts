import { createClient } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const auth = await requireAdmin()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const supabase = createClient()
  const { searchParams } = new URL(req.url)
  const siteId = searchParams.get('site_id') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = (page - 1) * limit

  let query = supabase
    .from('chat_messages')
    .select('*', { count: 'exact' })

  if (siteId) {
    query = query.eq('site_id', siteId)
  }

  const { data: messages, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return NextResponse.json({ messages, total: count })
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const supabase = createClient()
  const { id } = await req.json()

  const { error } = await supabase.from('chat_messages').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
