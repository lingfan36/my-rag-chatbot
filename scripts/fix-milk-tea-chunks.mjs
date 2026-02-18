/**
 * 修复奶茶文档 chunks：
 * 1. 切割奶茶文档内容
 * 2. 调用 Jina API 生成 embedding（带重试）
 * 3. 插入 chunks 表
 * 4. 把文档 status 改为 completed
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ---- 配置 ----
const SUPABASE_URL = 'https://ovminpohedtbadlffulw.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bWlucG9oZWR0YmFkbGZmdWx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA0ODc0OCwiZXhwIjoyMDg2NjI0NzQ4fQ.kQQGUiHkxUdAGz8uK0jkrqRms1nA-YVcotVRU4Y0EfY'
const JINA_API_KEY = 'jina_95893a5c1e454a709a8566c91a9b5a53JRVnWmuho0GI-XkamlYT2mqC-lYt'
const DOCUMENT_ID = '5d89ca7e-d75f-48e8-8ce7-5ca0b2a93c24'
const SITE_ID = 'cb586f96-5343-4dcf-b3c1-9a32208fe0c0'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// ---- 文本切割 ----
function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = []
  let start = 0, index = 0
  while (start < text.length) {
    let end = start + chunkSize
    if (end < text.length) {
      const slice = text.slice(start, end + 100)
      for (const bp of ['\n\n', '\n', '. ', '! ', '? ']) {
        const lastBreak = slice.lastIndexOf(bp, chunkSize)
        if (lastBreak > chunkSize * 0.5) { end = start + lastBreak + bp.length; break }
      }
    } else { end = text.length }
    const content = text.slice(start, end).trim()
    if (content.length > 20) { chunks.push({ content, index }); index++ }
    start = end - overlap
    if (start < 0) start = 0
    if (end >= text.length) break
  }
  return chunks
}

// ---- Jina Embedding（带重试） ----
async function generateEmbeddings(texts, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`  [Jina] attempt ${attempt}/${retries} for ${texts.length} texts...`)
      const res = await fetch('https://api.jina.ai/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JINA_API_KEY}`
        },
        body: JSON.stringify({
            model: 'jina-embeddings-v3',
            task: 'retrieval.passage',
            dimensions: 768,
            input: texts
          }),
        signal: AbortSignal.timeout(30000)
      })
      if (!res.ok) {
        const err = await res.text()
        throw new Error(`Jina API error ${res.status}: ${err}`)
      }
      const data = await res.json()
      return data.data.map(d => d.embedding)
    } catch (e) {
      console.log(`  [Jina] attempt ${attempt} failed: ${e.message}`)
      if (attempt < retries) await new Promise(r => setTimeout(r, 2000 * attempt))
    }
  }
  throw new Error('Jina embedding failed after all retries')
}

// ---- 主流程 ----
async function main() {
  // 1. 读取奶茶文档
  const mdPath = join(__dirname, '..', 'demo-milk-tea-menu.md')
  const content = readFileSync(mdPath, 'utf-8')
  console.log(`✓ 读取文档: ${content.length} 字符`)

  // 2. 切割
  const chunks = chunkText(content)
  console.log(`✓ 切割为 ${chunks.length} 个 chunks`)

  // 3. 先清理旧 chunks（防止重复）
  const { error: delErr } = await supabase.from('chunks').delete().eq('document_id', DOCUMENT_ID)
  if (delErr) console.warn('清理旧chunks:', delErr.message)
  else console.log('✓ 已清理旧 chunks')

  // 4. 分批生成 embedding（每批5个，避免超时）
  const BATCH = 5
  const allEmbeddings = []
  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH)
    console.log(`  生成 embedding 第${Math.floor(i/BATCH)+1}批 (${batch.length}个)...`)
    const embeddings = await generateEmbeddings(batch.map(c => c.content))
    allEmbeddings.push(...embeddings)
    console.log(`  ✓ batch done`)
  }

  // 5. 插入 chunks
  const rows = chunks.map((chunk, i) => ({
    document_id: DOCUMENT_ID,
    site_id: SITE_ID,
    content: chunk.content,
    token_count: Math.ceil(chunk.content.length / 4),
    embedding: JSON.stringify(allEmbeddings[i]),
    metadata: { index: chunk.index, title: 'demo-milk-tea-menu.md', source: 'demo-milk-tea-menu.md' }
  }))

  const { error: insertErr } = await supabase.from('chunks').insert(rows)
  if (insertErr) throw new Error(`插入chunks失败: ${insertErr.message}`)
  console.log(`✓ 插入 ${rows.length} 个 chunks 成功`)

  // 6. 更新文档状态
  const { error: updateErr } = await supabase
    .from('documents')
    .update({ status: 'completed', chunk_count: chunks.length })
    .eq('id', DOCUMENT_ID)
  if (updateErr) throw new Error(`更新文档状态失败: ${updateErr.message}`)
  console.log('✓ 文档状态更新为 completed')

  console.log('\n🎉 完成！奶茶知识库已就绪，AI 客服可以回答问题了。')
}

main().catch(e => {
  console.error('❌ 失败:', e.message)
  process.exit(1)
})
