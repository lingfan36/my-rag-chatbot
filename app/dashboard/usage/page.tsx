import { createClient } from '@/lib/supabase-server'

export default async function UsagePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const month = new Date().toISOString().slice(0, 7)

  const { data: usage } = await supabase
    .from('usage')
    .select('*, sites(name)')
    .eq('user_id', user!.id)
    .eq('month', month)

  const totalMessages = (usage || []).reduce((sum: number, u: any) => sum + (u.message_count || 0), 0)

  const { data: sites } = await supabase
    .from('sites')
    .select('id, name')
    .eq('user_id', user!.id)

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight mb-1 text-foreground">Usage &amp; Billing</h1>
      <p className="text-[13px] text-muted-foreground mb-8">Current period: {month}</p>

      <div className="grid gap-4 md:grid-cols-3 mb-10">
        <div className="card-elevated rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-[10px] gradient-bg-subtle flex items-center justify-center text-primary/60">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
            </div>
            <div className="text-[13px] text-muted-foreground">Total Messages</div>
          </div>
          <div className="text-2xl font-bold text-foreground">{totalMessages}</div>
          <div className="text-xs text-muted-foreground mt-1">this month</div>
        </div>
        <div className="card-elevated rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-[10px] bg-violet-50 flex items-center justify-center text-violet-500">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
            </div>
            <div className="text-[13px] text-muted-foreground">Active Sites</div>
          </div>
          <div className="text-2xl font-bold text-foreground">{sites?.length || 0}</div>
        </div>
        <div className="card-elevated rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-[10px] bg-emerald-50 flex items-center justify-center text-emerald-500">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>
            </div>
            <div className="text-[13px] text-muted-foreground">Current Plan</div>
          </div>
          <div className="text-2xl font-bold text-foreground">Free</div>
          <div className="text-xs text-muted-foreground mt-1">100 messages/mo</div>
        </div>
      </div>

      <h2 className="text-base font-semibold mb-4 text-foreground">Usage by Site</h2>
      {!usage || usage.length === 0 ? (
        <div className="card-elevated rounded-xl p-10 text-center text-[13px] text-muted-foreground">
          No usage data yet for this month.
        </div>
      ) : (
        <div className="card-elevated rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-[13px] font-medium text-muted-foreground bg-muted/30">Site</th>
                <th className="text-left px-5 py-3 text-[13px] font-medium text-muted-foreground bg-muted/30">Messages</th>
              </tr>
            </thead>
            <tbody>
              {usage.map((u: any) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{u.sites?.name || u.site_id}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{u.message_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
