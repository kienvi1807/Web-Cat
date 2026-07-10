"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import BackgroundGlow from '@/components/layout/BackgroundGlow';
import { useLayoutStore } from '@/store/useLayoutStore';

export default function PromotionsComingSoonPage() {
  const setThemeColor = useLayoutStore(state => state.setThemeColor);

  useEffect(() => {
    // 🎯 Set tone màu Tím/Fuchsia chuẩn theo thiết kế thẻ Khuyến mãi của sếp
    setThemeColor('pink'); 
  }, [setThemeColor]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] relative overflow-hidden selection:bg-fuchsia-200 flex flex-col items-center justify-center pb-20">
      {/* BACKGROUND GLOW */}
      <BackgroundGlow />

      {/* Hiệu ứng 2 cục sương mù phía sau thẻ */}
      <div className="relative z-10 w-full max-w-2xl px-4 animate-fade-in-up mt-10">
        
        {/* KHỐI KÍNH MỜ CHÍNH */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_20px_60px_rgba(192,38,211,0.1)] rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden group">
          
          {/* Lớp hào quang chớp nháy nhẹ bên trong */}
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

          <div className="relative z-10">
            {/* 🎯 ICON ANIMATION CHẾ TẠO */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              {/* Vòng sáng xoay tròn */}
              <div className="absolute inset-0 border-[6px] border-dashed border-fuchsia-200 rounded-full animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-fuchsia-100 to-purple-50 rounded-full shadow-inner flex items-center justify-center text-5xl">
                <span className="animate-bounce">🎟️</span>
              </div>
              {/* Icon phụ bay lơ lửng */}
              <div className="absolute -top-2 -right-2 text-2xl animate-[bounce_2s_infinite_100ms]">🛠️</div>
              <div className="absolute -bottom-2 -left-2 text-2xl animate-[bounce_2.5s_infinite]">✨</div>
            </div>

            {/* TEXT NỘI DUNG */}
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-fuchsia-600 to-purple-800 tracking-tight mb-4">
              Đang Nâng Cấp Hệ Thống
            </h1>
            
            <p className="text-stone-500 font-bold text-lg leading-relaxed mb-8 max-w-md mx-auto">
              Trung tâm Khuyến mãi & Voucher đang được đội ngũ kỹ thuật xây dựng. Những mã giảm giá "khủng" nhất sẽ sớm xuất hiện tại đây!
            </p>

            {/* THANH TIẾN ĐỘ FAKE (Nhìn cho giống đang load thật) */}
            <div className="w-full max-w-sm mx-auto mb-10">
              <div className="flex justify-between text-[11px] font-black uppercase text-fuchsia-500 tracking-widest mb-2">
                <span>Tiến độ</span>
                <span className="animate-pulse">85%</span>
              </div>
              <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-fuchsia-400 to-purple-500 rounded-full w-[85%] relative overflow-hidden">
                  {/* Hiệu ứng sọc ánh sáng chạy qua thanh tiến độ */}
                  <div className="absolute top-0 left-0 w-full h-full bg-white/30 skew-x-[-20deg] animate-[translateX_2s_infinite] translate-x-[-150%]"></div>
                </div>
              </div>
            </div>

            {/* NÚT QUAY LẠI */}
            <Link 
              href="/dashboard/users" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-stone-900 text-white rounded-2xl font-black text-sm hover:bg-fuchsia-600 hover:shadow-[0_10px_30px_rgba(192,38,211,0.3)] hover:-translate-y-1 active:scale-95 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Quay lại Trang chủ
            </Link>

          </div>
        </div>
      </div>

      {/* CSS ANIMATION THÊM */}
      <style dangerouslySetInnerHTML={{__html: `
        .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        
        @keyframes translateX {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }

        .animate-blob { animation: blob 10s infinite alternate; }
        .animation-delay-2000 { animation-delay: 2s; }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}} />
    </div>
  );
}