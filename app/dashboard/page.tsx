import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { CreateSiteForm } from './create-site-form'
import { DeleteSiteButton } from './delete-site-button'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sites } = await supabase
    .from('sites')
    .select('*, documents(count)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">My Sites</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Manage your knowledge base sites</p>
        </div>
        <CreateSiteForm />
      </div>

      {!sites || sites.length === 0 ? (
        <div className="card-elevated rounded-xl p-16 text-center">
          <div className="mx-auto h-12 w-12 rounded-[10px] gradient-bg-subtle flex items-center justify-center text-primary/60 mb-5">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h3 className="text-base font-semibold mb-1.5 text-foreground">No sites yet</h3>
          <p className="text-[13px] text-muted-foreground max-w-sm mx-auto">Create your first knowledge base site to get started with AI-powered customer support.</p>
        </div>
      ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sites.map((site: any) => (
              <div key={site.id} className="relative group">
                <Link
                  href={`/dashboard/sites/${site.id}`}
                  className="group card-elevated rounded-xl p-5 card-hover block"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-9 w-9 rounded-[10px] gradient-bg-subtle flex items-center justify-center text-primary/60">
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                      </svg>
                    </div>
                    <svg className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold mb-1 text-foreground group-hover:text-primary transition-colors">{site.name}</h3>
                  <p className="text-[13px] text-muted-foreground mb-4 line-clamp-2">{site.description || 'No description'}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 rounded-[8px] bg-muted/60 px-2 py-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                      {site.documents?.[0]?.count || 0} docs
                    </span>
                    <span className="truncate font-mono text-[11px]">{site.slug}</span>
                  </div>
                </Link>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteSiteButton siteId={site.id} siteName={site.name} />
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
