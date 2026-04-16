"use client";

import React from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CarouselBanner from '@/components/home/CarouselBanner';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-stone-700 font-sans selection:bg-pink-200 selection:text-pink-900">
      <Header />

      <main className="relative z-10 pt-16 overflow-hidden">
        
        {/* =========================================
            PHẦN 1: KINVIE CATTERY (MÀU HỒNG LOANG)
            ========================================= */}
        <section 
          className="relative h-[60vh] flex items-center justify-center bg-fixed bg-cover bg-center"
          style={{ backgroundImage: "url('/images/logo.jpg')" }}
        >
          <div className="absolute inset-0 bg-stone-900/65 z-0"></div>
          <div className="relative z-10 text-center px-4">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight drop-shadow-2xl">
              KinVie <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400 font-serif italic font-light">Cattery</span>
            </h2>
          </div>
        </section>

        <section className="py-32 bg-white relative">
          {/* 🌟 HIỆU ỨNG MÀU LOANG: Đặt đằng sau lưới */}
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


        {/* =========================================
            PHẦN 2: BEAM PETSHOP (MÀU CAM LOANG)
            ========================================= */}
        <section 
          className="relative h-[60vh] flex items-center justify-center bg-fixed bg-cover bg-center"
          style={{ backgroundImage: "url('/images/logo.jpg')" }}
        >
          <div className="absolute inset-0 bg-stone-900/65 z-0"></div>
          <div className="relative z-10 text-center px-4">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight drop-shadow-2xl">
              Beam <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 font-serif italic font-light">Petshop</span>
            </h2>
          </div>
        </section>

        <section className="py-32 bg-white relative">
           {/* 🌟 HIỆU ỨNG MÀU LOANG: Chuyển sang màu Cam, đặt bên trái */}
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
                <Link href="/shop" className="inline-flex items-center gap-3 px-8 py-4 bg-stone-900 text-white font-bold rounded-full hover:bg-orange-500 hover:shadow-[0_10px_40px_-10px_rgba(249,115,22,0.6)] transition-all duration-300 mt-4 group">
                  Khám phá Menu
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>
              
            </div>
          </div>
        </section>


        {/* =========================================
            PHẦN 3: CỘNG ĐỒNG KINVIE (MÀU XANH DƯƠNG LOANG)
            ========================================= */}
        <section 
          className="relative h-[60vh] flex items-center justify-center bg-fixed bg-cover bg-center"
          style={{ backgroundImage: "url('/images/logo.jpg')" }}
        >
          <div className="absolute inset-0 bg-stone-900/65 z-0"></div>
          <div className="relative z-10 text-center px-4">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight drop-shadow-2xl">
              Cộng Đồng <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-serif italic font-light">KinVie</span>
            </h2>
          </div>
        </section>

        <section className="py-32 bg-white relative">
          {/* 🌟 HIỆU ỨNG MÀU LOANG: Màu Xanh Dương, đặt bên phải */}
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


        {/* =========================================
            PHẦN 4: KHO BÁU KÝ ỨC (MÀU XANH LÁ LOANG)
            ========================================= */}
        <section 
          className="relative h-[60vh] flex items-center justify-center bg-fixed bg-cover bg-center"
          style={{ backgroundImage: "url('/images/logo.jpg')" }}
        >
          <div className="absolute inset-0 bg-stone-900/65 z-0"></div>
          <div className="relative z-10 text-center px-4">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight drop-shadow-2xl">
              Kho Báu <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-serif italic font-light">Ký Ức</span>
            </h2>
          </div>
        </section>

        <section className="py-32 bg-white relative">
          {/* 🌟 HIỆU ỨNG MÀU LOANG: Màu Xanh Ngọc, đặt bên trái */}
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
                <Link href="/memories" className="inline-flex items-center gap-3 px-8 py-4 bg-stone-900 text-white font-bold rounded-full hover:bg-emerald-500 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.6)] transition-all duration-300 mt-4 group">
                  Mở rương ký ức
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>
              
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}