import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ovminpohedtbadlffulw.supabase.co';

// Read from env file manually
import { readFileSync } from 'fs';
const envContent = readFileSync('D:/IdeaProjects/tool/my-rag-chatbot/.env.local', 'utf-8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
}

const supabase = createClient(
  envVars['NEXT_PUBLIC_SUPABASE_URL'] || SUPABASE_URL,
  envVars['SUPABASE_SERVICE_ROLE_KEY'] || envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY']
);

// Check documents
const { data: docs, error: docError } = await supabase
  .from('documents')
  .select('id, title, status, chunk_count');

console.log('Documents:', JSON.stringify(docs, null, 2));
if (docError) console.error('Doc error:', docError);

// Check chunks
const { data: chunks, error: chunkError } = await supabase
  .from('chunks')
  .select('id, document_id, token_count, embedding')
  .limit(10);

if (chunkError) console.error('Chunk error:', chunkError);

console.log(`\nChunks count: ${chunks?.length}`);
chunks?.forEach((c, i) => {
  const embLen = c.embedding ? (Array.isArray(c.embedding) ? c.embedding.length : JSON.parse(c.embedding).length) : 0;
  console.log(`  Chunk ${i+1}: doc=${c.document_id?.slice(0,8)} tokens=${c.token_count} embed_dims=${embLen}`);
});
