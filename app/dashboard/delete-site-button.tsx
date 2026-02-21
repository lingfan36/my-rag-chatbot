'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export function DeleteSiteButton({ siteId, siteName }: { siteId: string; siteName: string }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/sites/${siteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast.success(`"${siteName}" deleted`)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete')
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className={`
        flex items-center gap-1 rounded-[8px] px-2 py-1 text-[11px] font-medium transition-all
        ${confirming
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-muted/60 text-muted-foreground hover:bg-red-50 hover:text-red-500'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      title={confirming ? 'Click again to confirm' : 'Delete site'}
    >
      {deleting ? (
        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )}
      {confirming ? 'Sure?' : 'Delete'}
    </button>
  )
}
