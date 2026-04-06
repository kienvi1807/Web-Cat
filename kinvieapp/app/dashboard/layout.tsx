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

  if (!isAuthorized) return <div className="min-h-screen bg-stone-900 flex items-center justify-center font-bold text-pink-500">Đang xác thực quyền lực...</div>;

  const handleLogout = async () => {
    if (window.confirm("Thoát khỏi trang quản trị?")) {
      await supabase.auth.signOut();
      localStorage.removeItem('kinvie_user');
      router.push('/login');
    }
  };

  // 🎯 ĐÃ GOM NHÓM MENU THÀNH CÁC MODULE LỚN
  const menuItems = [
    { name: 'Tổng quan', icon: '📊', path: '/dashboard' },
    { name: 'Quản lý Mèo', icon: '🐱', path: '/dashboard/cats' },
    { name: 'Beam Petshop', icon: '🛍️', path: '/dashboard/petshop' },
    { name: 'Quản lý Đơn hàng', icon: '📦', path: '/dashboard/orders' },
    { name: 'Tài khoản & Đối tác', icon: '👥', path: '/dashboard/users' },
    { name: 'Quản lý Blog', icon: '📝', path: '/dashboard/blog' },
    { name: 'Tài chính', icon: '💰', path: '/dashboard/finance' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex font-sans">
      
      {/* SIDEBAR TỐI MÀU (DARK MODE) */}
      <aside className="w-72 bg-stone-950 text-stone-300 flex flex-col fixed h-full shadow-[4px_0_24px_rgba(0,0,0,0.1)] z-[100]">
        
        <div className="h-20 flex items-center px-8 border-b border-stone-800 bg-stone-950">
          <Link href="/" className="text-xl font-serif font-black text-white tracking-wide flex items-center gap-3">
            <span className="text-pink-500 text-2xl drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">🐾</span> 
            <span>KINVIE<span className="text-pink-500">.</span></span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            // 🎯 Logic: Nếu path là /dashboard thì so sánh chuẩn xác. Còn lại thì cứ nằm trong thư mục đó là sáng đèn.
            const isActive = item.path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.path);
            
            return (
              <Link 
                key={item.name} 
                href={item.path} 
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 group ${
                  isActive 
                    ? 'bg-pink-500/10 text-pink-400 shadow-[inset_4px_0_0_0_#ec4899]' 
                    : 'text-stone-400 hover:bg-stone-900 hover:text-pink-300'
                }`}
              >
                <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span> 
                <span className="text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-stone-800 bg-stone-900/50">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-lg shadow-[0_0_10px_rgba(236,72,153,0.5)] uppercase">
                {adminName.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{adminName}</p>
                <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Super Admin</p>
              </div>
           </div>
           <button onClick={handleLogout} className="flex items-center justify-center gap-2 bg-stone-800 hover:bg-rose-500 text-stone-400 hover:text-white text-sm font-bold w-full py-3 rounded-xl transition-all shadow-sm">
             <span>🚪</span> Thoát quản trị
           </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 min-h-screen flex flex-col">
        <div className="p-10 flex-1">
          {children}
        </div>
      </main>

    </div>
  );
}