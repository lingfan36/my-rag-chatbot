import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle error from Supabase (e.g. expired link)
  if (error) {
    const redirectUrl = new URL('/sign-in', requestUrl.origin)
    redirectUrl.searchParams.set('error', errorDescription || error)
    return NextResponse.redirect(redirectUrl)
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      const redirectUrl = new URL('/sign-in', requestUrl.origin)
      redirectUrl.searchParams.set('error', exchangeError.message)
      return NextResponse.redirect(redirectUrl)
    }

    const redirectUrl = new URL('/dashboard', requestUrl.origin)
    redirectUrl.searchParams.set('confirmed', 'true')
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.redirect(new URL('/sign-in', requestUrl.origin))
}
