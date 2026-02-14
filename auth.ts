import 'server-only'
import { createClient } from '@/lib/supabase-server'

export const auth = async ({
  cookieStore
}: {
  cookieStore: any
}) => {
  // Create a Supabase client configured to use cookies
  const supabase = createClient()
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}
