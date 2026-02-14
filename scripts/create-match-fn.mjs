import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.oejpyhfvaewzfwpmzsum:e3OMgWVnV3tGJGvKicuJIKgc0RKxFBcZk1ezqC62vjL9LuBpdlHyHaJU8Ul2CDTD@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
});

await client.connect();

await client.query(`
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(1024),
  match_site_id uuid,
  match_threshold float,
  match_count int
)
RETURNS TABLE(
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    chunks.id,
    chunks.document_id,
    chunks.content,
    chunks.metadata,
    (1 - (chunks.embedding <=> query_embedding))::float AS similarity
  FROM chunks
  WHERE chunks.site_id = match_site_id
    AND 1 - (chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
`);

console.log('match_chunks function created successfully');
await client.end();
