import { createClient } from '@/lib/supabase-server'

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: { site_id?: string; page?: string }
}) {
  const supabase = createClient()
  const page = parseInt(searchParams.page || '1')
  const limit = 50
  const offset = (page - 1) * limit

  let query = supabase
    .from('chat_messages')
    .select('*', { count: 'exact' })

  if (searchParams.site_id) {
    query = query.eq('site_id', searchParams.site_id)
  }

  const { data: messages, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Get site names for display
  const siteIds = [...new Set(messages?.map((m: any) => m.site_id) || [])]
  const { data: sites } = await supabase.from('sites').select('id, name').in('id', siteIds)
  const siteMap = new Map(sites?.map((s: any) => [s.id, s.name]) || [])

  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Chat Messages</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          View all chat messages across sites
          {searchParams.site_id && <span className="ml-1">(filtered by site)</span>}
        </p>
      </div>

      <div className="card-elevated rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">Role</th>
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">Content</th>
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">Site</th>
              <th className="text-left text-[12px] font-medium text-muted-foreground px-5 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {(!messages || messages.length === 0) && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-[13px] text-muted-foreground">
                  No messages found
                </td>
              </tr>
            )}
            {messages?.map((msg: any) => (
              <tr key={msg.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    msg.role === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {msg.role}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="text-[13px] text-foreground line-clamp-2 max-w-md">{msg.content}</div>
                </td>
                <td className="px-5 py-3">
                  <span className="text-[12px] text-muted-foreground">{siteMap.get(msg.site_id) || msg.site_id.slice(0, 8)}</span>
                </td>
                <td className="px-5 py-3 text-[12px] text-muted-foreground whitespace-nowrap">
                  {new Date(msg.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
            <a
              key={p}
              href={`/admin/messages?page=${p}${searchParams.site_id ? `&site_id=${searchParams.site_id}` : ''}`}
              className={`rounded-[8px] px-3 py-1.5 text-[13px] transition-all ${
                p === page
                  ? 'bg-foreground text-white'
                  : 'text-muted-foreground hover:bg-white hover:text-foreground border border-border'
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
