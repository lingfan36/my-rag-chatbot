import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateEmbedding, chatWithRetry, chatWithCustomConfig } from '@/lib/openai'

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 })
}

export async function POST(req: Request) {
  const { site_id, session_id, message, visitor_id } = await req.json()

  if (!site_id || !message) {
    return NextResponse.json({ error: 'site_id and message required' }, { status: 400 })
  }

  // Get or create session
  let sessionId = session_id
  if (!sessionId) {
    const { data: session } = await supabaseAdmin
      .from('chat_sessions')
      .insert({ site_id, visitor_id: visitor_id || 'anonymous' })
      .select()
      .single()
    sessionId = session?.id
  }

  // Save user message
  await supabaseAdmin.from('chat_messages').insert({
    session_id: sessionId,
    site_id,
    role: 'user',
    content: message,
  })

  // Track usage
  const month = new Date().toISOString().slice(0, 7) // YYYY-MM
  // Get site owner and AI config
  const { data: site } = await supabaseAdmin
    .from('sites')
    .select('user_id, ai_config')
    .eq('id', site_id)
    .single()

  if (site) {
    const { data: existing } = await supabaseAdmin
      .from('usage')
      .select('id, message_count')
      .eq('user_id', site.user_id)
      .eq('site_id', site_id)
      .eq('month', month)
      .single()

    if (existing) {
      await supabaseAdmin
        .from('usage')
        .update({ message_count: existing.message_count + 1 })
        .eq('id', existing.id)
    } else {
      await supabaseAdmin
        .from('usage')
        .insert({ user_id: site.user_id, site_id, month, message_count: 1 })
    }
  }

  // Vector search for relevant chunks
  const embedding = await generateEmbedding(message)

  const { data: chunks } = await supabaseAdmin.rpc('match_chunks', {
    query_embedding: JSON.stringify(embedding),
    match_site_id: site_id,
    match_threshold: 0.7,
    match_count: 5,
  })

  const context = (chunks || [])
    .map((c: any) => c.content)
    .join('\n\n---\n\n')

  const sources = (chunks || []).map((c: any) => ({
    content: c.content.slice(0, 200),
    document_title: c.metadata?.title || '',
    similarity: c.similarity,
  }))

  // Get recent conversation history
  const { data: history } = await supabaseAdmin
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(10)

  const aiConfig = site?.ai_config as any
  const defaultSystemPrompt = `You are a helpful knowledge base assistant. Answer the user's question based ONLY on the provided context. If the context doesn't contain enough information, say so honestly. Be concise and helpful. Always respond in the same language as the user's question.

Context from knowledge base:
${context || 'No relevant context found.'}`

  const systemPrompt = aiConfig?.system_prompt
    ? `${aiConfig.system_prompt}\n\nContext from knowledge base:\n${context || 'No relevant context found.'}`
    : defaultSystemPrompt

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    ...(history || []).slice(-8).map((m: any) => ({
      role: m.role,
      content: m.content,
    })),
  ]

  const lastMsg = messages[messages.length - 1]
  if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== message) {
    messages.push({ role: 'user', content: message })
  }

  const chatOpts = {
    temperature: aiConfig?.temperature ?? 0.3,
    max_tokens: aiConfig?.max_tokens ?? 1000,
  }

    let completion: any = null
    const startTime = Date.now()
    const usageModel = aiConfig?.model || 'default'
    const usageProvider = aiConfig?.provider || 'openrouter'
    let logStatus = 'success'
    let logError: string | null = null

    try {
      if (aiConfig?.api_key && aiConfig?.base_url && aiConfig?.model) {
        completion = await chatWithCustomConfig(messages, aiConfig, chatOpts)
      } else {
        completion = await chatWithRetry(messages, chatOpts)
      }
    } catch (err: any) {
      logStatus = 'error'
      logError = err?.message || 'Unknown error'

      // Log the error before returning
      const latencyMs = Date.now() - startTime
      supabaseAdmin.from('ai_usage_logs').insert({
        site_id,
        session_id: sessionId,
        model: usageModel,
        provider: usageProvider,
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
        latency_ms: latencyMs,
        estimated_cost: 0,
        status: 'error',
        error_message: logError,
      }).then(() => {})

      return NextResponse.json({ error: 'AI request failed', detail: logError }, { status: 502 })
    }

    const latencyMs = Date.now() - startTime
    const promptTokens = completion?.usage?.prompt_tokens || 0
    const completionTokens = completion?.usage?.completion_tokens || 0
    const totalTokens = completion?.usage?.total_tokens || (promptTokens + completionTokens)
      const inputPrice = aiConfig?.input_price ?? null
      const outputPrice = aiConfig?.output_price ?? null
      const estimatedCost = (inputPrice != null && outputPrice != null)
        ? (promptTokens * inputPrice / 1_000_000) + (completionTokens * outputPrice / 1_000_000)
        : totalTokens * 0.000001

    // Fire-and-forget usage log
    supabaseAdmin.from('ai_usage_logs').insert({
      site_id,
      session_id: sessionId,
      model: completion?.model || usageModel,
      provider: usageProvider,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: totalTokens,
      latency_ms: latencyMs,
      estimated_cost: estimatedCost,
      status: logStatus,
      error_message: logError,
    }).then(() => {})

    const answer = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    // Save assistant message
    await supabaseAdmin.from('chat_messages').insert({
      session_id: sessionId,
      site_id,
      role: 'assistant',
      content: answer,
      sources,
    })

  return NextResponse.json({
    answer,
    sources,
    session_id: sessionId,
  })
}
