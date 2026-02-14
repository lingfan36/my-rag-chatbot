import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { chunkText, estimateTokens } from '@/lib/chunker'
import { generateEmbeddings } from '@/lib/openai'

export async function GET(req: Request) {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const siteId = searchParams.get('site_id')
  if (!siteId)
    return NextResponse.json({ error: 'site_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { site_id, title, content, source_url } = await req.json()
  if (!site_id || !title || !content) {
    return NextResponse.json(
      { error: 'site_id, title, content required' },
      { status: 400 }
    )
  }

  // Insert document
  const { data: doc, error: docErr } = await supabaseAdmin
    .from('documents')
    .insert({
      site_id,
      title,
      content,
      source_url,
      char_count: content.length,
      status: 'processing'
    })
    .select()
    .single()

  if (docErr)
    return NextResponse.json({ error: docErr.message }, { status: 500 })

  // Chunk & embed
  try {
    const chunks = chunkText(content)

    if (chunks.length === 0) {
      await supabaseAdmin
        .from('documents')
        .update({ status: 'ready', chunk_count: 0 })
        .eq('id', doc.id)
      return NextResponse.json({ ...doc, status: 'ready', chunk_count: 0 })
    }

    const texts = chunks.map(c => c.content)
    const embeddings = await generateEmbeddings(texts)

    const rows = chunks.map((chunk, i) => ({
      document_id: doc.id,
      site_id,
      content: chunk.content,
      token_count: estimateTokens(chunk.content),
      embedding: JSON.stringify(embeddings[i]),
      metadata: { index: chunk.index, title }
    }))

    const { error: chunkErr } = await supabaseAdmin.from('chunks').insert(rows)

    if (chunkErr) throw chunkErr

    await supabaseAdmin
      .from('documents')
      .update({ status: 'ready', chunk_count: chunks.length })
      .eq('id', doc.id)

    return NextResponse.json({
      ...doc,
      status: 'ready',
      chunk_count: chunks.length
    })
  } catch (err: any) {
    await supabaseAdmin
      .from('documents')
      .update({ status: 'error' })
      .eq('id', doc.id)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const docId = searchParams.get('id')
  if (!docId)
    return NextResponse.json({ error: 'id required' }, { status: 400 })

  await supabaseAdmin.from('documents').delete().eq('id', docId)
  return NextResponse.json({ success: true })
}
