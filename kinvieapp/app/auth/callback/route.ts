import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    // 🎯 CHỈ CẦN THÊM "await" VÀO DÒNG NÀY LÀ HẾT BÁO LỖI:
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // 1. Đổi "code" lấy "session"
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // 2. Lấy thông tin user vừa đăng nhập
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // 3. Kiểm tra user trong bảng 'users' của sếp
        const { data: dbUser } = await supabase
          .from('users')
          .select('userid')
          .eq('email', user.email)
          .single()

        // 🎯 ĐIỀU HƯỚNG:
        if (!dbUser) {
          // Người mới: Đá sang trang hoàn thiện hồ sơ để xin SĐT
          return NextResponse.redirect(`${origin}/register/complete-profile`)
        } else {
          // Người cũ: Về trang chủ luôn cho lẹ
          return NextResponse.redirect(`${origin}/`)
        }
      }
    }
  }

  // Nếu có lỗi, trả về trang login
  return NextResponse.redirect(`${origin}/login`)
}