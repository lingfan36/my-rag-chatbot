import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { DocumentManager } from './document-manager'
import { EmbedCode } from './embed-code'
import { ChatHistory } from './chat-history'
import { AiConfigPanel } from './ai-config-panel'
import { AiMonitorPanel } from './ai-monitor-panel'
import { SiteTabsWrapper } from './site-tabs-wrapper'

export default async function SiteDetailPage({ params }: { params: { siteId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: site } = await supabase
    .from('sites')
    .select('*')
    .eq('id', params.siteId)
    .eq('user_id', user!.id)
    .single()

  if (!site) notFound()

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('site_id', site.id)
    .order('created_at', { ascending: false })

  const { data: recentChats } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('site_id', site.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const month = new Date().toISOString().slice(0, 7)
  const { data: usage } = await supabase
    .from('usage')
    .select('message_count')
    .eq('site_id', site.id)
    .eq('month', month)
    .single()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{site.name}</h1>
        <p className="text-[13px] text-muted-foreground mt-1">{site.description}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="card-elevated rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[10px] gradient-bg-subtle flex items-center justify-center text-primary/60">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
            </div>
            <div>
              <div className="text-[13px] text-muted-foreground">Documents</div>
              <div className="text-xl font-bold text-foreground">{documents?.length || 0}</div>
            </div>
          </div>
        </div>
        <div className="card-elevated rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[10px] bg-violet-50 flex items-center justify-center text-violet-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
            </div>
            <div>
              <div className="text-[13px] text-muted-foreground">Messages This Month</div>
              <div className="text-xl font-bold text-foreground">{usage?.message_count || 0}</div>
            </div>
          </div>
        </div>
        <div className="card-elevated rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-[10px] bg-emerald-50 flex items-center justify-center text-emerald-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a48.667 48.667 0 00-1.488 8.29m.568-3.027A7.5 7.5 0 0112 20.25a7.5 7.5 0 01-4.088-1.209m0 0L12 12m-4.088 7.041L12 12m0 0l4.088 7.041M12 12l4.088-7.041" /></svg>
            </div>
            <div>
              <div className="text-[13px] text-muted-foreground">Site ID</div>
              <div className="text-[12px] font-mono mt-0.5 truncate max-w-[180px] text-muted-foreground">{site.id}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <SiteTabsWrapper
        siteId={site.id}
        siteName={site.name}
        aiConfig={site.ai_config as any}
        documents={documents || []}
        recentChats={recentChats || []}
      />
    </div>
  )
}
