'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export function CreateSiteForm() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.error) {
      toast.error(data.error)
    } else {
      toast.success('Site created!')
      setOpen(false)
      setName('')
      setDescription('')
      router.refresh()
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-[10px] gradient-bg px-4 py-2 text-[13px] font-medium text-white btn-primary-shadow hover:-translate-y-px transition-all flex items-center gap-2">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        New Site
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="w-full max-w-md card-elevated rounded-xl p-7" onClick={(e) => e.stopPropagation()} style={{ boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.8), 0 20px 60px rgba(0,0,0,0.12)' }}>
        <h2 className="text-lg font-semibold mb-1 text-foreground">Create New Site</h2>
        <p className="text-[13px] text-muted-foreground mb-6">Set up a new knowledge base for your product</p>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-[13px] font-medium text-foreground">Site Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              placeholder="My Product Docs"
              required
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-foreground">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              placeholder="Documentation for my product"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-[10px] border border-border px-4 py-2 text-[13px] font-medium text-foreground hover:bg-muted/40 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="rounded-[10px] gradient-bg px-4 py-2 text-[13px] font-medium text-white btn-primary-shadow hover:-translate-y-px transition-all disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Site'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
