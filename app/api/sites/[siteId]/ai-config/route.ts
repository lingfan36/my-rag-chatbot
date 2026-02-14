import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

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
