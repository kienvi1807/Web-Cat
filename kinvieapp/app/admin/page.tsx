"use client";

import React from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  // Danh sách các chức năng quản trị
  const adminModules = [
    { 
      id: 'cattery', 
      title: 'Quản lý KinVie Cattery', 
      desc: 'Đăng bán mèo mới, cập nhật trạng thái, chỉnh sửa giá và độ tuổi.', 
      icon: '🐱', 
      link: '/admin/cattery',
      color: 'bg-rose-100 text-rose-600'
    },
    { 
      id: 'petshop', 
      title: 'Quản lý Beam Petshop', 
      desc: 'Thêm sản phẩm, cập nhật kho hàng, tạo mã giảm giá Flash Sale.', 
      icon: '🏪', 
      link: '/admin/petshop',
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      id: 'orders', 
      title: 'Theo dõi Đơn hàng', 
      desc: 'Duyệt đơn, hủy đơn, cập nhật trạng thái giao hàng cho khách.', 
      icon: '📦', 
      link: '/admin/orders',
      color: 'bg-green-100 text-green-600'
    },
    { 
      id: 'users', 
      title: 'Quản lý Thành viên', 
      desc: 'Cấp tài khoản mới, phân hạng Kim Cương/Vàng, xem lịch sử mua.', 
      icon: '👥', 
      link: '/admin/users',
      color: 'bg-purple-100 text-purple-600'
    },
    { 
      id: 'blog', 
      title: 'Quản lý Blog', 
      desc: 'Viết bài Cẩm nang mới, ẩn/hiện bài viết, quản lý bình luận.', 
      icon: '✍️', 
      link: '/admin/blog',
      color: 'bg-orange-100 text-orange-600'
    },
    { 
      id: 'settings', 
      title: 'Cài đặt Hệ thống', 
      desc: 'Thay đổi banner trang chủ, cập nhật thông tin liên hệ, API.', 
      icon: '⚙️', 
      link: '/admin/settings',
      color: 'bg-stone-200 text-stone-600'
    },
  ];

  return (
    <div className="flex h-screen bg-stone-100 font-sans overflow-hidden">
      
      {/* SIDEBAR TRÁI (Cố định) */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="h-20 flex items-center justify-center border-b border-slate-800">
          <Link href="/" className="text-white font-serif italic font-bold text-xl flex items-center gap-2 hover:text-pink-400 transition-colors">
            <span>🐾</span> Admin Panel
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto text-sm font-medium">
          <Link href="/admin" className="flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-xl">
            <span>📊</span> Tổng quan (Hub)
          </Link>
          <Link href="/admin/cattery" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
            <span>🐱</span> Mèo Maine Coon
          </Link>
          <Link href="/admin/petshop" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
            <span>🏪</span> Sản phẩm Petshop
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
            <span>📦</span> Đơn hàng
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
            <span>👥</span> Thành viên
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-slate-800 transition-colors text-sm font-medium">
            <span>🚪</span> Đăng xuất
          </Link>
        </div>
      </aside>

      {/* KHU VỰC NỘI DUNG CHÍNH (Bên phải) */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-20 bg-white border-b border-stone-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold text-stone-800">Bảng Điều Khiển Trung Tâm</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-stone-400 hover:text-stone-600 transition-colors">
              🔔 <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-stone-200 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-stone-800">Nguyễn Trung Kiên</p>
                <p className="text-xs text-stone-500">Super Admin</p>
              </div>
              <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                K
              </div>
            </div>
          </div>
        </header>

        {/* NỘI DUNG HUB */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* Thống kê nhanh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <p className="text-sm text-stone-500 font-medium mb-1">Doanh thu tháng</p>
              <h3 className="text-2xl font-black text-stone-800">125.500.000đ</h3>
              <p className="text-xs text-green-500 font-bold mt-2">↑ 12% so với tháng trước</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <p className="text-sm text-stone-500 font-medium mb-1">Đơn hàng chờ duyệt</p>
              <h3 className="text-2xl font-black text-stone-800">14</h3>
              <p className="text-xs text-rose-500 font-bold mt-2">Cần xử lý ngay</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <p className="text-sm text-stone-500 font-medium mb-1">Mèo đang sẵn sàng</p>
              <h3 className="text-2xl font-black text-stone-800">08</h3>
              <p className="text-xs text-stone-400 font-bold mt-2">2 bé sắp về nhà mới</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <p className="text-sm text-stone-500 font-medium mb-1">Khách hàng mới</p>
              <h3 className="text-2xl font-black text-stone-800">42</h3>
              <p className="text-xs text-green-500 font-bold mt-2">↑ 5 Sen gia nhập tuần này</p>
            </div>
          </div>

          {/* Lưới các Tác vụ (Grid Modules) */}
          <h2 className="text-lg font-bold text-stone-800 mb-4">Lựa chọn Tác vụ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {adminModules.map((module) => (
              <Link href={module.link} key={module.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md hover:border-pink-300 transition-all group flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold ${module.color} group-hover:scale-110 transition-transform`}>
                    {module.icon}
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 group-hover:text-pink-600 transition-colors">{module.title}</h3>
                </div>
                <p className="text-stone-500 text-sm mb-6 flex-1">{module.desc}</p>
                <div className="text-pink-500 text-sm font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                  Truy cập <span>➔</span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </main>

    </div>
  );
}