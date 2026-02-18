/**
 * 测试：用真实 Jina query embedding 调用 match_chunks
 */
const SUPABASE_URL = 'https://ovminpohedtbadlffulw.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bWlucG9oZWR0YmFkbGZmdWx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA0ODc0OCwiZXhwIjoyMDg2NjI0NzQ4fQ.kQQGUiHkxUdAGz8uK0jkrqRms1nA-YVcotVRU4Y0EfY'
const JINA_API_KEY = 'jina_95893a5c1e454a709a8566c91a9b5a53JRVnWmuho0GI-XkamlYT2mqC-lYt'
const SITE_ID = 'cb586f96-5343-4dcf-b3c1-9a32208fe0c0'

const { createClient } = await import('@supabase/supabase-js')
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// Generate real query embedding
const query = '你们有哪些招牌饮品？'
console.log(`Query: "${query}"`)

const jinaRes = await fetch('https://api.jina.ai/v1/embeddings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${JINA_API_KEY}` },
  body: JSON.stringify({
    model: 'jina-embeddings-v3',
    task: 'retrieval.query',
    dimensions: 768,
    input: [query],
  }),
  signal: AbortSignal.timeout(30000)
})

if (!jinaRes.ok) { console.error('Jina failed:', await jinaRes.text()); process.exit(1) }
const jinaData = await jinaRes.json()
const embedding = jinaData.data[0].embedding
console.log(`Embedding dims: ${embedding.length}`)

// Call match_chunks
const { data: chunks, error } = await supabase.rpc('match_chunks', {
  query_embedding: embedding,
  match_site_id: SITE_ID,
  match_threshold: 0.3,
  match_count: 5,
})

if (error) {
  console.error('match_chunks error:', error.message)
} else {
  console.log(`\nFound ${chunks?.length} chunks:`)
  for (const c of chunks || []) {
    console.log(`  similarity=${c.similarity?.toFixed(3)} | ${c.content?.slice(0, 80)}...`)
  }
}
