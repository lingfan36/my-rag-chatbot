import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(_req: Request, { params }: { params: { siteId: string } }) {
  const supabase = supabaseAdmin
  const { data, error } = await supabase
    .from('sites')
    .select('ai_config')
    .eq('id', params.siteId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  const cfg = data?.ai_config || {}
  return NextResponse.json({
    ai_name: cfg.ai_name || null,
    welcome_message: cfg.welcome_message || null,
    brand_color: cfg.brand_color || null,
  })
}

export async function PUT(req: Request, { params }: { params: { siteId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const aiConfig = await req.json()

  const { data, error } = await supabase
    .from('sites')
    .update({ ai_config: aiConfig })
    .eq('id', params.siteId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
