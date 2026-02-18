'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setEmailSent(true)
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center noise-bg" style={{ backgroundColor: 'hsl(40, 20%, 97%)' }}>
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-indigo-100/20 via-slate-100/10 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative z-[1] w-full max-w-sm px-4">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-[10px] gradient-bg flex items-center justify-center text-white font-bold text-sm btn-primary-shadow">D</div>
              <span className="text-xl font-semibold tracking-tight text-foreground">DocBot</span>
            </Link>
          </div>
          <div className="card-elevated rounded-xl p-7 text-center">
            {/* Mail icon */}
            <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>

            <h1 className="text-xl font-bold mb-2 text-foreground">Check your email</h1>

            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 mb-4">
              <p className="text-sm font-semibold text-amber-800 mb-1">Please click the confirmation link in your email</p>
              <p className="text-xs text-amber-700">
                We sent a confirmation email to <span className="font-semibold">{email}</span>.
                Please open it and <span className="font-bold underline">click &quot;Confirm your mail&quot;</span> to activate your account.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 border border-border px-4 py-3 mb-4 text-left">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Didn&apos;t receive it?</span> Check your spam/junk folder. The email is from <span className="font-mono text-[11px]">noreply@mail.app.supabase.io</span>
              </p>
            </div>

            <Link
              href="/sign-in"
              className="inline-block w-full rounded-[10px] gradient-bg px-4 py-2.5 text-sm font-medium text-white btn-primary-shadow hover:-translate-y-px transition-all"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center noise-bg" style={{ backgroundColor: 'hsl(40, 20%, 97%)' }}>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-indigo-100/20 via-slate-100/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-[1] w-full max-w-sm px-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-[10px] gradient-bg flex items-center justify-center text-white font-bold text-sm btn-primary-shadow">D</div>
            <span className="text-xl font-semibold tracking-tight text-foreground">DocBot</span>
          </Link>
        </div>
        <div className="card-elevated rounded-xl p-7">
          <h1 className="text-lg font-semibold mb-1 text-foreground">Create your account</h1>
          <p className="text-[13px] text-muted-foreground mb-6">Get started with DocBot for free</p>
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
                placeholder="Min 6 characters"
                required
                minLength={6}
              />
            </div>
            {error && (
              <div className="rounded-[10px] bg-red-50 border border-red-100 px-3.5 py-2.5 text-[13px] text-red-600">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[10px] gradient-bg px-4 py-2.5 text-sm font-medium text-white btn-primary-shadow hover:-translate-y-px transition-all disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            Already have an account?{' '}
            <Link href="/sign-in" className="font-medium text-primary hover:text-primary/80 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
