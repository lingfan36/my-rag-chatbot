import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: admin } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!admin) redirect('/dashboard')

  return (
    <div className="min-h-screen noise-bg flex" style={{ backgroundColor: 'hsl(40, 20%, 97%)' }}>
      <AdminSidebar email={user.email || ''} role={admin.role} />
      <div className="flex-1 relative z-[1]">
        <main className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
