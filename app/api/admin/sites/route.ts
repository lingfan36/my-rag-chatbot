import { createClient } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const auth = await requireAdmin()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const supabase = createClient()
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const offset = (page - 1) * limit

  let query = supabase
    .from('sites')
    .select('*, documents(count), usage(message_count)', { count: 'exact' })

  if (search) {
    query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`)
  }

  const { data: sites, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return NextResponse.json({ sites, total: count })
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const supabase = createClient()
  const { id } = await req.json()

  // Delete related data first
  await supabase.from('chat_messages').delete().eq('site_id', id)
  await supabase.from('usage').delete().eq('site_id', id)
  await supabase.from('chunks').delete().in('document_id',
    (await supabase.from('documents').select('id').eq('site_id', id)).data?.map((d: any) => d.id) || []
  )
  await supabase.from('documents').delete().eq('site_id', id)
  await supabase.from('ai_usage_logs').delete().eq('site_id', id)
  const { error } = await supabase.from('sites').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
