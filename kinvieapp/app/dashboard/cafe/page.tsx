"use client";

import React from 'react';
import Link from 'next/link';

export default function CafeHubPage() {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[75vh]">
      
      <div className="bg-white rounded-[3rem] p-12 md:p-20 flex flex-col items-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 relative overflow-hidden w-full">
        
        {/* Lớp màu hắt sáng Background */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-200/40 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-pink-200/40 rounded-full blur-3xl opacity-60"></div>

        {/* Icon & Animation */}
        <div className="relative mb-8 z-10">
          <div className="text-8xl drop-shadow-xl animate-bounce">☕</div>
          <div className="absolute -bottom-2 -right-6 text-5xl animate-pulse drop-shadow-md">🐈</div>
        </div>

        {/* Tiêu đề */}
        <h1 className="text-4xl md:text-5xl font-serif font-black text-stone-800 mb-6 tracking-tight z-10">
          Tổ hợp Cat Cafe
        </h1>
        
        {/* Nhãn trạng thái */}
        <div className="inline-block bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 text-amber-600 font-black px-5 py-2 rounded-full text-sm uppercase tracking-widest mb-6 z-10 shadow-sm">
          🔜 Update sau (Coming Soon)
        </div>

        {/* Lời nhắn */}
        <p className="text-stone-500 text-lg max-w-lg mx-auto mb-12 leading-relaxed z-10">
          Phân hệ quản lý Menu đồ uống, đặt bàn và vé vào chơi cùng Boss đang được ấp ủ. Sẽ sớm ra mắt để phục vụ cho kế hoạch mở rộng cửa hàng vật lý sắp tới!
        </p>

        {/* Nút quay lại */}
        <Link 
          href="/dashboard" 
          className="bg-stone-900 hover:bg-pink-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-md hover:shadow-pink-500/30 flex items-center gap-3 group z-10"
        >
          <span className="group-hover:-translate-x-2 transition-transform">←</span>
          Quay lại Bảng điều khiển
        </Link>

      </div>
    </div>
  );
}