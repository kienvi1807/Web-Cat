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
      .select('userid, fullname, phone')
      .eq('phone', phone)
      .maybeSingle()

    if (error) throw error
    if (!user) return NextResponse.json({ exists: false })

    return NextResponse.json({ exists: true, user })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}