import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { chunkText, estimateTokens } from '@/lib/chunker'
import { generateEmbeddings } from '@/lib/openai'

async function extractText(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase()

  if (ext === 'txt' || ext === 'md') {
    return buffer.toString('utf-8')
  }

  if (ext === 'pdf') {
    const pdfModule = await import('pdf-parse')
    const pdfParse = (pdfModule as any).default || pdfModule
    const result = await pdfParse(buffer)
    return result.text
  }

  throw new Error(`Unsupported file type: .${ext}`)
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const siteId = formData.get('site_id') as string | null

  if (!file || !siteId) {
    return NextResponse.json({ error: 'file and site_id required' }, { status: 400 })
  }

  // Verify user owns this site
  const { data: site } = await supabase
    .from('sites')
    .select('id')
    .eq('id', siteId)
    .eq('user_id', user.id)
    .single()

  if (!site) {
    return NextResponse.json({ error: 'Site not found' }, { status: 404 })
  }

  const supportedTypes = ['txt', 'md', 'pdf']
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !supportedTypes.includes(ext)) {
    return NextResponse.json({ error: `Unsupported file type. Supported: ${supportedTypes.join(', ')}` }, { status: 400 })
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const text = await extractText(buffer, file.name)

    if (!text.trim()) {
      return NextResponse.json({ error: 'File is empty or could not extract text' }, { status: 400 })
    }

    // Create document record
    const chunks = chunkText(text)
    const { data: doc, error: docError } = await supabaseAdmin
      .from('documents')
      .insert({
        site_id: siteId,
        title: file.name,
        content: text.slice(0, 50000),
        source_url: `upload://${file.name}`,
        char_count: text.length,
        chunk_count: chunks.length,
        status: 'processing',
      })
      .select()
      .single()

    if (docError) throw docError

    // Generate embeddings and insert chunks
    const chunkTexts = chunks.map(c => c.content)
    const embeddings = await generateEmbeddings(chunkTexts)

    const chunkRows = chunks.map((chunk, i) => ({
      site_id: siteId,
      document_id: doc.id,
      content: chunk.content,
      embedding: JSON.stringify(embeddings[i]),
      token_count: estimateTokens(chunk.content),
      metadata: { title: file.name, chunk_index: chunk.index },
    }))

    const { error: chunkError } = await supabaseAdmin
      .from('chunks')
      .insert(chunkRows)

    if (chunkError) throw chunkError

    // Mark document as completed
    await supabaseAdmin
      .from('documents')
      .update({ status: 'completed' })
      .eq('id', doc.id)

    return NextResponse.json({
      id: doc.id,
      title: file.name,
      char_count: text.length,
      chunk_count: chunks.length,
      status: 'completed',
    })
  } catch (err: any) {
    console.error('[upload] error:', err)
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}
