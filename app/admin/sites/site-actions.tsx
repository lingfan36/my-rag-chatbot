'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AdminSiteActions({ siteId, siteName }: { siteId: string; siteName: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete site "${siteName}" and all its data? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/sites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: siteId }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to delete site')
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-[12px] text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
    >
      {deleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}
