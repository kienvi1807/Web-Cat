"use client";

import React from 'react';
import Link from 'next/link';

export default function UsersHubPage() {
  
  // 🎯 DANH SÁCH 4 CHỨC NĂNG QUẢN LÝ TÀI KHOẢN & CRM (Đã dọn biến nút bấm)
  const userModules = [
    {
      name: 'DS Tài khoản',
      icon: '🧑‍💻',
      description: 'Quản lý toàn bộ thông tin Khách hàng, Staff và Boss. Phân quyền và khóa tài khoản khi cần.',
      path: '/dashboard/users/list',
      titleColor: 'text-cyan-600',
      colorFrom: 'from-cyan-400',
      colorHoverFrom: 'group-hover:from-cyan-500',
      labelColor: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      labelText: '128 User'
    },
    {
      name: 'Duyệt Breeder',
      icon: '🛡️',
      description: 'Kiểm tra hồ sơ, giấy tờ trại giống và phê duyệt cấp quyền đăng bán mèo cho đối tác mới.',
      path: '/dashboard/users/breeders',
      titleColor: 'text-rose-600',
      colorFrom: 'from-rose-400',
      colorHoverFrom: 'group-hover:from-rose-500',
      labelColor: 'text-rose-600 bg-rose-50 border-rose-200 animate-pulse',
      labelText: '2 Yêu cầu'
    },
    {
      name: 'Hạng & Tích điểm',
      icon: '💎',
      description: 'Cấu hình tỷ lệ quy đổi điểm, điều kiện thăng hạng và đặc quyền cho từng cấp bậc VIP.',
      path: '/dashboard/users/ranks',
      titleColor: 'text-amber-600',
      colorFrom: 'from-amber-400',
      colorHoverFrom: 'group-hover:from-amber-500',
      labelColor: 'text-amber-600 bg-amber-50 border-amber-200',
      labelText: 'Cấu hình VIP'
    },
    {
      name: 'Khuyến mãi',
      icon: '🎟️',
      description: 'Tạo mã Voucher, lên lịch các chương trình giảm giá Flash Sale hoặc Freeship kích cầu.',
      path: '/dashboard/users/promotions',
      titleColor: 'text-fuchsia-600',
      colorFrom: 'from-fuchsia-400',
      colorHoverFrom: 'group-hover:from-fuchsia-500',
      labelColor: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200',
      labelText: '5 Đang chạy'
    }
  ];

  return (
    <div className="space-y-10 animate-fade-in max-w-[1300px] mx-auto pb-16">
      
      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-black text-stone-800 flex items-center justify-center gap-3">
          Tài khoản & Đối tác <span className="text-4xl animate-bounce">👥</span>
        </h1>
        <p className="text-stone-500 mt-3 text-lg">Quản lý người dùng, phân quyền bảo mật và chăm sóc khách hàng.</p>
      </div>

      {/* 🎯 KHỐI CONTAINER CHÍNH CÓ HIỆU ỨNG GLASSMORPHISM & LASER */}
      <div className="relative group/section">
        
        {/* Lớp Hào Quang Tỏa Ra Phía Sau (Màu Cyan/Xanh lam nhạt) */}
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/0 via-cyan-400/10 to-blue-500/0 rounded-[3.5rem] blur-2xl opacity-0 group-hover/section:opacity-100 transition-opacity duration-1000 -z-10"></div>

        {/* Khối Container Kính Mờ */}
        <div className="relative bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-500 hover:border-cyan-200/80 hover:shadow-[0_8px_50px_rgba(6,182,212,0.1)]">

          {/* Họa tiết Lưới Chấm Bi Mờ */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          {/* Vệt Laser quét ngang viền trên khi hover */}
          <div className="absolute top-0 left-0 w-full h-[3px] opacity-0 group-hover/section:opacity-100 transition-opacity duration-500 overflow-hidden pointer-events-none">
             <div className="w-[100%] h-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent -translate-x-full group-hover/section:translate-x-full transition-transform duration-[1500ms] ease-in-out"></div>
          </div>

          {/* GRID CHỨA 4 THẺ (CARDS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            
            {userModules.map((item) => (
              <Link href={item.path} key={item.name} className="relative group block h-full">
                
                {/* Lớp sáng neon tỏa ra từ thẻ con */}
                <div className={`absolute -inset-[2px] bg-gradient-to-b ${item.colorFrom} via-transparent to-transparent rounded-3xl blur-[10px] opacity-20 group-hover:opacity-100 ${item.colorHoverFrom} transition-all duration-500`}></div>
                <div className={`absolute -inset-[1px] bg-gradient-to-b ${item.colorFrom} to-stone-200/50 rounded-3xl z-0`}></div>
                
                {/* Nội dung thẻ con */}
                <div className="relative h-full bg-white/90 backdrop-blur-sm rounded-3xl p-6 flex flex-col items-center text-center z-10 shadow-[0_8px_20px_rgb(0,0,0,0.02)] border border-white">
                  
                  {/* Icon */}
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-500 drop-shadow-sm">
                    {item.icon}
                  </div>
                  
                  {/* Tiêu đề */}
                  <h3 className={`text-[16px] font-black ${item.titleColor} mb-2 tracking-wide`}>
                    {item.name}
                  </h3>
                  
                  {/* Mô tả */}
                  <p className="text-xs text-stone-500 mb-6 flex-1 leading-relaxed px-1">
                    {item.description}
                  </p>
                  
                  {/* Khu vực Nhãn (Badge) Căn Giữa - ĐÃ XÓA NÚT */}
                  <div className="w-full flex justify-center items-center mt-auto pt-5 border-t border-stone-100/80">
                    <span className={`${item.labelColor} border font-black px-5 py-2 rounded-xl text-[10px] uppercase tracking-widest shadow-sm group-hover:scale-105 transition-transform duration-300`}>
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