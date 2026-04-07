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

      const { data: dbUser } = await supabase
        .from('users')
        .select(`fullname, type_id`)
        .eq('email', user.email)
        .single();

      if (dbUser?.type_id !== 1 && dbUser?.type_id !== 2) {
        alert("Khu vực tuyệt mật! Chỉ dành cho quản trị viên.");
        router.push('/');
      } else {
        setAdminName(dbUser?.fullname || 'Admin');
        setIsAuthorized(true);
      }
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

  // 🎯 BỘ MENU MỚI CHUẨN ERP THEO ĐÚNG YÊU CẦU CỦA SẾP
  const menuItems = [
    { name: 'Tổng quan', icon: '📊', path: '/dashboard' },
    { name: 'Quản lý Mèo', icon: '🐱', path: '/dashboard/cats' },
    { name: 'Quản lý Petshop', icon: '🛍️', path: '/dashboard/petshop' },
    { name: 'Kinh doanh & Vận hành', icon: '📈', path: '/dashboard/operations' },
    { name: 'Quản lý Tài khoản', icon: '👥', path: '/dashboard/users' },
    { name: 'Tổ hợp Cafe Cat', icon: '☕', path: '/dashboard/cafe' },
    { name: 'Hệ thống & Nội dung', icon: '⚙️', path: '/dashboard/system' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex font-sans">
      
      {/* ==========================================
          SIDEBAR TỐI MÀU (DARK MODE - HIỆU ỨNG NEON)
          ========================================== */}
      <aside className="w-72 bg-[#0a0a0a] text-stone-300 flex flex-col fixed h-full shadow-[4px_0_24px_rgba(0,0,0,0.15)] z-[100] border-r border-stone-800/50">
        
        {/* LOGO */}
        <div className="h-20 flex items-center px-8 border-b border-stone-800/80 bg-black/20 backdrop-blur-sm">
          <Link href="/" className="text-xl font-serif font-black text-white tracking-wide flex items-center gap-3 group">
            <span className="text-pink-500 text-2xl drop-shadow-[0_0_12px_rgba(236,72,153,0.8)] group-hover:animate-spin-slow transition-all">🐾</span> 
            <span>KINVIE<span className="text-pink-500">.</span></span>
          </Link>
        </div>
        
        {/* MENU ĐIỀU HƯỚNG */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            // Logic: Nếu là trang chủ /dashboard thì so sánh khớp 100%. Còn lại thì check thư mục cha.
            const isActive = item.path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.path);
            
            return (
              <Link 
                key={item.name} 
                href={item.path} 
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-gradient-to-r from-pink-500/20 to-transparent text-white border-l-4 border-pink-500 shadow-[inset_2px_0_10px_rgba(236,72,153,0.1)]' 
                    : 'text-stone-400 hover:bg-stone-900 hover:text-pink-100 border-l-4 border-transparent'
                }`}
              >
                {/* Lớp ánh sáng chạy xẹt qua khi hover */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

                <span className={`text-xl z-10 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]' : 'group-hover:scale-125 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'}`}>
                  {item.icon}
                </span> 
                <span className="text-sm tracking-wide z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* USER INFO & NÚT ĐĂNG XUẤT */}
        <div className="p-6 border-t border-stone-800/80 bg-gradient-to-t from-black to-[#0a0a0a]">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(236,72,153,0.6)] uppercase border border-pink-400/50">
                {adminName.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{adminName}</p>
                <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]">Super Admin</p>
              </div>
           </div>
           <button onClick={handleLogout} className="flex items-center justify-center gap-2 bg-stone-900 border border-stone-800 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400 text-stone-500 text-sm font-bold w-full py-3 rounded-xl transition-all duration-300">
             <span className="text-lg">🚪</span> Thoát quản trị
           </button>
        </div>
      </aside>

      {/* ==========================================
          MAIN CONTENT (KHU VỰC NỘI DUNG GIỮA)
          ========================================== */}
      <main className="flex-1 ml-72 min-h-screen flex flex-col relative">
        {/* Điểm nhấn mờ ở background chính */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-pink-500/5 to-transparent -z-10 pointer-events-none"></div>
        
        <div className="p-10 flex-1">
          {children}
        </div>
      </main>

    </div>
  );
}