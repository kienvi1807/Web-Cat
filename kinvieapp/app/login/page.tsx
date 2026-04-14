"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function LoginPage() {
  // STATE CHUYỂN FORM
  const [isLoginView, setIsLoginView] = useState(true);
  const router = useRouter();

  // STATE HỨNG DỮ LIỆU
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // State lưu tên
  const [isLoading, setIsLoading] = useState(false);

  // HÀM ĐĂNG NHẬP GOOGLE
  const handleGoogleLogin = async () => {
    const getURL = () => {
      let url = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
      url = url.charAt(url.length - 1) === '/' ? url.slice(0, -1) : url;
      return url;
    };

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        // 🎯 Dùng chung route callback với Facebook để xử lý logic "người mới/người cũ"
        redirectTo: `${getURL()}/auth/callback`,
        // Thêm cái này để Google luôn hiện bảng chọn tài khoản nếu muốn
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });
    
    if (error) alert('Đăng nhập Google thất bại, vui lòng thử lại!');
  };

  // HÀM ĐĂNG NHẬP FACEBOOK
  const handleFacebookLogin = async () => {
    const getURL = () => {
      let url = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
      url = url.charAt(url.length - 1) === '/' ? url.slice(0, -1) : url;
      return url;
    };

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { 
        // 🎯 Trỏ về route callback để mình xử lý logic điều hướng
        redirectTo: `${getURL()}/auth/callback` 
      }
    });
  
    if (error) alert('Đăng nhập thất bại!');
  };

  // HÀM XỬ LÝ SUBMIT (ĐĂNG NHẬP / ĐĂNG KÝ BẰNG SỐ ĐIỆN THOẠI)
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 

    const cleanPhone = phone.trim();
    const fakeEmail = `sen_${cleanPhone}@kinvie.com`;

    // 1. Kiểm tra rỗng SĐT & Mật khẩu
    if (!cleanPhone || !password) {
      alert("Điền đủ số điện thoại và mật khẩu đã Sen ơi!");
      return;
    }

    // 2. Kiểm tra định dạng số điện thoại chuẩn VN
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(cleanPhone)) {
      alert("Số điện thoại không hợp lệ! Sen nhập chuẩn 10 số (ví dụ: 0912345678) nhé.");
      return;
    }

    setIsLoading(true);

    if (isLoginView) {
      // ==========================================
      // LUỒNG ĐĂNG NHẬP
      // ==========================================
      
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('phone', cleanPhone)
        .single();

      if (!existingUser) {
        alert("Số điện thoại này chưa được đăng ký! Chuyển sang tạo tài khoản nhé.");
        setIsLoginView(false); 
        setIsLoading(false);
        return;
      }

      const isSocialAccount = existingUser.avatarurl?.includes('facebook') || existingUser.avatarurl?.includes('googleusercontent');
      if (isSocialAccount) {
        alert("Số điện thoại này đã được liên kết với mạng xã hội! Bấm nút Facebook/Google ở phía trên nhé.");
        setIsLoading(false);
        return;
      }

      // BƯỚC 3: ĐĂNG NHẬP
      // Lấy email thật từ Database, lỡ Database trống thì dùng tạm email ảo
      const loginEmail = existingUser.email || fakeEmail; 

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: loginEmail, 
        password: password,
      });

      if (loginError) {
        // 👈 QUAN TRỌNG NHẤT NẰM Ở ĐÂY: Hiển thị lỗi THẬT của Supabase để bắt bệnh
        alert(`Không vào được cửa! Lỗi hệ thống báo: ${loginError.message}`);
        setPassword(''); 
      } else {
        alert("Đăng nhập thành công! Chào mừng trở lại Beam Petshop.");
        router.push('/profile');
      }

    } else {
      // ==========================================
      // LUỒNG ĐĂNG KÝ
      // ==========================================
      
      const cleanName = fullName.trim();
      
      // Bắt buộc nhập tên
      if (!cleanName) {
        alert("Sen ơi điền thêm Họ và tên để shop xưng hô cho thân mật nhé!");
        setIsLoading(false);
        return;
      }

      // Kiểm tra trùng SĐT
      const { data: existingUser } = await supabase
        .from('users')
        .select('phone')
        .eq('phone', cleanPhone)
        .single();

      if (existingUser) {
        alert("Số điện thoại này đã được đăng ký rồi! Sen chuyển qua form Đăng nhập nhé.");
        setIsLoginView(true); 
        setIsLoading(false);
        return;
      }

      // Bắn lệnh tạo Auth cho Supabase bằng Email ảo
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: fakeEmail, // 👈 Dùng biến vừa tạo
        password: password,
      });

      if (signUpError) {
        alert("Lỗi tạo tài khoản: " + signUpError.message);
        setIsLoading(false);
        return;
      }

      // Lưu thông tin vào bảng Users
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            phone: cleanPhone, // Số điện thoại xịn vẫn lưu vào cột phone để shop gọi
            fullname: cleanName,
            type_id: 4, 
            email: fakeEmail // 👈 Lưu cái email ảo có chữ "sen_" vào đây
          }
        ]);

      if (insertError) console.error("Lỗi lưu hồ sơ:", insertError);

      alert("Tạo tài khoản thành công! Chào mừng Sen đến với KinVie Cattery.");
      router.push('/profile'); 
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-pink-50/30 flex items-center justify-center font-sans relative overflow-hidden p-4">
      {/* --- INLINE STYLE CHO ANIMATION MÈO CHẠY (Copy từ Header) --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes run-front { 0% { transform: rotate(30deg); } 100% { transform: rotate(-40deg); } }
        @keyframes run-back { 0% { transform: rotate(-40deg); } 100% { transform: rotate(30deg); } }
        @keyframes tail-wag { 0% { transform: rotate(10deg); } 100% { transform: rotate(-20deg); } }
        @keyframes cat-bounce { 0% { transform: translateY(0px); } 100% { transform: translateY(-3px); } }
        
        .cat-leg-f { transform-origin: 65px 50px; animation: run-front 0.2s infinite alternate ease-in-out; }
        .cat-leg-b { transform-origin: 35px 50px; animation: run-back 0.2s infinite alternate ease-in-out; }
        .cat-tail { transform-origin: 25px 45px; animation: tail-wag 0.25s infinite alternate ease-in-out; }
        .cat-body-group { animation: cat-bounce 0.2s infinite alternate ease-in-out; }
      `}} />

      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-200/40 rounded-full mix-blend-multiply blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-rose-100/50 rounded-full mix-blend-multiply blur-[80px] pointer-events-none"></div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-pink-50 w-full max-w-4xl flex overflow-hidden relative z-10">
        
        {/* CỘT TRÁI (Ẩn trên mobile) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-pink-100 to-rose-100 p-10 flex-col items-center justify-center relative">
          <Link href="/" className="absolute top-8 left-8 bg-white/50 backdrop-blur w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-colors">
             <span className="text-stone-600 text-sm">❮</span>
          </Link>
          
          {/* 👇 👇 👇 THAY THẾ CHỖ NÀY !!! 👇 👇 👇 */}
          {/* CONTAINER CHỨA LOGO MÈO CHẠY (Giữ nguyên kích thước w-48 h-48) */}
          <div className="w-48 h-48 relative flex items-center justify-center transition-all duration-300 mb-8 mt-12">
              
              {/* 1. VÒNG QUỸ ĐẠO border-dashed & ANIMATION CHẠY */}
              <div className="absolute border-2 border-pink-300 border-dashed rounded-full animate-[spin_10s_linear_infinite] z-20 w-40 h-40">
                
                {/* SVG CON MÈO CHẠY Ở TRÊN CÙNG */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 text-pink-500 drop-shadow-sm">
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-current stroke-current overflow-visible">
                    <g className="cat-body-group">
                       <path className="cat-tail" d="M25,45 Q10,25 15,10" fill="none" strokeWidth="5" strokeLinecap="round"/>
                       <line className="cat-leg-b" x1="35" y1="50" x2="25" y2="75" strokeWidth="6" strokeLinecap="round"/>
                       <line className="cat-leg-b" x1="45" y1="50" x2="35" y2="75" strokeWidth="6" strokeLinecap="round" style={{animationDelay: '0.1s', opacity: 0.6}}/>
                       <line className="cat-leg-f" x1="65" y1="50" x2="70" y2="75" strokeWidth="6" strokeLinecap="round"/>
                       <line className="cat-leg-f" x1="55" y1="50" x2="60" y2="75" strokeWidth="6" strokeLinecap="round" style={{animationDelay: '0.1s', opacity: 0.6}}/>
                       <ellipse cx="50" cy="45" rx="25" ry="15" className="stroke-none" />
                       <circle cx="75" cy="35" r="14" className="stroke-none" />
                       <polygon points="68,25 65,10 78,25" className="stroke-none" />
                       <polygon points="82,25 85,10 72,25" className="stroke-none" />
                    </g>
                  </svg>
                </div>

                {/* Dấu chân decor trên vòng tròn */}
                <div className="absolute top-1/2 -left-3 -translate-y-1/2 -rotate-90 text-[10px] opacity-60 text-pink-400">🐾</div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rotate-180 text-[10px] opacity-30 text-pink-400">🐾</div>
              </div>
              
              {/* 2. LOGO HÌNH ẢNH Ở GIỮA */}
              <div className="absolute rounded-full overflow-hidden shadow-md border-2 border-white bg-white z-10 w-32 h-32">
                <Image 
                  src="/images/logo.jpg" 
                  alt="KinVie Logo" 
                  fill
                  className="object-cover" 
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority
                />
              </div>
              
          </div>
          {/* 👆 👆 👆 THAY THẾ CHỖ NÀY !!! 👆 👆 👆 */}
          
          <h2 className="font-serif text-3xl font-bold text-stone-800 text-center mb-4 mt-2">
            Beam Petshop & <br/> KinVie Cattery
          </h2>
          <p className="text-stone-500 text-center max-w-xs text-sm leading-relaxed">
            Đăng nhập ngay để theo dõi lịch sử đón mèo, tích điểm mua sắm và nhận các ưu đãi đặc quyền cho Boss!
          </p>
        </div>

        {/* CỘT PHẢI: Form Đăng nhập / Đăng ký */}
        <div className="w-full md:w-1/2 p-8 sm:p-12">
          
          <div className="md:hidden mb-8">
            <Link href="/" className="text-stone-400 hover:text-pink-500 text-sm flex items-center gap-2">
              <span>❮</span> Quay lại trang chủ
            </Link>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-2">
            {isLoginView ? 'Chào mừng Sen trở lại!' : 'Tạo tài khoản mới'}
          </h2>
          <p className="text-stone-500 text-sm mb-8">
            {isLoginView ? 'Đăng nhập để tiếp tục trải nghiệm mua sắm.' : 'Đăng ký ngay để nhận voucher 50K cho đơn hàng đầu tiên.'}
          </p>

          {/* MẠNG XÃ HỘI */}
          <div className="flex flex-col gap-3 mb-8">
            <button onClick={handleGoogleLogin} className="w-full border border-stone-200 hover:border-pink-300 hover:bg-pink-50 text-stone-600 font-medium py-3 rounded-xl flex items-center justify-center gap-3 transition-colors">
              <span className="text-xl">🇬</span> Tiếp tục với Google (Gmail)
            </button>
            <button onClick={handleFacebookLogin} className="w-full border border-stone-200 hover:border-blue-300 hover:bg-blue-50 text-stone-600 font-medium py-3 rounded-xl flex items-center justify-center gap-3 transition-colors">
              <span className="text-xl text-blue-600">🇫</span> Tiếp tục với Facebook
            </button>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-stone-100"></div>
            <span className="text-xs text-stone-400 font-medium uppercase">Hoặc dùng số điện thoại</span>
            <div className="flex-1 h-px bg-stone-100"></div>
          </div>

          {/* FORM ĐIỀN THÔNG TIN */}
          <form className="space-y-4" onSubmit={handlePhoneSubmit}>
            
            {!isLoginView && (
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Họ và tên</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Trung Kiên" 
                  className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:bg-white transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Số điện thoại</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xx xxx xxx" 
                className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-stone-500 uppercase">Mật khẩu</label>
                {isLoginView && (
                  <a href="#" className="text-xs text-pink-500 hover:underline">Quên mật khẩu?</a>
                )}
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:bg-white transition-colors"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full text-white font-bold py-3.5 rounded-xl flex items-center justify-center shadow-md mt-6 block text-center transition-all 
                ${isLoading ? 'bg-stone-300 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600 shadow-pink-200'}`}
            >
              {isLoading ? 'Đang xử lý...' : (isLoginView ? 'Đăng Nhập' : 'Tạo Tài Khoản')}
            </button>
          </form>

          {/* NÚT TOGGLE ĐỔI FORM */}
          <div className="mt-8 text-center text-sm text-stone-500">
            {isLoginView ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button 
              onClick={() => {
                setIsLoginView(!isLoginView);
                // Reset form khi lật trang cho sạch
                setPhone('');
                setPassword('');
                setFullName('');
              }}
              className="text-pink-500 font-bold hover:underline"
            >
              {isLoginView ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}