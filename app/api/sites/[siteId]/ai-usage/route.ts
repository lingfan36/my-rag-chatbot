import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: { siteId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') || '30')

  const since = new Date()
  since.setDate(since.getDate() - days)

  // Verify site ownership
  const { data: site } = await supabase
    .from('sites')
    .select('id')
    .eq('id', params.siteId)
    .eq('user_id', user.id)
    .single()

  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Get logs
  const { data: logs } = await supabase
    .from('ai_usage_logs')
    .select('*')
    .eq('site_id', params.siteId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
    .limit(200)

  // Aggregate stats
  const totalRequests = logs?.length || 0
  const totalTokens = logs?.reduce((s, l) => s + (l.total_tokens || 0), 0) || 0
  const totalCost = logs?.reduce((s, l) => s + parseFloat(l.estimated_cost || '0'), 0) || 0
  const avgLatency = totalRequests > 0
    ? Math.round((logs?.reduce((s, l) => s + (l.latency_ms || 0), 0) || 0) / totalRequests)
    : 0
  const errorCount = logs?.filter(l => l.status === 'error').length || 0
  const successRate = totalRequests > 0 ? ((totalRequests - errorCount) / totalRequests * 100).toFixed(1) : '100'

  // Model breakdown
  const modelMap: Record<string, { count: number; tokens: number }> = {}
  logs?.forEach(l => {
    const key = l.model || 'unknown'
    if (!modelMap[key]) modelMap[key] = { count: 0, tokens: 0 }
    modelMap[key].count++
    modelMap[key].tokens += l.total_tokens || 0
  })

  // Daily aggregation
  const dailyMap: Record<string, { requests: number; tokens: number; cost: number }> = {}
  logs?.forEach(l => {
    const day = l.created_at.slice(0, 10)
    if (!dailyMap[day]) dailyMap[day] = { requests: 0, tokens: 0, cost: 0 }
    dailyMap[day].requests++
    dailyMap[day].tokens += l.total_tokens || 0
    dailyMap[day].cost += parseFloat(l.estimated_cost || '0')
  })

  return NextResponse.json({
    stats: { totalRequests, totalTokens, totalCost, avgLatency, errorCount, successRate },
    models: modelMap,
    daily: dailyMap,
    logs: logs?.slice(0, 50) || [],
  })
}
