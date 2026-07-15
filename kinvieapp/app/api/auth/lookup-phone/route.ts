import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()
    if (!phone) {
      return NextResponse.json({ error: 'Thiếu số điện thoại' }, { status: 400 })
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('email, avatarurl')
      .eq('phone', phone)
      .maybeSingle()

    if (error) throw error

    if (!user) {
      return NextResponse.json({ exists: false })
    }

    const isSocialAccount = !!(user.avatarurl?.includes('facebook') || user.avatarurl?.includes('googleusercontent'))

    return NextResponse.json({ exists: true, email: user.email, isSocialAccount })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}