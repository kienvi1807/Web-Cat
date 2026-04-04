'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase' 

export default function CompleteProfilePage() {
  const router = useRouter()
  
  // 🎯 BIẾN MỚI: Màn che lúc chờ anh cảnh sát check DB
  const [isChecking, setIsChecking] = useState(true)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState('')
  const [providerId, setProviderId] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  
  // 👈 BƯỚC 1: Thêm biến lưu Nguồn gốc (Provider)
  const [authProvider, setAuthProvider] = useState('') 

  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: existingUser, error } = await supabase
          .from('users') 
          .select('*')
          .eq('email', user.email)
          .single()

        if (existingUser && existingUser.phone) {
          // LUỒNG 1: KHÁCH CŨ
          localStorage.setItem('kinvie_user', JSON.stringify({ 
            name: existingUser.fullName || existingUser.name || user.user_metadata.full_name, 
            type: 'Customer' 
          }))
          
          router.push('/')
        } else {
          // LUỒNG 2: KHÁCH MỚI
          setFullName(user.user_metadata?.full_name || '')
          setEmail(user.email || '')
          setProviderId(user.id)
          setAvatarUrl(user.user_metadata?.avatar_url || '')
          
          // 👈 BƯỚC 2: Tự động phân loại luồng khách từ Facebook hay Google
          const rawProvider = user.app_metadata?.provider || 'Khác'
          const formattedProvider = rawProvider === 'facebook' ? 'Facebook' : (rawProvider === 'google' ? 'Google' : 'Khác')
          setAuthProvider(formattedProvider)

          // VÉN MÀN LÊN CHO KHÁCH ĐIỀN FORM
          setIsChecking(false)
        }
      } else {
         router.push('/login')
      }
    }

    checkUserStatus()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const cleanPhone = phone.trim()

    // 👈 BƯỚC 3: Thay vì đếm độ dài sơ sài, dùng luôn rào chắn 10 số chuẩn VN như bên Login
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/
    if (!phoneRegex.test(cleanPhone)) {
      setError('Số điện thoại không hợp lệ! Vui lòng nhập chuẩn 10 số (VD: 0912345678).')
      setLoading(false)
      return
    }

    try {
      const payload = {
        fullName: fullName,
        phone: cleanPhone, // Dùng số đã xóa khoảng trắng
        email: email, 
        provider: authProvider, // 👈 BƯỚC 4: Lấy biến động, không gõ cứng "Google" nữa
        providerId: providerId,
        avatarUrl: avatarUrl
      }

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Có lỗi xảy ra khi lưu dữ liệu')
      }

      localStorage.setItem('kinvie_user', JSON.stringify({ name: fullName, type: 'Customer' }))

      alert('Đăng ký thành công! Chào mừng bạn đến với KinVie Petshop.')
      router.push('/') 
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 🎯 GIAO DIỆN CHỜ (MÀN CHE): Trả về lúc đang check DB
  if (isChecking) {
    return (
      <div className="min-h-screen bg-pink-50/30 flex flex-col items-center justify-center font-sans">
        <div className="text-4xl text-pink-300 animate-[spin_2s_linear_infinite] mb-4">🐾</div>
        <p className="text-stone-400 font-medium text-sm animate-pulse">Đang kết nối dữ liệu...</p>
      </div>
    )
  }

  // BÊN DƯỚI LÀ GIAO DIỆN FORM CŨ GIỮ NGUYÊN (Chỉ hiện ra khi isChecking = false)
  return (
    <div className="min-h-screen bg-pink-50/30 flex items-center justify-center font-sans relative overflow-hidden p-4">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-200/40 rounded-full mix-blend-multiply blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-rose-100/50 rounded-full mix-blend-multiply blur-[80px] pointer-events-none"></div>

      {/* Form Container */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-pink-50 w-full max-w-md p-8 sm:p-12 relative z-10">
        
        {/* Header */}
        <div className="mb-8 text-center">
          {avatarUrl && (
            <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-pink-100 shadow-sm object-cover" />
          )}
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-2">
            Hoàn tất hồ sơ
          </h2>
          <p className="text-stone-500 text-sm">
            Để KinVie phục vụ Boss nhà bạn tốt nhất, vui lòng bổ sung thông tin!
          </p>
        </div>

        {/* Form nhập liệu */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          
          <div>
            <label htmlFor="fullName" className="block text-xs font-bold text-stone-500 uppercase mb-2">
              Họ và tên
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              placeholder="Ví dụ: Nguyễn Văn A"
              className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:bg-white transition-colors"
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-bold text-stone-500 uppercase mb-2">
              Số điện thoại liên hệ <span className="text-rose-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="09xx xxx xxx"
              className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:bg-white transition-colors"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Hiển thị lỗi */}
          {error && (
            <div className="text-pink-600 text-sm font-medium text-center mt-2">
              {error}
            </div>
          )}

          {/* Nút Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-3.5 rounded-xl flex items-center justify-center shadow-md mt-6 transition-colors ${
              loading 
                ? 'bg-pink-300 cursor-not-allowed shadow-none' 
                : 'bg-pink-500 hover:bg-pink-600 shadow-pink-200'
            }`}
          >
            {loading ? 'Đang xử lý...' : 'Hoàn tất đăng ký'}
          </button>
        </form>

      </div>
    </div>
  )
}