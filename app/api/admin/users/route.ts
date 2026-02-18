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
  const offset = (page - 1) * limit

  // Get distinct users from sites table with their site counts
  const { data: sites } = await supabase
    .from('sites')
    .select('user_id')
    .order('created_at', { ascending: false })

  // Deduplicate user_ids
  const userIds = [...new Set(sites?.map((s: any) => s.user_id) || [])]
  const paginatedIds = userIds.slice(offset, offset + limit)

  // Get site counts per user
  const { data: userSites } = await supabase
    .from('sites')
    .select('user_id, id')
    .in('user_id', paginatedIds)

  // Get document counts per user's sites
  const { data: userDocs } = await supabase
    .from('documents')
    .select('site_id, id')
    .in('site_id', userSites?.map((s: any) => s.id) || [])

  // Get admin status
  const { data: admins } = await supabase
    .from('admin_users')
    .select('user_id, role')

  const adminMap = new Map(admins?.map((a: any) => [a.user_id, a.role]) || [])

  const users = paginatedIds.map(uid => {
    const siteCount = userSites?.filter((s: any) => s.user_id === uid).length || 0
    const siteIds = userSites?.filter((s: any) => s.user_id === uid).map((s: any) => s.id) || []
    const docCount = userDocs?.filter((d: any) => siteIds.includes(d.site_id)).length || 0
    return {
      user_id: uid,
      sites: siteCount,
      documents: docCount,
      role: adminMap.get(uid) || 'user',
    }
  })

  return NextResponse.json({ users, total: userIds.length })
}
