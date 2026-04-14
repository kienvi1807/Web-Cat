import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Nếu có "next" trong URL thì lấy, không thì mặc định về trang chủ
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // 1. Đổi code lấy Session - ĐOẠN NÀY QUAN TRỌNG NHẤT
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // 2. Check xem ông này là khách cũ của Beam Petshop hay người mới
        const { data: dbUser } = await supabase
          .from('users')
          .select('userid')
          .eq('email', user.email)
          .maybeSingle() // Dùng maybeSingle để không bị văng lỗi nếu không thấy user

        if (!dbUser) {
          // Khách mới toanh -> Điền nốt thông tin SĐT
          return NextResponse.redirect(`${origin}/register/complete-profile`)
        }

        // 3. Khách cũ -> Về trang chủ (hoặc trang khách đang xem dở)
        // Dùng origin để đảm bảo không bị đá về localhost khi đang chạy Vercel
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // 4. Nếu mọi thứ thất bại (không code, lỗi exchange...) -> Về Login và báo lỗi
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}