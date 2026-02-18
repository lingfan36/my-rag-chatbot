import { createClient } from '@/lib/supabase-server'

export default async function AdminUsagePage() {
  const supabase = createClient()

  // Get usage data grouped by month
  const { data: usageData } = await supabase
    .from('usage')
    .select('site_id, month, message_count')
    .order('month', { ascending: false })

  // Get site names
  const siteIds = [...new Set(usageData?.map((u: any) => u.site_id) || [])]
  const { data: sites } = await supabase
    .from('sites')
    .select('id, name')
    .in('id', siteIds.length > 0 ? siteIds : ['none'])
  const siteMap = new Map(sites?.map((s: any) => [s.id, s.name]) || [])

  // Aggregate by month
  const monthlyTotals = new Map<string, number>()
  for (const u of usageData || []) {
    monthlyTotals.set(u.month, (monthlyTotals.get(u.month) || 0) + (u.message_count || 0))
  }
  const months = Array.from(monthlyTotals.entries()).sort((a, b) => b[0].localeCompare(a[0]))

  // AI usage logs summary
  const { data: aiLogs } = await supabase
    .from('ai_usage_logs')
    .select('model, provider, prompt_tokens, completion_tokens, total_tokens, estimated_cost, latency_ms, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  // Aggregate AI costs
  const totalCost = aiLogs?.reduce((sum: number, l: any) => sum + (parseFloat(l.estimated_cost) || 0), 0) || 0
  const totalTokens = aiLogs?.reduce((sum: number, l: any) => sum + (l.total_tokens || 0), 0) || 0
  const avgLatency = aiLogs?.length
    ? Math.round(aiLogs.reduce((sum: number, l: any) => sum + (l.latency_ms || 0), 0) / aiLogs.length)
    : 0
  const errorCount = aiLogs?.filter((l: any) => l.status === 'error').length || 0

  // Per-site usage breakdown for current month
  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentMonthUsage = (usageData || [])
    .filter((u: any) => u.month === currentMonth)
    .sort((a: any, b: any) => (b.message_count || 0) - (a.message_count || 0))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Usage & Analytics</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Monitor system usage, AI costs, and activity</p>
      </div>

      {/* AI Usage Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="card-elevated rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[10px] bg-emerald-50 flex items-center justify-center text-emerald-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-[12px] text-muted-foreground">Est. AI Cost (recent)</div>
              <div className="text-xl font-bold text-foreground">${totalCost.toFixed(4)}</div>
            </div>
          </div>
        </div>
        <div className="card-elevated rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[10px] bg-blue-50 flex items-center justify-center text-blue-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div>
              <div className="text-[12px] text-muted-foreground">Total Tokens</div>
              <div className="text-xl font-bold text-foreground">{totalTokens.toLocaleString()}</div>
            </div>
          </div>
        </div>
        <div className="card-elevated rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[10px] bg-violet-50 flex items-center justify-center text-violet-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-[12px] text-muted-foreground">Avg Latency</div>
              <div className="text-xl font-bold text-foreground">{avgLatency}ms</div>
            </div>
          </div>
        </div>
        <div className="card-elevated rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[10px] bg-red-50 flex items-center justify-center text-red-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <div className="text-[12px] text-muted-foreground">Errors</div>
              <div className="text-xl font-bold text-foreground">{errorCount}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Monthly Message Totals */}
        <div className="card-elevated rounded-xl">
          <div className="p-5 pb-3">
            <h2 className="text-sm font-semibold text-foreground">Monthly Messages</h2>
          </div>
          <div className="px-5 pb-5 space-y-2">
            {months.length === 0 && (
              <p className="text-[13px] text-muted-foreground py-4 text-center">No usage data yet</p>
            )}
            {months.map(([month, total]) => (
              <div key={month} className="flex items-center justify-between rounded-[8px] bg-muted/30 px-3 py-2.5">
                <span className="text-[13px] font-medium text-foreground">{month}</span>
                <span className="text-[13px] font-semibold text-foreground">{total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Month Per-Site */}
        <div className="card-elevated rounded-xl">
          <div className="p-5 pb-3">
            <h2 className="text-sm font-semibold text-foreground">This Month by Site ({currentMonth})</h2>
          </div>
          <div className="px-5 pb-5 space-y-2">
            {currentMonthUsage.length === 0 && (
              <p className="text-[13px] text-muted-foreground py-4 text-center">No usage this month</p>
            )}
            {currentMonthUsage.map((u: any) => (
              <div key={u.site_id} className="flex items-center justify-between rounded-[8px] bg-muted/30 px-3 py-2.5">
                <span className="text-[13px] font-medium text-foreground">
                  {siteMap.get(u.site_id) || u.site_id.slice(0, 8)}
                </span>
                <span className="text-[13px] font-semibold text-foreground">{u.message_count?.toLocaleString() || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent AI Logs */}
      <div className="card-elevated rounded-xl overflow-hidden">
        <div className="p-5 pb-3">
          <h2 className="text-sm font-semibold text-foreground">Recent AI Calls (last 100)</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">Model</th>
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">Tokens</th>
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">Cost</th>
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">Latency</th>
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">Status</th>
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {(!aiLogs || aiLogs.length === 0) && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-muted-foreground">
                  No AI usage logs yet
                </td>
              </tr>
            )}
            {aiLogs?.map((log: any, i: number) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-5 py-3">
                  <span className="text-[12px] font-mono text-foreground">{log.model || '-'}</span>
                  {log.provider && <span className="text-[11px] text-muted-foreground ml-1">({log.provider})</span>}
                </td>
                <td className="px-5 py-3 text-[13px] text-foreground">{log.total_tokens?.toLocaleString() || '-'}</td>
                <td className="px-5 py-3 text-[13px] text-foreground">
                  ${parseFloat(log.estimated_cost || 0).toFixed(4)}
                </td>
                <td className="px-5 py-3 text-[13px] text-foreground">{log.latency_ms || '-'}ms</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    log.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-[12px] text-muted-foreground whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
