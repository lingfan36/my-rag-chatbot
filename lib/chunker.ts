const CHUNK_SIZE = 1000 // characters
const CHUNK_OVERLAP = 200

export interface TextChunk {
  content: string
  index: number
}

export function chunkText(text: string): TextChunk[] {
  const chunks: TextChunk[] = []
  let start = 0
  let index = 0

  while (start < text.length) {
    let end = start + CHUNK_SIZE

    // Try to break at paragraph or sentence boundary
    if (end < text.length) {
      const slice = text.slice(start, end + 100)
      const breakPoints = ['\n\n', '\n', '. ', '! ', '? ']
      for (const bp of breakPoints) {
        const lastBreak = slice.lastIndexOf(bp, CHUNK_SIZE)
        if (lastBreak > CHUNK_SIZE * 0.5) {
          end = start + lastBreak + bp.length
          break
        }
      }
    } else {
      end = text.length
    }

    const content = text.slice(start, end).trim()
    if (content.length > 20) {
      chunks.push({ content, index })
      index++
    }

    start = end - CHUNK_OVERLAP
    if (start < 0) start = 0
    if (end >= text.length) break
  }

  return chunks
}

export function estimateTokens(text: string): number {
  // Rough estimate: ~4 chars per token
  return Math.ceil(text.length / 4)
}
