import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Hàm GET cũ của ông giữ nguyên ở đây...
export async function GET(request: Request) {
   // ... (code cũ)
}

// THÊM HÀM POST: Xử lý Đăng ký tài khoản (Local & Social)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    // 🎯 THÊM biến typeId vào đây để hứng từ Frontend gửi lên
    const { phone, fullName, email, passwordHash, provider, providerId, avatarUrl, typeId } = body

    // BƯỚC 1: Tạo một "Hộ gia đình" mặc định cho khách hàng mới
    // Dù họ đang độc thân, cứ tạo sẵn 1 cái Family để sau này dễ gộp
    const { data: familyData, error: familyError } = await supabase
      .from('families')
      .insert([{ familyname: `Nhà của ${fullName}` }]) // Tự động đặt tên: "Nhà của Kiên"
      .select('familyid')
      .single()

    if (familyError) throw familyError

    // BƯỚC 2: Lưu thông tin Người dùng vào bảng Users
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
        // 🎯 Lắp cột type_id vào. Nếu frontend truyền xuống thì lấy, không truyền thì chốt số 4 (Customer Đồng)
        type_id: typeId || 4 
      }])
      .select()

    if (userError) throw userError

    // Trả về dữ liệu thành công cho Frontend
    return NextResponse.json(userData, { status: 201 })

  } catch (error: any) {
    // Trả về lỗi
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}