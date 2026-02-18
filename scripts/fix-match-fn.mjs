/**
 * 诊断并修复 match_chunks 函数维度问题
 * Supabase project: ovminpohedtbadlffulw
 */

const SUPABASE_URL = 'https://ovminpohedtbadlffulw.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bWlucG9oZWR0YmFkbGZmdWx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA0ODc0OCwiZXhwIjoyMDg2NjI0NzQ4fQ.kQQGUiHkxUdAGz8uK0jkrqRms1nA-YVcotVRU4Y0EfY'

const { createClient } = await import('@supabase/supabase-js')
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// 1. Check chunks count and embedding dims
const { data: chunks, error: chunkErr } = await supabase
  .from('chunks')
  .select('id, document_id, token_count')
  .limit(10)

console.log('Chunks in DB:', chunks?.length ?? 0, chunkErr?.message || '')
if (chunks) {
  for (const c of chunks) console.log('  chunk:', c.id.slice(0,8), 'doc:', c.document_id.slice(0,8), 'tokens:', c.token_count)
}

// 2. Try match_chunks with 768-dim vector
const dummy768 = new Array(768).fill(0.001)
const { data: r768, error: e768 } = await supabase.rpc('match_chunks', {
  query_embedding: dummy768,
  match_site_id: 'cb586f96-5343-4dcf-b3c1-9a32208fe0c0',
  match_threshold: 0.0,
  match_count: 5,
})
console.log('\nmatch_chunks(768-dim):', e768?.message || `OK - ${r768?.length} results`)

// 3. Try match_chunks with 1024-dim vector
const dummy1024 = new Array(1024).fill(0.001)
const { data: r1024, error: e1024 } = await supabase.rpc('match_chunks', {
  query_embedding: dummy1024,
  match_site_id: 'cb586f96-5343-4dcf-b3c1-9a32208fe0c0',
  match_threshold: 0.0,
  match_count: 5,
})
console.log('match_chunks(1024-dim):', e1024?.message || `OK - ${r1024?.length} results`)
