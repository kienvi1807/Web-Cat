import { createClient } from '@supabase/supabase-js'

// ⚠️ CHỈ dùng trong API routes (server-side). TUYỆT ĐỐI không import file này
// vào bất kỳ component nào có "use client", vì service role key sẽ bị lộ.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)