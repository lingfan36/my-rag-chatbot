import { NextResponse } from 'next/server'

// Legacy chat route - the main app uses /api/widget instead
export async function POST(req: Request) {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Use /api/widget instead.' },
    { status: 410 }
  )
}
