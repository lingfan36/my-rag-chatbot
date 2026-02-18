'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    const confirmed = searchParams.get('confirmed')
    if (errorParam) {
      setError(errorParam)
    }
    if (confirmed === 'true') {
      setSuccess('Email verified successfully! Please sign in.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="relative z-[1] w-full max-w-sm px-4">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-[10px] gradient-bg flex items-center justify-center text-white font-bold text-sm btn-primary-shadow">D</div>
          <span className="text-xl font-semibold tracking-tight text-foreground">DocBot</span>
        </Link>
      </div>
      <div className="card-elevated rounded-xl p-7">
        <h1 className="text-lg font-semibold mb-1 text-foreground">Welcome back</h1>
        <p className="text-[13px] text-muted-foreground mb-6">Sign in to your account to continue</p>

        {success && (
          <div className="rounded-[10px] bg-green-50 border border-green-200 px-3.5 py-2.5 text-[13px] text-green-700 font-medium mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        )}

        {error && !success && (
          <div className="rounded-[10px] bg-red-50 border border-red-100 px-3.5 py-2.5 text-[13px] text-red-600 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[13px] font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-[10px] border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[10px] gradient-bg px-4 py-2.5 text-sm font-medium text-white btn-primary-shadow hover:-translate-y-px transition-all disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-[13px] text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="font-medium text-primary hover:text-primary/80 transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center noise-bg" style={{ backgroundColor: 'hsl(40, 20%, 97%)' }}>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-indigo-100/20 via-slate-100/10 to-transparent rounded-full blur-3xl" />
      </div>
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  )
}
