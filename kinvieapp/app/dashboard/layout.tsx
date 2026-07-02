"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: dbUser } = await supabase.from('users').select('fullname, type_id').eq('email', user.email).maybeSingle();
      if (!dbUser) {
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }

      setAdminName(dbUser.fullname);
      setIsAuthorized(true);
    };
    checkAuth();
  }, [router]);

  if (!isAuthorized) return <div className="min-h-screen bg-stone-900 flex items-center justify-center font-bold text-pink-500 text-xl animate-pulse">Đang xác thực quyền lực... 👑</div>;

  const handleLogout = async () => {
    if (window.confirm("Thoát khỏi trang quản trị?")) {
      await supabase.auth.signOut();
      localStorage.removeItem('kinvie_user');
      router.push('/login');
    }
  };

  const menuItems = [
    { name: 'Tổng quan', icon: '📊', path: '/dashboard' },
    { name: 'Quản lý Mèo', icon: '🐱', path: '/dashboard/cats' },
    { name: 'Beam Petshop', icon: '🛍️', path: '/dashboard/petshop' },
    { name: 'Kinh doanh & Vận hành', icon: '📈', path: '/dashboard/operations' },
    { name: 'Tài khoản & Đối tác', icon: '👥', path: '/dashboard/users' },
    { name: 'Tổ hợp Cafe Cat', icon: '☕', path: '/dashboard/cafe' },
    { name: 'Hệ thống & Nội dung', icon: '⚙️', path: '/dashboard/system' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex font-sans">
      
      {/* ==========================================
          SIDEBAR MINI (THU GỌN) & BUNG RA KHI HOVER
          ========================================== */}
      {/* 🎯 SỬ DỤNG CLASS "group" VÀ THAY ĐỔI WIDTH TỪ w-20 -> hover:w-72 */}
      <aside className="group w-20 hover:w-72 bg-[#0a0a0a] text-stone-300 flex flex-col fixed h-full shadow-[4px_0_24px_rgba(0,0,0,0.15)] hover:shadow-[10px_0_30px_rgba(0,0,0,0.4)] z-[100] border-r border-stone-800/50 transition-all duration-300 ease-in-out overflow-hidden">
        
        {/* LOGO */}
        <div className="h-20 flex items-center px-6 border-b border-stone-800/80 bg-black/20 backdrop-blur-sm whitespace-nowrap">
          <Link href="/" className="text-xl font-serif font-black text-white tracking-wide flex items-center gap-4">
            {/* Chân chó luôn hiện */}
            <span className="text-pink-500 text-3xl drop-shadow-[0_0_12px_rgba(236,72,153,0.8)] group-hover:animate-spin-slow transition-all shrink-0">🐾</span> 
            {/* Chữ KINVIE ẩn đi khi thu nhỏ, hiện ra khi hover */}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">KINVIE<span className="text-pink-500">.</span></span>
          </Link>
        </div>
        
        {/* MENU ĐIỀU HƯỚNG */}
        {/* custom-scrollbar overflow-x-hidden để khi thu nhỏ không bị nảy thanh cuộn ngang */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = item.path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.path);
            
            return (
              <Link 
                key={item.name} 
                href={item.path} 
                title={item.name} // Tooltip hiện chữ khi sidebar đang thu nhỏ
                className={`flex items-center gap-4 px-3 py-3.5 rounded-2xl font-bold transition-all duration-300 relative overflow-hidden whitespace-nowrap ${
                  isActive 
                    ? 'bg-gradient-to-r from-pink-500/20 to-transparent text-white border-l-4 border-pink-500 shadow-[inset_2px_0_10px_rgba(236,72,153,0.1)]' 
                    : 'text-stone-400 hover:bg-stone-900 hover:text-pink-100 border-l-4 border-transparent'
                }`}
              >
                {/* Lớp ánh sáng chạy xẹt qua khi hover (Chỉ hiện khi sidebar bung ra) */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

                {/* Icon (Cố định chiều rộng w-8 để nằm chính giữa khi thu nhỏ) */}
                <span className={`text-[22px] shrink-0 w-8 flex justify-center z-10 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]' : 'group-hover:scale-125 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'}`}>
                  {item.icon}
                </span> 
                
                {/* Text (Ẩn đi, tịnh tiến và hiện ra khi hover) */}
                <span className="text-sm tracking-wide z-10 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 delay-75">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* USER INFO & NÚT ĐĂNG XUẤT */}
        <div className="p-4 border-t border-stone-800/80 bg-gradient-to-t from-black to-[#0a0a0a] whitespace-nowrap">
           <div className="flex items-center gap-4 mb-5">
              {/* Avatar cố định size */}
              <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(236,72,153,0.6)] uppercase border border-pink-400/50">
                {adminName.charAt(0)}
              </div>
              
              {/* Thông tin ẩn hiện */}
              <div className="flex-1 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                <p className="text-sm font-bold text-white truncate">{adminName}</p>
                <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]">Super Admin</p>
              </div>
           </div>
           
           {/* Nút thoát */}
           <button onClick={handleLogout} className="flex items-center gap-4 bg-stone-900 border border-stone-800 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400 text-stone-500 font-bold w-full p-3 rounded-xl transition-all duration-300">
             <span className="text-xl shrink-0 w-8 flex justify-center">🚪</span> 
             <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">Thoát quản trị</span>
           </button>
        </div>
      </aside>

      {/* ==========================================
          MAIN CONTENT (Khu vực chính giờ có lề nhỏ hơn: ml-20)
          ========================================== */}
      <main className="flex-1 ml-20 min-h-screen flex flex-col relative transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-pink-500/5 to-transparent -z-10 pointer-events-none"></div>
        <div className="p-10 flex-1">
          {children}
        </div>
      </main>

    </div>
  );
}