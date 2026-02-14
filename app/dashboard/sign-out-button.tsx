'use client'

import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut()
        router.push('/')
      }}
      className="rounded-[8px] border border-border bg-white/60 px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-white transition-all"
    >
      Sign Out
    </button>
  )
}
