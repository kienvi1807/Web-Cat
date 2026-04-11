"use client";

import React from 'react';
import Link from 'next/link';

export default function DashboardHubPage() {
  
  // 🎯 TỔNG HỢP TOÀN BỘ CÁC CHỨC NĂNG CON ĐÃ NHÓM THEO PHÂN HỆ
  const groupedModules = [
    {
      sectionTitle: 'Quản lý Mèo (Cattery)',
      sectionIcon: '🐱',
      items: [
        { name: 'Mèo KinVie Cattery', icon: '🦁', path: '/dashboard/cats/kinvie', color: 'red', colorFrom: 'from-red-400', colorHoverFrom: 'group-hover:from-red-500', labelColor: 'text-red-600 bg-red-50 border-red-200', labelText: '08 bé' },
        { name: 'Mèo của Breeder', icon: '🤝', path: '/dashboard/cats/breeders', color: 'orange', colorFrom: 'from-orange-400', colorHoverFrom: 'group-hover:from-orange-500', labelColor: 'text-orange-500 bg-orange-50 border-orange-200 animate-pulse', labelText: '3 bài chờ duyệt' },
        { name: 'Quản lý Phả hệ', icon: '🌳', path: '/dashboard/cats/pedigree', color: 'teal', colorFrom: 'from-teal-400', colorHoverFrom: 'group-hover:from-teal-500', labelColor: 'text-teal-500 bg-teal-50 border-teal-200', labelText: 'Cập nhật' },
        { name: 'Sức khỏe & Sinh sản', icon: '🩺', path: '/dashboard/cats/health', color: 'rose', colorFrom: 'from-rose-400', colorHoverFrom: 'group-hover:from-rose-500', labelColor: 'text-rose-600 bg-rose-50 border-rose-200 animate-pulse', labelText: '2 cảnh báo' },
      ]
    },
    {
      sectionTitle: 'Beam Petshop',
      sectionIcon: '🛍️',
      items: [
        { name: 'Hàng hóa & Phụ kiện', icon: '🧸', path: '/dashboard/petshop/products', color: 'fuchsia', colorFrom: 'from-fuchsia-400', colorHoverFrom: 'group-hover:from-fuchsia-500', labelColor: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200', labelText: '156 Sản phẩm' },
        { name: 'Quản lý Pate tươi', icon: '🥫', path: '/dashboard/petshop/pate', color: 'pink', colorFrom: 'from-pink-400', colorHoverFrom: 'group-hover:from-pink-500', labelColor: 'text-pink-600 bg-pink-50 border-pink-200 animate-pulse', labelText: '2 mẻ cận date' },
      ]
    },
    {
      sectionTitle: 'Kinh doanh & Vận hành',
      sectionIcon: '📈',
      items: [
        { name: 'Quản lý Đơn hàng', icon: '📦', path: '/dashboard/operations/orders', color: 'blue', colorFrom: 'from-blue-400', colorHoverFrom: 'group-hover:from-blue-500', labelColor: 'text-blue-600 bg-blue-50 border-blue-200', labelText: '12 Đơn mới' },
        { name: 'Quản lý Thu/Chi', icon: '💸', path: '/dashboard/operations/finance', color: 'emerald', colorFrom: 'from-emerald-400', colorHoverFrom: 'group-hover:from-emerald-500', labelColor: 'text-emerald-600 bg-emerald-50 border-emerald-200', labelText: 'Cập nhật' },
        { name: 'Quản lý Nhân sự', icon: '👥', path: '/dashboard/operations/hr', color: 'purple', colorFrom: 'from-purple-400', colorHoverFrom: 'group-hover:from-purple-500', labelColor: 'text-purple-600 bg-purple-50 border-purple-200', labelText: '5 Nhân sự' },
        { name: 'Báo cáo & Phân tích', icon: '📊', path: '/dashboard/operations/analytics', color: 'amber', colorFrom: 'from-amber-400', colorHoverFrom: 'group-hover:from-amber-500', labelColor: 'text-amber-600 bg-amber-50 border-amber-200', labelText: 'Xem báo cáo' },
      ]
    },
    {
      sectionTitle: 'Tài khoản & Đối tác',
      sectionIcon: '👥',
      items: [
        { name: 'Tài khoản', icon: '🧑‍💻', path: '/dashboard/users/list', color: 'cyan', colorFrom: 'from-cyan-400', colorHoverFrom: 'group-hover:from-cyan-500', labelColor: 'text-cyan-600 bg-cyan-50 border-cyan-200', labelText: '128 User' },
        { name: 'Duyệt Breeder', icon: '🛡️', path: '/dashboard/users/promotions', color: 'amber', colorFrom: 'from-amber-400', colorHoverFrom: 'group-hover:from-amber-500', labelColor: 'text-amber-600 bg-amber-50 border-amber-200', labelText: '5 Đang chạy' },
        { name: 'Hạng & Tích điểm', icon: '💎', path: '/dashboard/system/blog', color: 'sky', colorFrom: 'from-sky-400', colorHoverFrom: 'group-hover:from-sky-500', labelColor: 'text-sky-600 bg-sky-50 border-sky-200', labelText: '25 Bài viết' },
        { name: 'Khuyến mãi', icon: '🎟️', path: '/dashboard/system/settings', color: 'violet', colorFrom: 'from-violet-400', colorHoverFrom: 'group-hover:from-violet-500', labelColor: 'text-violet-600 bg-violet-50 border-violet-200', labelText: 'Cấu hình hệ thống' },
      ]
    },
    {
      sectionTitle: 'Hệ thống & Nội dung',
      sectionIcon: '⚙️',
      items: [
        { name: 'Quản lý Blog & Tin tức', icon: '📝', path: '/dashboard/users/list', color: 'indigo', colorFrom: 'from-indigo-400', colorHoverFrom: 'group-hover:from-indigo-500', labelColor: 'text-indigo-600 bg-indigo-50 border-indigo-200', labelText: '128 User' },
        { name: ' Cài đặt giao diện', icon: '🎨', path: '/dashboard/system/settings', color: 'slate', colorFrom: 'from-slate-400', colorHoverFrom: 'group-hover:from-slate-500', labelColor: 'text-slate-600 bg-slate-50 border-slate-200', labelText: 'Cấu hình hệ thống' },
      ]
    }
  ];

  return (
    <div className="space-y-16 animate-fade-in max-w-[1400px] mx-auto pb-16">
      
      {/* ==========================================
          KHU VỰC THỐNG KÊ (HẮC HƯỜNG NEON GLOW)
          ========================================== */}
      <div className="space-y-6">
        
        {/* TẦNG 1: DOANH THU & BỘ LỌC THỜI GIAN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111] rounded-[2rem] p-6 xl:p-8 border border-stone-800 shadow-2xl relative overflow-hidden group hover:border-pink-500 transition-all duration-500 cursor-default">
            <div className="absolute -right-8 -top-8 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl group-hover:bg-pink-500/40 transition-all duration-500"></div>
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Tổng Doanh Thu</p>
                <span className="bg-pink-500/10 text-pink-500 px-3 py-1 rounded-full text-xs font-bold border border-pink-500/20">Tháng 4, 2026</span>
              </div>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tighter truncate">
                125.500.000<span className="text-2xl md:text-3xl font-bold ml-1.5 text-pink-500">đ</span>
              </h3>
              <div className="flex items-center gap-4 text-sm font-bold">
                <span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md flex items-center gap-1 whitespace-nowrap"><span>↑</span> 12.5%</span>
                <span className="text-stone-500 truncate">so với tháng trước (111.550.000đ)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111] rounded-[2rem] p-6 xl:p-8 border border-stone-800 shadow-2xl relative overflow-hidden flex flex-col justify-center group hover:border-slate-500 transition-all duration-500">
             <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6">Thời gian hiển thị</p>
             <div className="flex flex-wrap gap-2 mb-6">
                <button className="bg-pink-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(236,72,153,0.4)]">Tháng này</button>
                <button className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-4 py-2 rounded-xl text-sm font-bold transition-colors">Tuần này</button>
                <button className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-4 py-2 rounded-xl text-sm font-bold transition-colors">Hôm nay</button>
             </div>
             <div className="flex flex-col xl:flex-row items-center gap-3 w-full">
               <div className="w-full flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <span className="text-stone-500">📅</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-stone-500 font-bold uppercase mb-0.5 leading-none">Từ ngày</p>
                    <input type="date" className="bg-transparent text-stone-300 text-sm font-bold outline-none w-full" defaultValue="2026-04-01" />
                  </div>
               </div>
               <span className="text-stone-600 font-black hidden xl:block">-</span>
               <div className="w-full flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <span className="text-stone-500">📅</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-stone-500 font-bold uppercase mb-0.5 leading-none">Đến ngày</p>
                    <input type="date" className="bg-transparent text-stone-300 text-sm font-bold outline-none w-full" defaultValue="2026-04-30" />
                  </div>
               </div>
             </div>
          </div>
        </div>

        {/* TẦNG 2: 4 CHỈ SỐ NHANH */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#111] rounded-[2rem] p-6 border border-stone-800 shadow-2xl relative overflow-hidden group hover:border-rose-500 transition-all duration-500 cursor-default">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl group-hover:bg-rose-500/40 transition-all duration-500"></div>
            <div className="relative z-10 flex flex-col justify-between h-full">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Đơn hàng chờ duyệt</p>
              <h3 className="text-3xl font-black text-white mb-3 tracking-tighter">14</h3>
              <p className="text-xs font-bold text-rose-400 flex items-center gap-1 mt-auto bg-rose-500/10 w-fit px-2 py-1 rounded-md">Cần xử lý ngay</p>
            </div>
          </div>
          <div className="bg-[#111] rounded-[2rem] p-6 border border-stone-800 shadow-2xl relative overflow-hidden group hover:border-amber-500 transition-all duration-500 cursor-default">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/40 transition-all duration-500"></div>
            <div className="relative z-10 flex flex-col justify-between h-full">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Mèo đang quản lý</p>
              <h3 className="text-3xl font-black text-white mb-3 tracking-tighter">45</h3>
              <p className="text-xs font-bold text-amber-400 flex items-center gap-1 mt-auto bg-amber-500/10 w-fit px-2 py-1 rounded-md">8 bé đang sẵn sàng</p>
            </div>
          </div>
          <div className="bg-[#111] rounded-[2rem] p-6 border border-stone-800 shadow-2xl relative overflow-hidden group hover:border-cyan-500 transition-all duration-500 cursor-default">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl group-hover:bg-cyan-500/40 transition-all duration-500"></div>
            <div className="relative z-10 flex flex-col justify-between h-full">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Khách hàng mới</p>
              <h3 className="text-3xl font-black text-white mb-3 tracking-tighter">42</h3>
              <p className="text-xs font-bold text-cyan-400 flex items-center gap-1 mt-auto bg-cyan-500/10 w-fit px-2 py-1 rounded-md"><span>↑</span> 5 Sen gia nhập</p>
            </div>
          </div>
          <div className="bg-[#111] rounded-[2rem] p-6 border border-stone-800 shadow-2xl relative overflow-hidden group hover:border-purple-500 transition-all duration-500 cursor-default">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/40 transition-all duration-500"></div>
            <div className="relative z-10 flex flex-col justify-between h-full">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Đánh giá & Khiếu nại</p>
              <h3 className="text-3xl font-black text-white mb-3 tracking-tighter">03</h3>
              <p className="text-xs font-bold text-purple-400 flex items-center gap-1 mt-auto bg-purple-500/10 w-fit px-2 py-1 rounded-md">Chờ phản hồi</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          CHI TIẾT TOÀN BỘ PHÂN HỆ VÀ CÁC MỤC CON (BẢN ĐỘ NEON - GLASSMORPHISM)
          ========================================== */}
      <div className="space-y-16 mt-16 relative">
        {groupedModules.map((section, idx) => (
          <div key={idx} className="relative group/section">
            
            {/* Lớp Hào Quang Tỏa Ra Phía Sau */}
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/0 via-pink-400/10 to-purple-500/0 rounded-[3.5rem] blur-2xl opacity-0 group-hover/section:opacity-100 transition-opacity duration-1000 -z-10"></div>

            {/* Khối Container Chính (Glassmorphism) */}
            <div className="relative bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-500 hover:border-pink-200/80 hover:shadow-[0_8px_50px_rgba(236,72,153,0.1)]">

              {/* Họa tiết Lưới Chấm Bi Mờ */}
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

              {/* Vệt Laser quét ngang viền trên khi hover */}
              <div className="absolute top-0 left-0 w-full h-[3px] opacity-0 group-hover/section:opacity-100 transition-opacity duration-500 overflow-hidden pointer-events-none">
                 <div className="w-[100%] h-full bg-gradient-to-r from-transparent via-pink-500 to-transparent -translate-x-full group-hover/section:translate-x-full transition-transform duration-[1500ms] ease-in-out"></div>
              </div>

              {/* Tiêu đề Nhóm (Header) */}
              <div className="flex items-center justify-between mb-8 relative z-10 border-b border-stone-200/50 pb-5">
                <h2 className="text-2xl lg:text-3xl font-serif font-black text-stone-800 flex items-center gap-4">
                  <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-stone-100 shadow-md group-hover/section:scale-110 transition-transform duration-500">
                    <span className="text-3xl drop-shadow-sm">{section.sectionIcon}</span>
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-60"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500 border-2 border-white shadow-sm"></span>
                    </span>
                  </div>
                  {section.sectionTitle}
                </h2>
              </div>

              {/* Các Thẻ Chức Năng Con (Grid Nội Bộ) - ĐÃ BỎ NÚT BẤM, CĂN GIỮA NHÃN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                {section.items.map((item) => (
                  <Link href={item.path} key={item.name} className="relative group block h-full">
                    
                    {/* Lớp sáng neon tỏa ra từ thẻ con */}
                    <div className={`absolute -inset-[2px] bg-gradient-to-b ${item.colorFrom} via-transparent to-transparent rounded-3xl blur-[10px] opacity-20 group-hover:opacity-100 ${item.colorHoverFrom} transition-all duration-500`}></div>
                    <div className={`absolute -inset-[1px] bg-gradient-to-b ${item.colorFrom} to-stone-200/50 rounded-3xl z-0`}></div>
                    
                    <div className="relative h-full bg-white/90 backdrop-blur-sm rounded-3xl p-6 flex flex-col items-center text-center z-10 shadow-[0_8px_20px_rgb(0,0,0,0.02)] border border-white">
                      
                      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-500 drop-shadow-sm">
                        {item.icon}
                      </div>
                      
                      <h3 className={`text-[15px] font-black text-${item.color}-600 mb-2 tracking-wide`}>
                        {item.name}
                      </h3>
                      
                      {/* KHU VỰC NHÃN ĐÃ ĐƯỢC CĂN GIỮA VÀ LÀM ĐẸP HƠN */}
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
        ))}
      </div>

    </div>
  );
}