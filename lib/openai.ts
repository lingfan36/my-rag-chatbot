import OpenAI from 'openai'
import { ProxyAgent, fetch as proxyFetchRaw } from 'undici'

const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || ''
const proxyAgent = PROXY_URL ? new ProxyAgent(PROXY_URL) : null

function proxyFetch(url: any, init?: any): any {
  if (proxyAgent) {
    return proxyFetchRaw(url, { ...init, dispatcher: proxyAgent }).catch(() => {
      // fallback to direct fetch if proxy fails
      return fetch(url, init)
    })
  }
  return fetch(url, init)
}

// OpenRouter-compatible client for chat completions
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  fetch: proxyFetch,
})

export const CHAT_MODEL = process.env.OPENROUTER_MODEL || 'google/gemma-3-27b-it:free'

const FALLBACK_MODELS = [
  'google/gemma-3-27b-it:free',
  'deepseek/deepseek-r1-0528:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'nvidia/llama-3.1-nemotron-70b-instruct:free',
  'openai/gpt-oss-120b:free',
]

export async function chatWithRetry(
  messages: any[],
  opts: { temperature?: number; max_tokens?: number } = {}
) {
  const models = [CHAT_MODEL, ...FALLBACK_MODELS.filter(m => m !== CHAT_MODEL)]
  let lastError: any

  for (const model of models) {
    try {
      console.log(`[chat] trying model: ${model}`)
      const completion = await openai.chat.completions.create({
        model,
        messages,
        temperature: opts.temperature ?? 0.3,
        max_tokens: opts.max_tokens ?? 1000,
      })
      return completion
    } catch (err: any) {
      console.log(`[chat] model ${model} failed: ${err?.status} ${err?.message}`)
      lastError = err
      // 429 (rate limit) or 404 (model not found) -> try next model
      if (err?.status === 429 || err?.status === 404 || err?.status === 503) {
        await new Promise(r => setTimeout(r, 500))
        continue
      }
      throw err // non-retryable error
    }
  }
  throw lastError
}

// Jina AI Embeddings
const JINA_API_URL = 'https://api.jina.ai/v1/embeddings'
const JINA_API_KEY = process.env.JINA_API_KEY

export async function generateEmbedding(text: string): Promise<number[]> {
  const input = text.trim()
  if (!input) throw new Error('Empty text for embedding')

  const res = await proxyFetch(JINA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JINA_API_KEY}`,
    },
      body: JSON.stringify({
        model: 'jina-embeddings-v3',
        task: 'retrieval.query',
        dimensions: 768,
        input: [input],
      }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Jina embedding failed: ${err}`)
  }

  const data = await res.json()
  return data.data[0].embedding
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const filtered = texts.map((t: string) => t.trim()).filter((t: string) => t.length > 0)
  if (filtered.length === 0) throw new Error('No valid texts for embedding')

  const res = await proxyFetch(JINA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JINA_API_KEY}`,
    },
      body: JSON.stringify({
        model: 'jina-embeddings-v3',
        task: 'retrieval.passage',
        dimensions: 768,
        input: filtered,
      }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Jina embeddings failed: ${err}`)
  }

  const data = await res.json()
  return data.data.map((d: any) => d.embedding)
}

export async function chatWithCustomConfig(
  messages: any[],
  aiConfig: { api_key: string; base_url: string; model: string },
  opts: { temperature?: number; max_tokens?: number } = {}
) {
  const customClient = new OpenAI({
    apiKey: aiConfig.api_key,
    baseURL: aiConfig.base_url,
    fetch: proxyFetch,
  })

  console.log(`[chat] using custom model: ${aiConfig.model} at ${aiConfig.base_url}`)
  return customClient.chat.completions.create({
    model: aiConfig.model,
    messages,
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.max_tokens ?? 1000,
  })
}

export { openai }
