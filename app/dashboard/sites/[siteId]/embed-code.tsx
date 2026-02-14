'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export function EmbedCode({ siteId, siteName }: { siteId: string; siteName: string }) {
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('https://your-domain.com')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const embedScript = `<!-- DocBot Chat Widget -->
<script>
  window.DocBotConfig = {
    siteId: "${siteId}",
    apiUrl: "${origin}/api/widget",
    title: "${siteName}",
    primaryColor: "#4f5fd5",
    position: "bottom-right"
  };
</script>
<script src="${origin}/widget.js" defer></script>`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedScript)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card-elevated rounded-xl p-6">
      <p className="text-[13px] text-muted-foreground mb-4">
        Add this code snippet to your website&apos;s HTML, just before the closing <code className="bg-muted px-1.5 py-0.5 rounded-[6px] text-[11px] font-mono">&lt;/body&gt;</code> tag:
      </p>
      <div className="relative group">
        <pre className="rounded-[10px] p-5 text-[13px] overflow-x-auto leading-relaxed" style={{ backgroundColor: 'hsl(225, 20%, 12%)', color: 'hsl(220, 15%, 75%)' }}>
          <code>{embedScript}</code>
        </pre>
        <button
          onClick={copyToClipboard}
          className="absolute top-3 right-3 rounded-[8px] bg-white/10 hover:bg-white/20 px-2.5 py-1.5 text-xs font-medium text-white/80 transition-colors flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
              Copy
            </>
          )}
        </button>
      </div>
      <div className="mt-4 p-3.5 rounded-[10px] gradient-bg-subtle border border-primary/10">
        <p className="text-[13px] text-foreground/70">
          <strong className="text-foreground/80">Customization:</strong> Change <code className="bg-white/60 px-1 rounded-[4px] text-[11px] font-mono">primaryColor</code> to match your brand, 
          and <code className="bg-white/60 px-1 rounded-[4px] text-[11px] font-mono">position</code> can be <code className="bg-white/60 px-1 rounded-[4px] text-[11px] font-mono">&quot;bottom-right&quot;</code> or <code className="bg-white/60 px-1 rounded-[4px] text-[11px] font-mono">&quot;bottom-left&quot;</code>.
        </p>
      </div>
    </div>
  )
}
