import { createClient } from '@/lib/supabase-server'

export default async function AdminUsersPage() {
  const supabase = createClient()

  // Get all sites to derive users
  const { data: allSites } = await supabase.from('sites').select('user_id, id, name, created_at')
  const { data: allDocs } = await supabase.from('documents').select('site_id, id')
  const { data: admins } = await supabase.from('admin_users').select('user_id, role')

  const adminMap = new Map(admins?.map((a: any) => [a.user_id, a.role]) || [])
  const userMap = new Map<string, { sites: any[]; docCount: number }>()

  for (const site of allSites || []) {
    if (!userMap.has(site.user_id)) {
      userMap.set(site.user_id, { sites: [], docCount: 0 })
    }
    const entry = userMap.get(site.user_id)!
    entry.sites.push(site)
    entry.docCount += allDocs?.filter((d: any) => d.site_id === site.id).length || 0
  }

  const users = Array.from(userMap.entries()).map(([userId, data]) => ({
    userId,
    siteCount: data.sites.length,
    docCount: data.docCount,
    role: adminMap.get(userId) || 'user',
    firstSiteCreated: data.sites.sort((a: any, b: any) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )[0]?.created_at,
  }))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Users</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Manage all users in the system</p>
      </div>

      <div className="card-elevated rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">User ID</th>
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">Role</th>
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">Sites</th>
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">Documents</th>
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[13px] text-muted-foreground">
                  No users found
                </td>
              </tr>
            )}
            {users.map(user => (
              <tr key={user.userId} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-5 py-3">
                  <span className="text-[12px] font-mono text-muted-foreground">{user.userId.slice(0, 8)}...</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    user.role === 'super_admin'
                      ? 'bg-red-100 text-red-700'
                      : user.role === 'admin'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-[13px] text-foreground">{user.siteCount}</td>
                <td className="px-5 py-3 text-[13px] text-foreground">{user.docCount}</td>
                <td className="px-5 py-3 text-[12px] text-muted-foreground">
                  {user.firstSiteCreated ? new Date(user.firstSiteCreated).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
