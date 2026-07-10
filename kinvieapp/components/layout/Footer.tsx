"use client";

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import dynamic from 'next/dynamic';

const SplashCursor = dynamic(() => import('@/components/common/SplashCursor'), { ssr: false });

// === COMPONENT NÚT SOCIAL MEDIA (HIỆU ỨNG NƯỚC RÓT SÓNG SÁNH) ===
const SocialButton = ({ name, colorClass, icon, url }: { name: string, colorClass: string, icon: React.ReactNode, url: string }) => (
  <div className="group relative flex flex-col items-center">

    <style dangerouslySetInnerHTML={{
      __html: `
      @keyframes wave-spin { 
        from { transform: translateX(-50%) rotate(0deg); } 
        to { transform: translateX(-50%) rotate(360deg); } 
      }
      @keyframes wave-spin-reverse { 
        from { transform: translateX(-50%) rotate(360deg); } 
        to { transform: translateX(-50%) rotate(0deg); } 
      }
    `}} />

    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative w-12 h-12 bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center overflow-hidden shadow-lg transition-colors duration-500 group-hover:border-transparent"
    >
      <div className="absolute left-0 top-0 w-full h-[200%] translate-y-[20%] group-hover:translate-y-[-60%] transition-transform duration-[1500ms] ease-in-out z-0 pointer-events-none">
        <div
          className={`absolute top-[48%] left-1/2 w-[220%] aspect-square rounded-[40%] ${colorClass} opacity-40`}
          style={{ animation: 'wave-spin 6s linear infinite' }}
        ></div>
        <div
          className={`absolute top-[50%] left-1/2 w-[200%] aspect-square rounded-[43%] ${colorClass} opacity-90`}
          style={{ animation: 'wave-spin-reverse 4s linear infinite' }}
        ></div>
        <div className={`absolute top-[50%] left-0 w-full h-[50%] ${colorClass}`}></div>
      </div>

      <div className="relative z-10 text-stone-400 group-hover:text-white transition-all duration-500 ease-in-out group-hover:[transform:rotateY(360deg)] flex items-center justify-center">
        {icon}
      </div>
    </a>

    <span className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 text-[11px] font-bold text-stone-300 whitespace-nowrap bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-700 shadow-xl pointer-events-none z-20">
      {name}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-800 border-b border-r border-stone-700 rotate-45"></div>
    </span>
  </div>
);

export default function Footer() {
  // 🌟 KHAI BÁO STATE CHO NÚT "QUAY VỀ ĐẦU TRANG"
  const [showTopBtn, setShowTopBtn] = useState(false);

  // 🌟 RADAR THEO DÕI CUỘN CHUỘT
  useEffect(() => {
    const handleScroll = () => {
      // Nếu cuộn xuống quá 400px thì hiện nút, ngược lại thì ẩn
      if (window.scrollY > 400) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🌟 HÀM CUỘN LÊN ĐẦU TRANG MƯỢT MÀ
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Hàm kích hoạt pháo hoa
  const fireConfetti = () => {
    const end = Date.now() + 1.5 * 1000;
    const colors = ['#ec4899', '#f43f5e', '#ffffff', '#fbcfe8'];

    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: colors });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  return (
    <footer className="bg-stone-950 pt-24 pb-10 border-t border-stone-900 relative overflow-hidden">

      <SplashCursor
        DENSITY_DISSIPATION={3.5}
        VELOCITY_DISSIPATION={2}
        PRESSURE={0.1}
        CURL={3}
        SPLAT_RADIUS={0.2}
        SPLAT_FORCE={6000}
        COLOR_UPDATE_SPEED={10}
        SHADING
        RAINBOW_MODE={false}
        COLOR="#f35ca7"
      />

      {/* Họa tiết hắt sáng phía sau */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">

          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="bg-stone-900 border border-stone-800 w-12 h-12 flex items-center justify-center rounded-full shadow-lg">
                <span className="text-xl">🐾</span>
              </div>
              <div>
                <span className="font-serif italic font-light text-3xl text-white">KinVie</span>
                <span className="font-serif italic font-bold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400 ml-2">Team</span>
              </div>
            </div>

            <p className="text-stone-400 leading-relaxed max-w-md font-medium text-lg">
              Lan tỏa tình yêu thương đến những chú mèo Maine Coon. Chúng tôi cung cấp giải pháp toàn diện từ con giống khỏe mạnh đến dinh dưỡng chuẩn show.
            </p>

            <div className="pt-4 flex gap-4">
              <SocialButton
                name="KinVie Cattery (Mèo)"
                colorClass="bg-[#1877F2]"
                url="https://www.facebook.com/kinviecattery"
                icon={<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>}
              />
              <SocialButton
                name="Beam Petshop (Đồ ăn)"
                colorClass="bg-[#1877F2]"
                url="https://www.facebook.com/beampetshoppatemeo/"
                icon={<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>}
              />
              <SocialButton
                name="YouTube"
                colorClass="bg-[#FF0000]"
                url="https://www.youtube.com/channel/UC55DBFg8u2wePZiXhK-cC1w"
                icon={<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>}
              />
              <SocialButton
                name="TikTok"
                colorClass="bg-[#fe2c55]"
                url="https://www.tiktok.com/@cupidemmi"
                icon={<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>}
              />
              <SocialButton
                name="Zalo"
                colorClass="bg-[#0068FF]"
                url="https://zalo.me/84766490699"
                icon={<svg className="w-6 h-6 fill-current font-black" viewBox="0 0 24 24"><text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="18" fontFamily="sans-serif">Z</text></svg>}
              />
            </div>
          </div>

          <div className="md:pl-12 flex flex-col justify-center">
            <h4 className="font-bold text-white text-2xl mb-8 font-serif tracking-wide relative inline-block w-fit">
              Liên Hệ Với Sen
              <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-gradient-to-r from-pink-500 to-transparent rounded-full"></div>
            </h4>

            <ul className="space-y-6 text-stone-400 font-medium">
              <a href="https://maps.app.goo.gl/xBragBhB2LAuhjSW8?g_st=ic" target="_blank" rel="noopener noreferrer" className="flex items-start gap-5 group cursor-pointer">
                <div className="w-12 h-12 bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center text-pink-500 shadow-md shrink-0 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div className="mt-1 flex flex-col">
                  <span className="text-white font-bold mb-1">Địa chỉ</span>
                  <span className="group-hover:text-pink-400 transition-colors">2b/1 Phạm Ngũ Lão, P.Gia Viên, Thành phố Hải Phòng</span>
                </div>
              </a>

              <a href="tel:+84766490699" className="flex items-start gap-5 group cursor-pointer">
                <div className="w-12 h-12 bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center text-pink-500 shadow-md shrink-0 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div className="mt-1 flex flex-col">
                  <span className="text-white font-bold mb-1">Hotline / Zalo</span>
                  <span className="group-hover:text-pink-400 transition-colors">0766.490.699</span>
                </div>
              </a>

              <a href="mailto:beampetshop0911@gmail.com" className="flex items-start gap-5 group cursor-pointer">
                <div className="w-12 h-12 bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center text-pink-500 shadow-md shrink-0 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div className="mt-1 flex flex-col">
                  <span className="text-white font-bold mb-1">Gmail</span>
                  <span className="group-hover:text-pink-400 transition-colors">beampetshop0911@gmail.com</span>
                </div>
              </a>
            </ul>
          </div>

        </div>

        <div className="text-center pt-8 border-t border-stone-800/80 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4 text-stone-500 text-sm font-medium">
          <p>© {new Date().getFullYear()} Beam Petshop & KinVie Cattery. All rights reserved.</p>

          <div
            onClick={fireConfetti}
            className="group flex items-center gap-2 cursor-pointer bg-stone-900/40 px-5 py-2.5 rounded-full border border-stone-800/60 hover:border-pink-500/40 hover:bg-stone-900 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] transition-all duration-500 select-none active:scale-95"
          >
            <span className="text-stone-400 group-hover:text-pink-100 transition-colors duration-300">Made with</span>

            <div className="relative flex items-center justify-center">
              <span className="absolute w-6 h-6 bg-pink-500 rounded-full blur-md opacity-30 group-hover:opacity-80 group-hover:animate-ping transition-all duration-500"></span>
              <span className="relative text-pink-500 animate-pulse group-hover:scale-125 transition-transform duration-300">💖</span>
            </div>

            <span className="text-stone-400 group-hover:text-pink-100 transition-colors duration-300">by</span>

            <span className="relative font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-200 to-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.4)] group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.7)] transition-all duration-500 flex items-center gap-1.5 ml-1">
              KinVie Team
            </span>
          </div>
        </div>
      </div>

      {/* =========================================
          🚀 NÚT LÊN ĐỈNH (BACK TO TOP)
          ========================================= */}
      <button
        onClick={scrollToTop}
        aria-label="Back to Top"
        className={`fixed bottom-8 right-8 md:bottom-12 md:right-12 z-[100] w-14 h-14 bg-pink-500 hover:bg-pink-600 hover:-translate-y-2 active:scale-95 text-white rounded-full flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(236,72,153,0.8)] transition-all duration-500 ease-out border border-pink-400/50
          ${showTopBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16 pointer-events-none'}
        `}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
        </svg>
      </button>

    </footer>
  );
}