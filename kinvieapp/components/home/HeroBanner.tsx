'use client'

import React, { useState } from 'react';
import Link from 'next/link';
// Nhớ import Image nếu sếp dùng next/image sau này, ở đây em dùng thẻ img tạm cho dễ chạy
// import Image from 'next/image'; 

export default function HeroBanner() {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
      
      {/* --- CÁC KHỐI SÁNG LƠ LỬNG LÀM BACKGROUND --- */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200/40 rounded-full mix-blend-multiply blur-3xl opacity-60 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-rose-200/40 rounded-full mix-blend-multiply blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Layout Grid 2 cột: Trái là Chữ, Phải là Ảnh */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* =======================================
              CỘT TRÁI: NỘI DUNG VÀ NÚT BẤM
              ======================================= */}
          <div className="space-y-8">
            <div className="space-y-6">
              
              {/* Thẻ Badge nhỏ */}
              <div className="inline-block bg-white/80 border border-pink-100 text-pink-500 px-6 py-2 rounded-full font-bold text-sm shadow-sm backdrop-blur-sm">
                ✨ Nơi tình yêu bốn chân bắt đầu
              </div>
              
              {/* Tiêu đề chính */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-stone-800 leading-[1.1] tracking-tight">
                Beam Petshop & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400 font-serif italic pr-2">
                  KinVie Cattery
                </span>
              </h1>
              
              {/* Đoạn mô tả */}
              <p className="text-lg md:text-xl text-stone-500 font-medium leading-relaxed max-w-lg">
                Chuyên nhân giống Maine Coon thuần chủng với kích thước khổng lồ, tính cách ngọt ngào. Cung cấp phụ kiện, đồ ăn dinh dưỡng và sản phẩm đi show cao cấp nhất cho các Boss.
              </p>
            </div>

            {/* Các Nút Bấm CTA */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="#kinvie-cattery"
                className="group px-8 py-5 bg-pink-500 text-white rounded-full font-black text-lg hover:bg-pink-400 hover:shadow-[0_10px_30px_rgba(236,72,153,0.3)] transition-all duration-300 flex items-center justify-center gap-3"
                onMouseEnter={() => setHoveredButton('adopt')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <span className="text-2xl">🐱</span> Đón Mèo Con
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <Link
                href="#beam-petshop"
                className="group px-8 py-5 bg-white text-pink-500 border-2 border-pink-100 rounded-full font-black text-lg hover:border-pink-300 hover:bg-pink-50 transition-all duration-300 shadow-sm flex items-center justify-center gap-3"
                onMouseEnter={() => setHoveredButton('shop')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <span className="text-2xl">🏪</span> Mua Sắm Đồ Dùng
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* =======================================
              CỘT PHẢI: ẢNH HIỂN THỊ LỚN (Thay cho khối rỗng cũ)
              ======================================= */}
          <div className="relative h-[500px] md:h-[650px] w-full group mt-10 md:mt-0">
            {/* Tấm nền màu hồng xoay lệch ở dưới (Hiệu ứng xếp chồng) */}
            <div className="absolute inset-0 bg-pink-100 rounded-[3rem] transform rotate-3 scale-105 -z-10 transition-transform duration-700 group-hover:rotate-0"></div>
            
            {/* Tấm ảnh chính */}
            <div className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1593483316242-efb5420596ca?q=80&w=2070&auto=format&fit=crop"
                alt="Bé Maine Coon khổng lồ đáng yêu"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              />
              {/* Lớp phủ mờ dần từ dưới lên để ảnh sâu hơn */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 to-transparent" />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}