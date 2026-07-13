import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// THÊM HÀM POST: Xử lý Đăng ký tài khoản (Local & Social)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    // 🎯 ĐÃ BỎ typeId khỏi danh sách nhận từ Frontend.
    // KHÔNG BAO GIỜ tin dữ liệu quyền hạn (role/type_id) gửi lên từ client,
    // vì client có thể tự chỉnh sửa request (Postman/curl) để tự phong Admin.
    const { phone, fullName, email, passwordHash, provider, providerId, avatarUrl } = body

    // Validate tối thiểu đầu vào
    if (!phone || !fullName) {
      return NextResponse.json({ error: 'Thiếu phone hoặc fullName' }, { status: 400 })
    }

    // BƯỚC 1: Tạo một "Hộ gia đình" mặc định cho khách hàng mới
    const { data: familyData, error: familyError } = await supabase
      .from('families')
      .insert([{ familyname: `Nhà của ${fullName}` }])
      .select('familyid')
      .single()

    if (familyError) throw familyError

    // BƯỚC 2: Lưu thông tin Người dùng vào bảng Users
    // 🎯 type_id LUÔN LUÔN được server hard-code = 4 (Customer).
    // Việc nâng quyền lên Admin/Boss (type_id = 1) chỉ được thực hiện
    // thủ công trong Supabase Studio bởi người quản trị hệ thống,
    // KHÔNG BAO GIỜ qua API công khai này.
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{
        phone: phone,
        fullname: fullName,
        email: email,
        passwordhash: passwordHash,
        provider: provider || 'Local',
        providerid: providerId,
        avatarurl: avatarUrl,
        familyid: familyData.familyid,
        type_id: 4, // Customer mặc định — không nhận từ client
      }])
      .select()

    if (userError) throw userError

    return NextResponse.json(userData, { status: 201 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}