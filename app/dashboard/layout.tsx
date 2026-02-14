import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { SignOutButton } from './sign-out-button'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  return (
    <div className="min-h-screen noise-bg" style={{ backgroundColor: 'hsl(40, 20%, 97%)' }}>
      <div className="relative z-[1]">
        <nav className="sticky top-0 z-50 glass">
          <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-[10px] gradient-bg flex items-center justify-center text-white font-bold text-xs btn-primary-shadow">D</div>
                <span className="font-semibold tracking-tight text-foreground">DocBot</span>
              </Link>
              <div className="flex items-center gap-1">
                <Link href="/dashboard" className="rounded-[8px] px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-white/60 transition-all">
                  Sites
                </Link>
                <Link href="/dashboard/usage" className="rounded-[8px] px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-white/60 transition-all">
                  Usage
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[13px] text-muted-foreground hidden sm:block">{user.email}</span>
              <SignOutButton />
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-6xl px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
