"use client";

import React from 'react';
import Link from 'next/link';

export default function SystemHubPage() {
  
  // 🎯 DANH SÁCH CHỨC NĂNG HỆ THỐNG & NỘI DUNG (Đã dọn dẹp biến thừa)
  const systemModules = [
    {
      name: 'Quản lý Blog & Tin tức',
      icon: '📝',
      description: 'Soạn thảo bài viết, quản lý danh mục tin tức. Chia sẻ kinh nghiệm nuôi mèo, dinh dưỡng và các sự kiện của Cattery.',
      path: '/dashboard/system/blog',
      color: 'indigo',
      colorFrom: 'from-indigo-400',
      colorHoverFrom: 'group-hover:from-indigo-500',
      labelColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      labelText: '25 Bài viết'
    },
    {
      name: 'Cài đặt Giao diện',
      icon: '🎨',
      description: 'Tùy chỉnh Banner trang chủ, thay đổi thông tin liên hệ Hotline/Zalo, Footer và cập nhật các chính sách cửa hàng.',
      path: '/dashboard/system/settings',
      color: 'slate',
      colorFrom: 'from-slate-400',
      colorHoverFrom: 'group-hover:from-slate-500',
      labelColor: 'text-slate-600 bg-slate-50 border-slate-200',
      labelText: 'Cấu hình'
    }
  ];

  return (
    <div className="space-y-10 animate-fade-in max-w-4xl mx-auto pb-16">
      
      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-black text-stone-800 flex items-center justify-center gap-3">
          Hệ thống & Nội dung <span className="text-4xl animate-bounce">⚙️</span>
        </h1>
        <p className="text-stone-500 mt-3 text-lg">Quản lý bài viết truyền thông và cấu hình giao diện website.</p>
      </div>

      {/* 🎯 KHỐI CONTAINER CHÍNH CÓ HIỆU ỨNG GLASSMORPHISM & LASER */}
      <div className="relative group/section">
        
        {/* Lớp Hào Quang Tỏa Ra Phía Sau (Màu Tím/Xám) */}
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/0 via-purple-400/10 to-slate-500/0 rounded-[3.5rem] blur-2xl opacity-0 group-hover/section:opacity-100 transition-opacity duration-1000 -z-10"></div>

        {/* Khối Container Kính Mờ */}
        <div className="relative bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-500 hover:border-purple-200/80 hover:shadow-[0_8px_50px_rgba(147,51,234,0.1)]">

          {/* Họa tiết Lưới Chấm Bi Mờ */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          {/* Vệt Laser quét ngang viền trên khi hover */}
          <div className="absolute top-0 left-0 w-full h-[3px] opacity-0 group-hover/section:opacity-100 transition-opacity duration-500 overflow-hidden pointer-events-none">
             <div className="w-[100%] h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent -translate-x-full group-hover/section:translate-x-full transition-transform duration-[1500ms] ease-in-out"></div>
          </div>

          {/* GRID CHỨA 2 THẺ (CARDS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            
            {systemModules.map((item) => (
              <Link href={item.path} key={item.name} className="relative group block h-full">
                
                {/* Lớp sáng neon tỏa ra từ thẻ con */}
                <div className={`absolute -inset-[2px] bg-gradient-to-b ${item.colorFrom} via-transparent to-transparent rounded-3xl blur-[10px] opacity-20 group-hover:opacity-100 ${item.colorHoverFrom} transition-all duration-500`}></div>
                <div className={`absolute -inset-[1px] bg-gradient-to-b ${item.colorFrom} to-stone-200/50 rounded-3xl z-0`}></div>
                
                {/* Nội dung thẻ con (Tăng padding p-8 cho layout 2 cột) */}
                <div className="relative h-full bg-white/90 backdrop-blur-sm rounded-3xl p-8 flex flex-col items-center text-center z-10 shadow-[0_8px_20px_rgb(0,0,0,0.02)] border border-white">
                  
                  {/* Icon */}
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-500 drop-shadow-sm">
                    {item.icon}
                  </div>
                  
                  {/* Tiêu đề */}
                  <h3 className={`text-xl font-black text-${item.color}-600 mb-3 tracking-wide`}>
                    {item.name}
                  </h3>
                  
                  {/* Mô tả */}
                  <p className="text-sm text-stone-500 mb-8 flex-1 leading-relaxed px-2">
                    {item.description}
                  </p>
                  
                  {/* Khu vực Nhãn (Badge) Căn Giữa - ĐÃ XÓA NÚT */}
                  <div className="w-full flex justify-center items-center mt-auto pt-6 border-t border-stone-100/80">
                    <span className={`${item.labelColor} border font-black px-6 py-2.5 rounded-xl text-[11px] uppercase tracking-widest shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                      {item.labelText}
                    </span>
                  </div>

                </div>
              </Link>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}