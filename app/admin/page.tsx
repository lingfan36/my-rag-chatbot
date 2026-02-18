import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = createClient()

  const [
    { count: siteCount },
    { count: docCount },
    { count: messageCount },
    { data: recentSites },
    { data: recentMessages },
  ] = await Promise.all([
    supabase.from('sites').select('*', { count: 'exact', head: true }),
    supabase.from('documents').select('*', { count: 'exact', head: true }),
    supabase.from('chat_messages').select('*', { count: 'exact', head: true }),
    supabase.from('sites').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('chat_messages').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  // Get distinct user count
  const { data: allSites } = await supabase.from('sites').select('user_id')
  const userCount = new Set(allSites?.map((s: any) => s.user_id) || []).size

  // Usage this month
  const month = new Date().toISOString().slice(0, 7)
  const { data: monthlyUsage } = await supabase
    .from('usage')
    .select('message_count')
    .eq('month', month)
  const totalMessagesThisMonth = monthlyUsage?.reduce((sum: number, u: any) => sum + (u.message_count || 0), 0) || 0

  const stats = [
    { label: 'Total Users', value: userCount, color: 'from-blue-500 to-indigo-500', bgColor: 'bg-blue-50', textColor: 'text-blue-600', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
    { label: 'Total Sites', value: siteCount || 0, color: 'from-emerald-500 to-teal-500', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600', icon: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418' },
    { label: 'Total Documents', value: docCount || 0, color: 'from-violet-500 to-purple-500', bgColor: 'bg-violet-50', textColor: 'text-violet-600', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
    { label: 'Messages (Total)', value: messageCount || 0, color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-50', textColor: 'text-amber-600', icon: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Admin Dashboard</h1>
        <p className="text-[13px] text-muted-foreground mt-1">System overview and quick stats</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="card-elevated rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-[10px] ${stat.bgColor} flex items-center justify-center ${stat.textColor}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </div>
              <div>
                <div className="text-[12px] text-muted-foreground">{stat.label}</div>
                <div className="text-xl font-bold text-foreground">{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* This Month */}
      <div className="card-elevated rounded-xl p-5 mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-9 w-9 rounded-[10px] bg-rose-50 flex items-center justify-center text-rose-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <div>
            <div className="text-[12px] text-muted-foreground">Messages This Month ({month})</div>
            <div className="text-xl font-bold text-foreground">{totalMessagesThisMonth}</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Sites */}
        <div className="card-elevated rounded-xl">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="text-sm font-semibold text-foreground">Recent Sites</h2>
            <Link href="/admin/sites" className="text-[12px] text-primary hover:underline">View all</Link>
          </div>
          <div className="px-5 pb-5 space-y-2">
            {recentSites?.length === 0 && (
              <p className="text-[13px] text-muted-foreground py-4 text-center">No sites yet</p>
            )}
            {recentSites?.map((site: any) => (
              <div key={site.id} className="flex items-center justify-between rounded-[8px] bg-muted/30 px-3 py-2.5">
                <div>
                  <div className="text-[13px] font-medium text-foreground">{site.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{site.slug}</div>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {new Date(site.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="card-elevated rounded-xl">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="text-sm font-semibold text-foreground">Recent Messages</h2>
            <Link href="/admin/messages" className="text-[12px] text-primary hover:underline">View all</Link>
          </div>
          <div className="px-5 pb-5 space-y-2">
            {recentMessages?.length === 0 && (
              <p className="text-[13px] text-muted-foreground py-4 text-center">No messages yet</p>
            )}
            {recentMessages?.map((msg: any) => (
              <div key={msg.id} className="rounded-[8px] bg-muted/30 px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                    msg.role === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {msg.role}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-[13px] text-foreground line-clamp-2">{msg.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
