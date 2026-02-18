import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { AdminSiteActions } from './site-actions'

export default async function AdminSitesPage() {
  const supabase = createClient()

  const { data: sites } = await supabase
    .from('sites')
    .select('*, documents(count)')
    .order('created_at', { ascending: false })

  // Get usage for current month
  const month = new Date().toISOString().slice(0, 7)
  const { data: usageData } = await supabase
    .from('usage')
    .select('site_id, message_count')
    .eq('month', month)

  const usageMap = new Map(usageData?.map((u: any) => [u.site_id, u.message_count]) || [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Sites</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Manage all knowledge base sites</p>
      </div>

      <div className="card-elevated rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">Name</th>
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">Slug</th>
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">Owner</th>
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">Docs</th>
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">Msgs/Mo</th>
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">Created</th>
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(!sites || sites.length === 0) && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-[13px] text-muted-foreground">
                  No sites found
                </td>
              </tr>
            )}
            {sites?.map((site: any) => (
              <tr key={site.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-5 py-3">
                  <span className="text-[13px] font-medium text-foreground">{site.name}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-[12px] font-mono text-muted-foreground">{site.slug}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-[12px] font-mono text-muted-foreground">{site.user_id.slice(0, 8)}...</span>
                </td>
                <td className="px-5 py-3 text-[13px] text-foreground">{site.documents?.[0]?.count || 0}</td>
                <td className="px-5 py-3 text-[13px] text-foreground">{usageMap.get(site.id) || 0}</td>
                <td className="px-5 py-3 text-[12px] text-muted-foreground">
                  {new Date(site.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">
                  <AdminSiteActions siteId={site.id} siteName={site.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
