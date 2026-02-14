'use client'

import { useEffect, useState } from 'react'

interface Stats {
  totalRequests: number
  totalTokens: number
  totalCost: number
  avgLatency: number
  errorCount: number
  successRate: string
}

interface LogEntry {
  id: string
  model: string
  provider: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  latency_ms: number
  estimated_cost: string
  status: string
  error_message: string | null
  created_at: string
}

interface UsageData {
  stats: Stats
  models: Record<string, { count: number; tokens: number }>
  daily: Record<string, { requests: number; tokens: number; cost: number }>
  logs: LogEntry[]
}

export function AiMonitorPanel({ siteId }: { siteId: string }) {
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/sites/${siteId}/ai-usage?days=${days}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [siteId, days])

  if (loading) {
    return (
      <div className="card-elevated rounded-xl p-10 text-center text-[13px] text-muted-foreground">
        Loading AI usage data...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="card-elevated rounded-xl p-10 text-center text-[13px] text-muted-foreground">
        Failed to load AI usage data.
      </div>
    )
  }

  const { stats, models, daily, logs } = data
  const dailyEntries = Object.entries(daily).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="space-y-6">
      {/* Time range selector */}
      <div className="flex items-center gap-2">
        <span className="text-[13px] text-muted-foreground">Period:</span>
        {[7, 14, 30].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-colors ${
              days === d
                ? 'bg-primary text-white'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {d}D
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Requests" value={stats.totalRequests.toLocaleString()} color="blue" />
        <StatCard label="Total Tokens" value={formatTokens(stats.totalTokens)} color="violet" />
        <StatCard label="Est. Cost" value={`$${stats.totalCost.toFixed(4)}`} color="emerald" />
        <StatCard label="Avg Latency" value={`${stats.avgLatency}ms`} color="amber" />
        <StatCard label="Success Rate" value={`${stats.successRate}%`} color="green" />
        <StatCard label="Errors" value={stats.errorCount.toString()} color="red" />
      </div>

      {/* Model Breakdown */}
      {Object.keys(models).length > 0 && (
        <div className="card-elevated rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-foreground mb-3">Model Usage</h3>
          <div className="space-y-2">
            {Object.entries(models)
              .sort(([, a], [, b]) => b.count - a.count)
              .map(([model, info]) => {
                const pct = stats.totalRequests > 0 ? (info.count / stats.totalRequests * 100) : 0
                return (
                  <div key={model} className="flex items-center gap-3">
                    <div className="text-[12px] font-mono text-foreground/80 w-48 truncate" title={model}>{model}</div>
                    <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
                      <div className="h-full rounded-full bg-primary/60" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[11px] text-muted-foreground w-24 text-right">
                      {info.count} req / {formatTokens(info.tokens)}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Daily Chart (simple bar representation) */}
      {dailyEntries.length > 0 && (
        <div className="card-elevated rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-foreground mb-3">Daily Requests</h3>
          <div className="flex items-end gap-1 h-24">
            {dailyEntries.map(([day, info]) => {
              const maxReq = Math.max(...dailyEntries.map(([, d]) => d.requests))
              const height = maxReq > 0 ? (info.requests / maxReq * 100) : 0
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full rounded-t bg-primary/50 hover:bg-primary/70 transition-colors min-h-[2px]"
                    style={{ height: `${height}%` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-foreground text-background text-[10px] rounded px-2 py-1 whitespace-nowrap z-10">
                    {day}: {info.requests} req, {formatTokens(info.tokens)}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">{dailyEntries[0]?.[0]}</span>
            <span className="text-[10px] text-muted-foreground">{dailyEntries[dailyEntries.length - 1]?.[0]}</span>
          </div>
        </div>
      )}

      {/* Recent Logs Table */}
      <div className="card-elevated rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-[13px] font-semibold text-foreground">Recent AI Calls</h3>
        </div>
        {logs.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-muted-foreground">
            No AI usage logs yet. Logs will appear here once users start chatting.
          </div>
        ) : (
          <div className="max-h-80 overflow-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-muted/30 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Time</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Model</th>
                  <th className="text-right px-4 py-2 text-muted-foreground font-medium">Tokens</th>
                  <th className="text-right px-4 py-2 text-muted-foreground font-medium">Latency</th>
                  <th className="text-right px-4 py-2 text-muted-foreground font-medium">Cost</th>
                  <th className="text-center px-4 py-2 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-t border-border hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 font-mono text-foreground/80 max-w-[200px] truncate" title={log.model}>
                      {log.model || '-'}
                    </td>
                    <td className="px-4 py-2 text-right text-foreground/80">
                      <span title={`Prompt: ${log.prompt_tokens} / Completion: ${log.completion_tokens}`}>
                        {log.total_tokens.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-foreground/80">{log.latency_ms}ms</td>
                    <td className="px-4 py-2 text-right text-foreground/80">${parseFloat(log.estimated_cost).toFixed(4)}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        log.status === 'success'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <div className="card-elevated rounded-xl p-4">
      <div className="text-[11px] text-muted-foreground mb-1">{label}</div>
      <div className={`text-lg font-bold ${colorMap[color]?.split(' ')[1] || 'text-foreground'}`}>{value}</div>
    </div>
  )
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}
