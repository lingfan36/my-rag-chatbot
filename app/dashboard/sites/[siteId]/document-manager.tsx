'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Doc {
  id: string
  title: string
  status: string
  chunk_count: number
  char_count: number
  created_at: string
}

export function DocumentManager({ siteId, initialDocs }: { siteId: string; initialDocs: Doc[] }) {
  const [showUpload, setShowUpload] = useState(false)
  const [uploadMode, setUploadMode] = useState<'text' | 'file'>('text')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleTextUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_id: siteId, title, content, source_url: sourceUrl }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.error) {
      toast.error(data.error)
    } else {
      toast.success('Document uploaded & embedded!')
      resetForm()
      router.refresh()
    }
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return toast.error('Please select a file')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('site_id', siteId)
      const res = await fetch('/api/documents/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast.success(`File uploaded! ${data.chunk_count} chunks created.`)
      resetForm()
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setShowUpload(false)
    setTitle('')
    setContent('')
    setSourceUrl('')
    setSelectedFile(null)
    setUploadMode('text')
  }

  const handleUpload = uploadMode === 'file' ? handleFileUpload : handleTextUpload

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document and all its chunks?')) return
    await fetch(`/api/documents?id=${docId}`, { method: 'DELETE' })
    toast.success('Document deleted')
    router.refresh()
  }

  return (
    <div>
      <div className="mb-4">
        <button onClick={() => setShowUpload(!showUpload)} className="rounded-[10px] gradient-bg px-4 py-2 text-[13px] font-medium text-white btn-primary-shadow hover:-translate-y-px transition-all flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add Document
        </button>
      </div>

      {showUpload && (
        <div className="card-elevated rounded-xl p-6 mb-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-5">
            <button
              type="button"
              onClick={() => setUploadMode('text')}
              className={`rounded-[10px] px-4 py-2 text-[13px] font-medium transition-all ${
                uploadMode === 'text'
                  ? 'gradient-bg text-white btn-primary-shadow'
                  : 'border border-border text-foreground hover:bg-muted/40'
              }`}
            >
              Paste Text
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`rounded-[10px] px-4 py-2 text-[13px] font-medium transition-all ${
                uploadMode === 'file'
                  ? 'gradient-bg text-white btn-primary-shadow'
                  : 'border border-border text-foreground hover:bg-muted/40'
              }`}
            >
              Upload File
            </button>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            {uploadMode === 'file' ? (
              <div>
                <label className="text-[13px] font-medium text-foreground">Select File</label>
                <p className="text-[11px] text-muted-foreground mt-0.5">Supported: .txt, .md, .pdf</p>
                <div className="mt-1.5">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/20 hover:border-primary/30 transition-all">
                    {selectedFile ? (
                      <div className="flex flex-col items-center gap-1">
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-foreground">{selectedFile.name}</span>
                        <span className="text-[11px] text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <span className="text-[13px] text-muted-foreground">Click to select a file</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".txt,.md,.pdf"
                      className="hidden"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-[13px] font-medium text-foreground">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1.5 w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    placeholder="Getting Started Guide"
                    required
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-foreground">Source URL (optional)</label>
                  <input
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="mt-1.5 w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    placeholder="https://docs.example.com/getting-started"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-foreground">Content</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                    className="mt-1.5 w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none"
                    placeholder="Paste your document content here..."
                    required
                  />
                </div>
              </>
            )}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={resetForm} className="rounded-[10px] border border-border px-4 py-2 text-[13px] font-medium text-foreground hover:bg-muted/40 transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="rounded-[10px] gradient-bg px-4 py-2 text-[13px] font-medium text-white btn-primary-shadow hover:-translate-y-px transition-all disabled:opacity-50">
                {loading ? 'Processing...' : uploadMode === 'file' ? 'Upload File' : 'Upload & Embed'}
              </button>
            </div>
          </form>
        </div>
      )}

      {initialDocs.length === 0 ? (
        <div className="card-elevated rounded-xl p-10 text-center text-[13px] text-muted-foreground">
          No documents yet. Upload your first document to start building the knowledge base.
        </div>
      ) : (
        <div className="card-elevated rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-[13px] font-medium text-muted-foreground bg-muted/30">Title</th>
                <th className="text-left px-5 py-3 text-[13px] font-medium text-muted-foreground bg-muted/30">Status</th>
                <th className="text-left px-5 py-3 text-[13px] font-medium text-muted-foreground bg-muted/30">Chunks</th>
                <th className="text-left px-5 py-3 text-[13px] font-medium text-muted-foreground bg-muted/30">Characters</th>
                <th className="text-right px-5 py-3 text-[13px] font-medium text-muted-foreground bg-muted/30">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialDocs.map((doc) => (
                <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{doc.title}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      doc.status === 'ready' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60' :
                      doc.status === 'processing' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60' :
                      doc.status === 'error' ? 'bg-red-50 text-red-700 ring-1 ring-red-200/60' :
                      'bg-muted text-muted-foreground ring-1 ring-border'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        doc.status === 'ready' ? 'bg-emerald-500' :
                        doc.status === 'processing' ? 'bg-amber-500 animate-pulse' :
                        doc.status === 'error' ? 'bg-red-500' : 'bg-muted-foreground'
                      }`} />
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{doc.chunk_count}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{doc.char_count?.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => handleDelete(doc.id)} className="rounded-[8px] px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
