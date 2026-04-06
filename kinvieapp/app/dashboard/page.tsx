"use client";

import React from 'react';
import Link from 'next/link';

export default function DashboardHubPage() {
  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* 1. KHỐI THỐNG KÊ (HẮC - HƯỜNG NEON GLOW) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card: Doanh thu (Ánh Hồng) */}
        <div className="bg-stone-900 rounded-[2rem] p-6 border border-stone-800 shadow-xl relative overflow-hidden group hover:border-pink-500 transition-all duration-500 cursor-default">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl group-hover:bg-pink-500/50 transition-all duration-500"></div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Doanh thu tháng</p>
            <h3 className="text-3xl font-black text-white mb-3 tracking-tight">125.500.000đ</h3>
            <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <span>↑</span> 12% so với tháng trước
            </p>
          </div>
        </div>

        {/* Card: Đơn hàng (Ánh Đỏ/Cam) */}
        <div className="bg-stone-900 rounded-[2rem] p-6 border border-stone-800 shadow-xl relative overflow-hidden group hover:border-rose-500 transition-all duration-500 cursor-default">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl group-hover:bg-rose-500/50 transition-all duration-500"></div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Đơn hàng chờ duyệt</p>
            <h3 className="text-3xl font-black text-white mb-3 tracking-tight">14</h3>
            <p className="text-xs font-bold text-rose-400 flex items-center gap-1">
              Cần xử lý ngay
            </p>
          </div>
        </div>

        {/* Card: Mèo (Ánh Cam/Vàng) */}
        <div className="bg-stone-900 rounded-[2rem] p-6 border border-stone-800 shadow-xl relative overflow-hidden group hover:border-amber-500 transition-all duration-500 cursor-default">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/50 transition-all duration-500"></div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Mèo đang sẵn sàng</p>
            <h3 className="text-3xl font-black text-white mb-3 tracking-tight">08</h3>
            <p className="text-xs font-bold text-stone-300 flex items-center gap-1">
              2 bé sắp về nhà mới
            </p>
          </div>
        </div>

        {/* Card: Khách hàng (Ánh Xanh) */}
        <div className="bg-stone-900 rounded-[2rem] p-6 border border-stone-800 shadow-xl relative overflow-hidden group hover:border-cyan-500 transition-all duration-500 cursor-default">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl group-hover:bg-cyan-500/50 transition-all duration-500"></div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Khách hàng mới</p>
            <h3 className="text-3xl font-black text-white mb-3 tracking-tight">42</h3>
            <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <span>↑</span> 5 Sen gia nhập tuần này
            </p>
          </div>
        </div>

      </div>

      {/* 2. KHỐI LỰA CHỌN TÁC VỤ (Giữ nguyên giao diện mượt mà) */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-6">Lựa chọn Tác vụ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Link href="/dashboard/cattery" className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:border-orange-300 hover:shadow-md transition-all group flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🐱</div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">Quản lý KinVie<br/>Cattery</h3>
            </div>
            <p className="text-sm text-slate-500 flex-1 mb-6 leading-relaxed">
              Đăng bán mèo mới, cập nhật trạng thái sức khỏe, chỉnh sửa giá và cập nhật độ tuổi.
            </p>
            <span className="text-sm font-bold text-orange-500 flex items-center gap-2 group-hover:translate-x-2 transition-transform w-fit">
              Truy cập <span>→</span>
            </span>
          </Link>

          <Link href="/dashboard/petshop" className="bg-white rounded-[2rem] p-8 shadow-sm border-2 border-pink-100 hover:border-pink-400 hover:shadow-md transition-all group flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 to-rose-400"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🏪</div>
              <h3 className="text-lg font-bold text-pink-600 leading-tight">Quản lý Beam<br/>Petshop</h3>
            </div>
            <p className="text-sm text-slate-500 flex-1 mb-6 leading-relaxed">
              Thêm sản phẩm phụ kiện, đồ ăn, cập nhật kho hàng và tạo mã giảm giá Flash Sale.
            </p>
            <span className="text-sm font-bold text-pink-500 flex items-center gap-2 group-hover:translate-x-2 transition-transform w-fit">
              Truy cập <span>→</span>
            </span>
          </Link>

          <Link href="/dashboard/orders" className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all group flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">📦</div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">Theo dõi<br/>Đơn hàng</h3>
            </div>
            <p className="text-sm text-slate-500 flex-1 mb-6 leading-relaxed">
              Duyệt đơn hàng mới, hủy đơn, cập nhật trạng thái vận chuyển và giao hàng cho khách.
            </p>
            <span className="text-sm font-bold text-blue-500 flex items-center gap-2 group-hover:translate-x-2 transition-transform w-fit">
              Truy cập <span>→</span>
            </span>
          </Link>

          <Link href="/dashboard/users" className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">👥</div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">Quản lý<br/>Thành viên</h3>
            </div>
            <p className="text-sm text-slate-500 flex-1 mb-6 leading-relaxed">
              Phân quyền tài khoản Staff/Boss, quản lý thông tin khách hàng, duyệt tài khoản Breeder.
            </p>
            <span className="text-sm font-bold text-emerald-500 flex items-center gap-2 group-hover:translate-x-2 transition-transform w-fit">
              Truy cập <span>→</span>
            </span>
          </Link>

          <Link href="/dashboard/blog" className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:border-purple-300 hover:shadow-md transition-all group flex flex-col h-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">✍️</div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">Quản lý<br/>Blog & Tin tức</h3>
            </div>
            <p className="text-sm text-slate-500 flex-1 mb-6 leading-relaxed">
              Viết bài chia sẻ kinh nghiệm nuôi mèo, kiến thức dinh dưỡng và sự kiện của Cattery.
            </p>
            <span className="text-sm font-bold text-purple-500 flex items-center gap-2 group-hover:translate-x-2 transition-transform w-fit">
              Truy cập <span>→</span>
            </span>
          </Link>

          <Link href="/dashboard/settings" className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all group flex flex-col h-full opacity-70 hover:opacity-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">⚙️</div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">Cài đặt<br/>Hệ thống</h3>
            </div>
            <p className="text-sm text-slate-500 flex-1 mb-6 leading-relaxed">
              Cấu hình màu sắc, banner trang chủ, thông tin liên hệ và chính sách đổi trả.
            </p>
            <span className="text-sm font-bold text-slate-600 flex items-center gap-2 group-hover:translate-x-2 transition-transform w-fit">
              Truy cập <span>→</span>
            </span>
          </Link>

        </div>
      </div>

    </div>
  );
}