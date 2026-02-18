import { createClient } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const supabase = createClient()

  const [
    { count: userCount },
    { count: siteCount },
    { count: docCount },
    { count: messageCount },
  ] = await Promise.all([
    supabase.from('admin_users').select('*', { count: 'exact', head: true }).then(() =>
      // Count from auth.users is not possible via client, so count sites' distinct user_ids
      supabase.from('sites').select('user_id', { count: 'exact', head: true })
    ),
    supabase.from('sites').select('*', { count: 'exact', head: true }),
    supabase.from('documents').select('*', { count: 'exact', head: true }),
    supabase.from('chat_messages').select('*', { count: 'exact', head: true }),
  ])

  // Recent signups - get from sites (user_id)
  const { data: recentSites } = await supabase
    .from('sites')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  // Usage this month
  const month = new Date().toISOString().slice(0, 7)
  const { data: monthlyUsage } = await supabase
    .from('usage')
    .select('message_count')
    .eq('month', month)

  const totalMessagesThisMonth = monthlyUsage?.reduce((sum: number, u: any) => sum + (u.message_count || 0), 0) || 0

  return NextResponse.json({
    stats: {
      users: userCount || 0,
      sites: siteCount || 0,
      documents: docCount || 0,
      messages: messageCount || 0,
      messagesThisMonth: totalMessagesThisMonth,
    },
    recentSites,
  })
}
