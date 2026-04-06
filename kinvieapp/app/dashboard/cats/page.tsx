"use client";

import React from 'react';
import Link from 'next/link';

export default function CatsHubPage() {
  return (
    <div className="space-y-10 animate-fade-in max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-black text-stone-800 flex items-center justify-center gap-3">
          Quản lý Mèo (Cattery) <span className="text-4xl animate-bounce">😻</span>
        </h1>
        <p className="text-stone-500 mt-3 text-lg">Lựa chọn khu vực làm việc bạn muốn thao tác.</p>
      </div>

      {/* GRID CHỨA 2 THẺ (CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* ==========================================
            CARD 1: MÈO KINVIE CATTERY (MÀU CAM/VÀNG)
            ========================================== */}
        <Link href="/dashboard/cats/kinvie" className="relative group block h-full">
          
          {/* Lớp ánh sáng tỏa ra (Blur Glow) */}
          <div className="absolute -inset-[2px] bg-gradient-to-b from-orange-400 via-transparent to-transparent rounded-[2.5rem] blur-[10px] opacity-50 group-hover:opacity-100 group-hover:from-orange-500 transition-all duration-500"></div>
          
          {/* Lớp viền mỏng */}
          <div className="absolute -inset-[1px] bg-gradient-to-b from-orange-300 to-stone-200 rounded-[2.5rem] z-0"></div>

          {/* Nội dung thẻ */}
          <div className="relative h-full bg-white rounded-[2.5rem] p-10 flex flex-col items-center text-center z-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            
            {/* Icon */}
            <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_4px_8px_rgba(249,115,22,0.4)]">
              🦁
            </div>
            
            {/* Tiêu đề */}
            <h3 className="text-2xl font-black text-orange-600 mb-4 tracking-wide">
              Mèo KinVie Cattery
            </h3>
            
            {/* Mô tả */}
            <p className="text-sm text-stone-500 mb-10 flex-1 leading-relaxed px-2">
              Quản lý đàn mèo thuần chủng của trại KinVie. Thêm mèo mới, cập nhật giá, trạng thái bán, phả hệ và tiêm phòng.
            </p>
            
            {/* Khu vực Nút bấm & Nhãn */}
            <div className="w-full flex justify-between items-center mt-auto pt-4">
              <button className="bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-[0_4px_15px_rgba(249,115,22,0.3)] group-hover:shadow-[0_4px_25px_rgba(249,115,22,0.5)] transition-all flex items-center gap-2">
                Quản lý ngay <span>→</span>
              </button>
              <span className="bg-orange-50 border border-orange-100 text-orange-600 font-black px-5 py-2.5 rounded-full text-sm">
                08 bé
              </span>
            </div>

          </div>
        </Link>

        {/* ==========================================
            CARD 2: MÈO CỦA BREEDER (MÀU XANH CYAN)
            ========================================== */}
        <Link href="/dashboard/cats/breeders" className="relative group block h-full">
          
          {/* Lớp ánh sáng tỏa ra (Blur Glow) */}
          <div className="absolute -inset-[2px] bg-gradient-to-b from-cyan-400 via-transparent to-transparent rounded-[2.5rem] blur-[10px] opacity-50 group-hover:opacity-100 group-hover:from-cyan-500 transition-all duration-500"></div>
          
          {/* Lớp viền mỏng */}
          <div className="absolute -inset-[1px] bg-gradient-to-b from-cyan-300 to-stone-200 rounded-[2.5rem] z-0"></div>

          {/* Nội dung thẻ */}
          <div className="relative h-full bg-white rounded-[2.5rem] p-10 flex flex-col items-center text-center z-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            
            {/* Icon */}
            <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_4px_8px_rgba(6,182,212,0.4)]">
              🤝
            </div>
            
            {/* Tiêu đề */}
            <h3 className="text-2xl font-black text-cyan-700 mb-4 tracking-wide">
              Mèo của Breeder đối tác
            </h3>
            
            {/* Mô tả */}
            <p className="text-sm text-stone-500 mb-10 flex-1 leading-relaxed px-2">
              Duyệt bài đăng bán mèo của các trại nhân giống liên kết. Kiểm tra thông tin, giấy tờ phả hệ trước khi duyệt hiển thị lên web.
            </p>
            
            {/* Khu vực Nút bấm & Nhãn */}
            <div className="w-full flex justify-between items-center mt-auto pt-4">
              <button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-[0_4px_15px_rgba(6,182,212,0.3)] group-hover:shadow-[0_4px_25px_rgba(6,182,212,0.5)] transition-all flex items-center gap-2">
                Kiểm duyệt <span>→</span>
              </button>
              <span className="bg-rose-50 border border-rose-100 text-rose-500 font-black px-5 py-2.5 rounded-full text-sm animate-pulse">
                3 bài chờ duyệt
              </span>
            </div>

          </div>
        </Link>

      </div>
    </div>
  );
}