'use client'

interface Message {
  id: string
  role: string
  content: string
  created_at: string
}

export function ChatHistory({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return (
      <div className="card-elevated rounded-xl p-10 text-center text-[13px] text-muted-foreground">
        No conversations yet. Once visitors start chatting with your widget, you&apos;ll see their messages here.
      </div>
    )
  }

  return (
    <div className="card-elevated rounded-xl overflow-hidden">
      <div className="max-h-96 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className="border-b border-border last:border-0 px-5 py-3.5 hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                msg.role === 'user'
                  ? 'bg-primary/5 text-primary ring-1 ring-primary/15'
                  : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${msg.role === 'user' ? 'bg-primary' : 'bg-emerald-500'}`} />
                {msg.role}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {new Date(msg.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{msg.content.slice(0, 200)}{msg.content.length > 200 ? '...' : ''}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
