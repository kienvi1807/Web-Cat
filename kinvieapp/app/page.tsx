"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CarouselBanner from '@/components/home/CarouselBanner';
import HeroBanner from '@/components/home/HeroBanner';
import { supabase } from '@/lib/supabase';

// ==========================================
// WIDGET POPUP TROLL KHÁCH HÀNG (ReviewPopup)
// ==========================================
const ReviewPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [hateButtonPos, setHateButtonPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Lưu state user để lúc bấm Like còn biết user nào mà update
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const checkUserAndLikeStatus = async () => {
      try {
        // 1. KIỂM TRA KHÁCH ĐÃ ĐĂNG NHẬP CHƯA
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        // Nếu khách chưa đăng nhập -> Dừng luôn, không làm gì cả
        if (!user || authError) return;

        // 2. KIỂM TRA TRONG DATABASE XEM KHÁCH ĐÃ LIKE CHƯA
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select('userid, hasliked')
          // So khớp user đăng nhập với cột email trong bảng users (sếp có thể đổi thành providerid nếu muốn)
          .eq('email', user.email)
          .single();

        if (dbError || !userData) return;
        setCurrentUser(userData);

        // 3. NẾU BẰNG TRUE -> ĐÃ LIKE -> KHÔNG HIỆN LAYER NỮA (DỪNG LUÔN)
        if (userData.hasliked === true) return;

        // 4. NẾU BẰNG FALSE -> CHƯA LIKE -> CHỜ 2 PHÚT (120.000 ms) RỒI BẬT LAYER
        const timer = setTimeout(() => {
          setShowPopup(true);
        }, 15000);

        return () => clearTimeout(timer);

      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái User:", error);
      }
    };

    checkUserAndLikeStatus();
  }, []);

  // Hàm làm nút "Ghét" chạy lung tung mỗi khi khách di chuột hoặc chạm vào
  const moveHateButton = () => {
    if (buttonRef.current) {
      // Nhảy ngẫu nhiên trong khoảng -150px đến 150px để khách không bấm được
      const newTop = Math.random() * 300 - 150;
      const newLeft = Math.random() * 300 - 150;
      setHateButtonPos({ top: newTop, left: newLeft });
    }
  };

  const handleLike = async () => {
    try {
      // 5. CHỈ ĐƯỢC ẤN THÍCH THÌ SẼ UPDATE VÀO DATABASE
      if (currentUser?.userid) {
        const { error } = await supabase
          .from('users')
          .update({ hasliked: true })
          .eq('userid', currentUser.userid);

        if (error) {
          console.error("Lỗi update Database:", error);
          return;
        }
      }

      alert("Cảm ơn Sen đã yêu thương KinVie! 🥰");
      setShowPopup(false); // Cất layer đi
    } catch (error) {
      console.error("Lỗi update DB:", error);
    }
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-center max-w-md w-full relative overflow-hidden border border-pink-100">
        <h2 className="text-3xl font-black text-pink-500 mb-3">Xin chào Sen! 👋</h2>
        <p className="text-stone-600 mb-8 font-medium">Lượn web KinVie nãy giờ, Sen thấy web của tụi mình có xịn không nàooo?</p>

        <div className="relative h-40 flex items-center justify-center gap-4">

          {/* NÚT THÍCH (Đứng im, bấm được) */}
          <button
            onClick={handleLike}
            className="relative z-10 bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold py-3 px-8 rounded-full shadow-[0_10px_20px_-10px_rgba(244,113,182,0.8)] hover:scale-105 transition-transform"
          >
            Đẹp xỉu luôn! 😻
          </button>

          {/* NÚT GHÉT (Cứ di chuột là nhảy lung tung) */}
          <button
            ref={buttonRef}
            onMouseEnter={moveHateButton} // Máy tính (Di chuột)
            onTouchStart={moveHateButton} // Điện thoại (Chạm tay)
            className="absolute bg-stone-100 text-stone-500 font-bold py-3 px-8 rounded-full shadow-sm transition-all duration-200 ease-out z-20"
            style={{
              transform: `translate(${hateButtonPos.left}px, ${hateButtonPos.top}px)`,
            }}
          >
            Cũng bình thường 😿
          </button>

        </div>
      </div>
    </div>
  );
};

// ==========================================
// CODE TRANG CHỦ HIỆN TẠI CỦA SẾP
// ==========================================
export default function Home() {
  return (
    <div className="min-h-screen bg-white text-stone-700 font-sans selection:bg-pink-200 selection:text-pink-900 relative isolate">
      <Header />

      {/* 🌟 LỚP NỀN ẢNH CỐ ĐỊNH DÙNG CHUNG CHO 4 BANNER — thay cho bg-fixed (Safari iOS chặn bg-fixed) */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/logo.jpg')" }}
      />

      <main className="relative z-10 pt-16">

        <HeroBanner />

        {/* PHẦN 1: KINVIE CATTERY */}
        <section className="relative h-[60vh] flex items-center justify-center">
          <div className="absolute inset-0 bg-stone-900/65 z-0"></div>
          <div className="relative z-10 text-center px-4">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight drop-shadow-2xl">
              KinVie <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400 font-serif italic font-light">Cattery</span>
            </h2>
          </div>
        </section>

        <section className="py-32 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-[500px] h-[500px] bg-pink-200/70 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[600px] h-[600px] bg-rose-200/50 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="container mx-auto px-6 max-w-6xl relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 border border-pink-100 text-pink-500 text-xs font-black uppercase tracking-widest shadow-sm">
                  <span className="text-lg">👑</span> Trại Mèo Thuần Chủng
                </div>
                <h3 className="font-quicksand font-bold text-4xl md:text-5xl font-black text-stone-800 leading-tight">
                  Nơi có rất nhiều boss <br /> <span className="text-pink-500">dễ thương</span>
                </h3>
                <p className="text-lg text-stone-500 leading-relaxed">
                  Tụi mình tin là mỗi người đều có một “boss định mệnh”.<br />
                  Vì vậy, KinVie kết nối với nhiều trại mèo khác nhau để mang về những bé mèo khỏe mạnh, xinh xắn và đầy cá tính. Không phải để bán cho nhanh, mà để mỗi bé tìm được đúng “người của mình”.
                </p>
                <Link href="/cattery" className="inline-flex items-center gap-3 px-8 py-4 bg-stone-900 text-white font-bold rounded-full hover:bg-pink-500 hover:shadow-[0_10px_40px_-10px_rgba(236,72,153,0.6)] transition-all duration-300 mt-4 group">
                  Gặp gỡ các Boss
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>

              <div className="w-full relative">
                <CarouselBanner groupId={1} />
              </div>
            </div>
          </div>
        </section>

        {/* PHẦN 2: BEAM PETSHOP */}
        <section className="relative h-[60vh] flex items-center justify-center">
          <div className="absolute inset-0 bg-stone-900/65 z-0"></div>
          <div className="relative z-10 text-center px-4">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight drop-shadow-2xl">
              Beam <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 font-serif italic font-light">Petshop</span>
            </h2>
          </div>
        </section>

        <section className="py-32 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-[600px] h-[600px] bg-orange-200/70 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[500px] h-[500px] bg-amber-200/50 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="container mx-auto px-6 max-w-6xl relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

              <div className="order-last md:order-first w-full relative">
                <CarouselBanner groupId={2} />
              </div>

              <div className="space-y-6 md:pl-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-500 text-xs font-black uppercase tracking-widest shadow-sm">
                  <span className="text-lg">🥩</span> Siêu Thị Dinh Dưỡng
                </div>
                <h3 className="font-quicksand font-bold text-4xl md:text-5xl font-black text-stone-800 leading-tight">
                  Tinh Hoa <br /> <span className="text-orange-500">Ẩm Thực</span> Thú Cưng
                </h3>
                <p className="text-lg text-stone-500 leading-relaxed">
                  Beam Petshop tự hào mang đến những dòng sản phẩm pate và hạt dinh dưỡng cao cấp nhất. Công thức độc quyền giúp các Boss phát triển toàn diện, lông mượt, dáng xinh và luôn tràn đầy năng lượng.
                </p>
                <Link href="/petshop" className="inline-flex items-center gap-3 px-8 py-4 bg-stone-900 text-white font-bold rounded-full hover:bg-orange-500 hover:shadow-[0_10px_40px_-10px_rgba(249,115,22,0.6)] transition-all duration-300 mt-4 group">
                  Khám phá Menu
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* PHẦN 3: CỘNG ĐỒNG KINVIE */}
        <section className="relative h-[60vh] flex items-center justify-center">
          <div className="absolute inset-0 bg-stone-900/65 z-0"></div>
          <div className="relative z-10 text-center px-4">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight drop-shadow-2xl">
              Cộng Đồng <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-serif italic font-light">KinVie</span>
            </h2>
          </div>
        </section>

        <section className="py-32 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-[500px] h-[500px] bg-blue-200/70 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[600px] h-[600px] bg-cyan-200/50 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="container mx-auto px-6 max-w-6xl relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-500 text-xs font-black uppercase tracking-widest shadow-sm">
                  <span className="text-lg">🌍</span> Kết Nối Yêu Thương
                </div>
                <h3 className="font-quicksand font-bold text-4xl md:text-5xl font-black text-stone-800 leading-tight">
                  Góc Khoe Boss & <br /> <span className="text-blue-500">Sẻ Chia</span>
                </h3>
                <p className="text-lg text-stone-500 leading-relaxed">
                  Một không gian an toàn và ấm áp dành riêng cho cộng đồng yêu mèo. Cùng nhau chia sẻ khoảnh khắc ngộ nghĩnh của Boss, trao đổi kinh nghiệm nuôi dưỡng và kết bạn bốn phương.
                </p>
                <Link href="/feed" className="inline-flex items-center gap-3 px-8 py-4 bg-stone-900 text-white font-bold rounded-full hover:bg-blue-500 hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.6)] transition-all duration-300 mt-4 group">
                  Tham gia ngay
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>

              <div className="w-full relative">
                <CarouselBanner groupId={3} />
              </div>
            </div>
          </div>
        </section>

        {/* PHẦN 4: KHO BÁU KÝ ỨC */}
        <section className="relative h-[60vh] flex items-center justify-center">
          <div className="absolute inset-0 bg-stone-900/65 z-0"></div>
          <div className="relative z-10 text-center px-4">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight drop-shadow-2xl">
              Kho Báu <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-serif italic font-light">Ký Ức</span>
            </h2>
          </div>
        </section>

        <section className="py-32 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-[600px] h-[600px] bg-emerald-200/70 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[500px] h-[500px] bg-teal-200/50 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="container mx-auto px-6 max-w-6xl relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

              <div className="order-last md:order-first w-full relative">
                <CarouselBanner groupId={4} />
              </div>

              <div className="space-y-6 md:pl-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 text-xs font-black uppercase tracking-widest shadow-sm">
                  <span className="text-lg">💎</span> Hành Trình Thời Gian
                </div>
                <h3 className="font-quicksand font-bold text-4xl md:text-5xl font-black text-stone-800 leading-tight">
                  Lưu Giữ Những <br /> <span className="text-emerald-500">Kỷ Niệm</span> Vô Giá
                </h3>
                <p className="text-lg text-stone-500 leading-relaxed">
                  Cuốn nhật ký điện tử lưu lại những thước phim, hình ảnh đẹp nhất của Boss từ lúc còn bé xíu đến khi trưởng thành. Nơi thời gian ngừng trôi và ký ức còn mãi.
                </p>
                <Link href="/memorial" className="inline-flex items-center gap-3 px-8 py-4 bg-stone-900 text-white font-bold rounded-full hover:bg-emerald-500 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.6)] transition-all duration-300 mt-4 group">
                  Mở rương ký ức
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />

      {/* 🌟 GỌI POPUP RA Ở ĐÂY ĐỂ ĐÈ LÊN TẤT CẢ */}
      <ReviewPopup />
    </div>
  );
}