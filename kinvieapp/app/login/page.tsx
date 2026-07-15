"use client";

import React, { useState, useEffect } from 'react';
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
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ==========================================
  // 🎯 HÀM GHI LOG LƯỢT ĐĂNG NHẬP
  // ==========================================
  const logLogin = async (userid: number, provider: string) => {
    const { error } = await supabase
      .from('login_logs')
      .insert([{ userid, source: provider }]);
    if (error) console.error('Lỗi ghi log đăng nhập:', error);
  };

  // ==========================================
  // 📸 BƯỚC 1: CAMERA THEO DÕI TRẠNG THÁI 
  // ==========================================
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: dbUser } = await supabase
          .from('users')
          .select('userid')
          .eq('email', session.user.email)
          .maybeSingle();

        if (!dbUser) {
          router.push('/register/complete-profile');
        } else {
          // 🎯 Khách cũ đăng nhập thành công -> ghi 1 dòng log
          const provider = session.user.app_metadata?.provider || 'password';
          logLogin(dbUser.userid, provider);

          router.push('/');
        }
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const getURL = () => {
    let url =
      process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.NEXT_PUBLIC_VERCEL_URL ??
      'http://localhost:3000';
    url = url.includes('http') ? url : `https://${url}`;
    url = url.charAt(url.length - 1) === '/' ? url.slice(0, -1) : url;
    return url;
  };

  // ==========================================
  // 🚀 BƯỚC 2: HÀM ĐĂNG NHẬP MẠNG XÃ HỘI
  // ==========================================
  const handleLogin = async (provider: 'google' | 'facebook') => {
    localStorage.setItem('kinvie_oauth_provider', provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${getURL()}/login`,
        queryParams: provider === 'google' ? {
          access_type: 'offline',
          prompt: 'consent',
        } : undefined,
      },
    });

    if (error) {
      console.error(`Chi tiết lỗi ${provider}:`, error);
      alert(`Lỗi đăng nhập: ${error.message}`);
    }
  };

  // HÀM XỬ LÝ SUBMIT (Đã tách cờ isLoginAction để dùng chung cho 2 form)
  const handlePhoneSubmit = async (e: React.FormEvent, isLoginAction: boolean) => {
    e.preventDefault();

    const cleanPhone = phone.trim();
    const fakeEmail = `sen_${cleanPhone}@kinvie.com`;

    if (!cleanPhone || !password) {
      alert("Điền đủ số điện thoại và mật khẩu đã Sen ơi!");
      return;
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(cleanPhone)) {
      alert("Số điện thoại không hợp lệ! Sen nhập chuẩn 10 số (ví dụ: 0912345678) nhé.");
      return;
    }

    setIsLoading(true);

    if (isLoginAction) {
      // --- LUỒNG ĐĂNG NHẬP ---
      const lookupRes = await fetch('/api/auth/lookup-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });
      const lookupData = await lookupRes.json();

      if (!lookupData.exists) {
        alert("Số điện thoại này chưa được đăng ký! Chuyển sang tạo tài khoản nhé.");
        setIsLoginView(false);
        setIsLoading(false);
        return;
      }

      if (lookupData.isSocialAccount && !lookupData.email) {
        alert("Số điện thoại này đã được liên kết với mạng xã hội! Bấm nút Facebook/Google ở phía trên nhé.");
        setIsLoading(false);
        return;
      }

      const loginEmail = lookupData.email || fakeEmail;
      const { error: loginError } = await supabase.auth.signInWithPassword({ email: loginEmail, password });

      if (loginError) {
        alert(`Không vào được cửa! Lỗi hệ thống báo: ${loginError.message}`);
        setPassword('');
      } else {
        alert("Đăng nhập thành công! Chào mừng trở lại Beam Petshop.");
        router.push('/');
      }

    } else {
      // --- LUỒNG ĐĂNG KÝ ---
      const cleanName = fullName.trim();
      if (!cleanName) {
        alert("Sen ơi điền thêm Họ và tên để shop xưng hô cho thân mật nhé!");
        setIsLoading(false); return;
      }

      const checkRes = await fetch('/api/auth/lookup-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });
      const checkData = await checkRes.json();
      if (checkData.exists) {
        alert("Số điện thoại này đã được đăng ký rồi! Sen chuyển qua form Đăng nhập nhé.");
        setIsLoginView(true);
        setIsLoading(false); return;
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({ email: fakeEmail, password });
      if (signUpError) {
        alert("Lỗi tạo tài khoản: " + signUpError.message);
        setIsLoading(false); return;
      }

      const { error: insertError } = await supabase.from('users').insert([
        { phone: cleanPhone, fullname: cleanName, type_id: 4, email: fakeEmail }
      ]);
      if (insertError) console.error("Lỗi lưu hồ sơ:", insertError);

      alert("Tạo tài khoản thành công! Chào mừng Sen đến với KinVie Cattery.");
      router.push('/profile');
    }

    setIsLoading(false);
  };

  // 🌟 COMPONENT NÚT SOCIAL (Đã Nâng Cấp Animation & Logo)
  const SocialButtons = () => (
    <div className="flex flex-col gap-3 mb-6">
      <button type="button" onClick={() => handleLogin('google')} className="group w-full bg-white border border-stone-200 hover:border-rose-300 hover:bg-rose-50 text-stone-600 font-semibold py-3 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-95">
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
        Tiếp tục với Google
      </button>
      <button type="button" onClick={() => handleLogin('facebook')} className="group w-full bg-[#1877F2] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-blue-500/30 hover:bg-[#166fe5] hover:-translate-y-1 active:scale-95">
        <svg className="w-6 h-6 fill-current group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
        Tiếp tục với Facebook
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-pink-50/30 flex items-center justify-center font-sans relative overflow-hidden p-4">

      {/* --- INLINE STYLE CON MÈO GỐC CỦA SẾP --- */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes run-front { 0% { transform: rotate(30deg); } 100% { transform: rotate(-40deg); } }
        @keyframes run-back { 0% { transform: rotate(-40deg); } 100% { transform: rotate(30deg); } }
        @keyframes tail-wag { 0% { transform: rotate(10deg); } 100% { transform: rotate(-20deg); } }
        @keyframes cat-bounce { 0% { transform: translateY(0px); } 100% { transform: translateY(-3px); } }
        
        .cat-leg-f { transform-origin: 65px 50px; animation: run-front 0.5s infinite alternate ease-in-out; }
        .cat-leg-b { transform-origin: 35px 50px; animation: run-back 0.5s infinite alternate ease-in-out; }
        .cat-tail { transform-origin: 25px 45px; animation: tail-wag 0.6s infinite alternate ease-in-out; }
        .cat-body-group { animation: cat-bounce 0.5s infinite alternate ease-in-out; }
      `}} />

      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-200/40 rounded-full mix-blend-multiply blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-rose-100/50 rounded-full mix-blend-multiply blur-[80px] pointer-events-none"></div>

      {/* KHUNG MAIN CHỨA TẤT CẢ (Sửa md:h-[650px] để cố định chiều cao cho thanh trượt) */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-pink-50 w-full max-w-4xl flex flex-col md:block overflow-hidden relative z-10 md:h-[650px]">

        {/* ============================================================
            📱 GIAO DIỆN ĐIỆN THOẠI (Xếp dọc bình thường như code cũ)
            ============================================================ */}
        <div className="md:hidden w-full p-8 sm:p-12">
          <div className="mb-8">
            <Link href="/" className="text-stone-400 hover:text-pink-500 text-sm flex items-center gap-2"><span>❮</span> Quay lại trang chủ</Link>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-2">{isLoginView ? 'Chào mừng Sen trở lại!' : 'Tạo tài khoản mới'}</h2>
          <p className="text-stone-500 text-sm mb-8">{isLoginView ? 'Đăng nhập để tiếp tục trải nghiệm mua sắm.' : 'Đăng ký ngay để nhận voucher 50K cho đơn hàng đầu tiên.'}</p>

          <SocialButtons />

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-stone-100"></div><span className="text-xs text-stone-400 font-medium uppercase">Hoặc dùng số điện thoại</span><div className="flex-1 h-px bg-stone-100"></div>
          </div>

          <form className="space-y-4" onSubmit={(e) => handlePhoneSubmit(e, isLoginView)}>
            {!isLoginView && (
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Họ và tên</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ví dụ: Nguyễn Trung Kiên" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:bg-white transition-colors" />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Số điện thoại</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xx xxx xxx" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:bg-white transition-colors" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-stone-500 uppercase">Mật khẩu</label>
                {isLoginView && <a href="#" className="text-xs text-pink-500 hover:underline">Quên mật khẩu?</a>}
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:bg-white transition-colors" />
            </div>
            <button type="submit" disabled={isLoading} className={`w-full text-white font-bold py-3.5 rounded-xl flex items-center justify-center shadow-md mt-6 transition-all ${isLoading ? 'bg-stone-300 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600 shadow-pink-200'}`}>
              {isLoading ? 'Đang xử lý...' : (isLoginView ? 'Đăng Nhập' : 'Tạo Tài Khoản')}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-stone-500">
            {isLoginView ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button onClick={() => { setIsLoginView(!isLoginView); setPassword(''); }} className="text-pink-500 font-bold hover:underline">{isLoginView ? 'Đăng ký ngay' : 'Đăng nhập'}</button>
          </div>
        </div>

        {/* ============================================================
            💻 GIAO DIỆN DESKTOP (Có Hiệu Ứng Trượt Mượt Mà)
            ============================================================ */}

        {/* 1. KHUNG ĐĂNG KÝ (Ẩn chờ ở bên Trái) */}
        <div className={`hidden md:block absolute top-0 left-0 w-1/2 h-full p-12 overflow-y-auto transition-all duration-[1200ms] ease-in-out ${!isLoginView ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 pointer-events-none -translate-x-12'}`}>
          <h2 className="text-3xl font-bold text-stone-800 mb-2 mt-4">Tạo tài khoản mới</h2>
          <p className="text-stone-500 text-sm mb-6">Đăng ký ngay để nhận voucher 50K cho đơn hàng đầu tiên.</p>
          <SocialButtons />
          <div className="flex items-center gap-4 mb-6"><div className="flex-1 h-px bg-stone-100"></div><span className="text-xs text-stone-400 font-medium uppercase">Hoặc dùng số điện thoại</span><div className="flex-1 h-px bg-stone-100"></div></div>

          <form className="space-y-4" onSubmit={(e) => handlePhoneSubmit(e, false)}>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Họ và tên" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 transition-colors" />
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 transition-colors" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 transition-colors" />
            <button type="submit" disabled={isLoading} className="w-full text-white font-bold py-3.5 rounded-xl bg-pink-500 hover:bg-pink-600 shadow-lg shadow-pink-200 hover:-translate-y-0.5 active:scale-95 transition-all mt-4">
              {isLoading ? 'Đang xử lý...' : 'Tạo Tài Khoản'}
            </button>
          </form>
        </div>

        {/* 2. KHUNG ĐĂNG NHẬP (Ẩn chờ ở bên Phải) */}
        <div className={`hidden md:block absolute top-0 right-0 w-1/2 h-full p-12 overflow-y-auto transition-all duration-[1200ms] ease-in-out ${isLoginView ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 pointer-events-none translate-x-12'}`}>
          <h2 className="text-3xl font-bold text-stone-800 mb-2 mt-4">Chào mừng Sen trở lại!</h2>
          <p className="text-stone-500 text-sm mb-6">Đăng nhập để tiếp tục trải nghiệm mua sắm.</p>
          <SocialButtons />
          <div className="flex items-center gap-4 mb-6"><div className="flex-1 h-px bg-stone-100"></div><span className="text-xs text-stone-400 font-medium uppercase">Hoặc dùng số điện thoại</span><div className="flex-1 h-px bg-stone-100"></div></div>

          <form className="space-y-4" onSubmit={(e) => handlePhoneSubmit(e, true)}>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 transition-colors" />
            <div>
              <div className="flex justify-between items-center mb-1.5 px-1">
                <label className="text-xs text-stone-500 font-medium">Mật khẩu</label>
                <a href="#" className="text-xs text-pink-500 font-bold hover:underline">Quên mật khẩu?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 transition-colors"
              />
            </div>
            <button type="submit" disabled={isLoading} className="w-full text-white font-bold py-3.5 rounded-xl bg-pink-500 hover:bg-pink-600 shadow-lg shadow-pink-200 hover:-translate-y-0.5 active:scale-95 transition-all mt-4">
              {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </button>
          </form>
        </div>

        {/* 3. CÁNH CỬA CON MÈO (Trượt qua trượt lại che 2 Form) */}
        <div className={`hidden md:flex absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-pink-100 to-rose-100 p-10 flex-col items-center justify-center transition-transform duration-[1500ms] ease-in-out z-20 shadow-2xl ${!isLoginView ? 'translate-x-full' : 'translate-x-0'}`}>
          <Link href="/" className="absolute top-8 left-8 bg-white/50 backdrop-blur w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-colors z-30">
            <span className="text-stone-600 text-sm">❮</span>
          </Link>

          <div className="w-48 h-48 relative flex items-center justify-center mb-8 mt-4">
            {/* CON MÈO VÀ VÒNG TRÒN XOAY */}
            <div className="absolute border-2 border-pink-300 border-dashed rounded-full animate-[spin_10s_linear_infinite] z-20 w-40 h-40">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 text-pink-500 drop-shadow-sm">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-current stroke-current overflow-visible">
                  <g className="cat-body-group">
                    <path className="cat-tail" d="M25,45 Q10,25 15,10" fill="none" strokeWidth="5" strokeLinecap="round" />
                    <line className="cat-leg-b" x1="35" y1="50" x2="25" y2="75" strokeWidth="6" strokeLinecap="round" />
                    <line className="cat-leg-b" x1="45" y1="50" x2="35" y2="75" strokeWidth="6" strokeLinecap="round" style={{ animationDelay: '0.1s', opacity: 0.6 }} />
                    <line className="cat-leg-f" x1="65" y1="50" x2="70" y2="75" strokeWidth="6" strokeLinecap="round" />
                    <line className="cat-leg-f" x1="55" y1="50" x2="60" y2="75" strokeWidth="6" strokeLinecap="round" style={{ animationDelay: '0.1s', opacity: 0.6 }} />
                    <ellipse cx="50" cy="45" rx="25" ry="15" className="stroke-none" />
                    <circle cx="75" cy="35" r="14" className="stroke-none" />
                    <polygon points="68,25 65,10 78,25" className="stroke-none" />
                    <polygon points="82,25 85,10 72,25" className="stroke-none" />
                  </g>
                </svg>
              </div>
              <div className="absolute top-1/2 -left-3 -translate-y-1/2 -rotate-90 text-[10px] opacity-60 text-pink-400">🐾</div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rotate-180 text-[10px] opacity-30 text-pink-400">🐾</div>
            </div>

            {/* LOGO */}
            <div className="absolute rounded-full overflow-hidden shadow-md border-2 border-white bg-white z-10 w-32 h-32">
              <Image src="/images/logo.jpg" alt="KinVie Logo" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" priority />
            </div>
          </div>

          <h2 className="font-serif text-3xl font-bold text-stone-800 text-center mb-4 mt-2">
            Beam Petshop & <br /> KinVie Cattery
          </h2>
          <p className="text-stone-500 text-center max-w-xs text-sm leading-relaxed h-16">
            {isLoginView
              ? 'Chưa có tài khoản? Tham gia ngay để kết nối với các Boss Maine Coon!'
              : 'Đã có tài khoản? Hãy đăng nhập để tiếp tục tích điểm mua sắm.'}
          </p>

          {/* NÚT CHUYỂN ĐỔI GẮN TRÊN CÁNH CỬA */}
          <button
            onClick={() => { setIsLoginView(!isLoginView); setPassword(''); setFullName(''); }}
            className="mt-6 px-10 py-3 border-2 border-pink-400 text-pink-500 rounded-full font-bold hover:bg-pink-400 hover:text-white transition-colors active:scale-95"
          >
            {isLoginView ? 'Chuyển sang Đăng Ký' : 'Chuyển sang Đăng Nhập'}
          </button>

        </div>

      </div>
    </div>
  );
}