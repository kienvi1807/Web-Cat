"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase'; 

export default function Header() {
  const pathname = usePathname();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);       
  const [isAdmin, setIsAdmin] = useState(false); 
  const [cartItemCount, setCartItemCount] = useState(0);       
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const userData = localStorage.getItem('kinvie_user');
    if (userData) {
      setIsLoggedIn(true);
      const parsedData = JSON.parse(userData);
      if (parsedData.type === 'Boss' || parsedData.type === 'Staff' || parsedData.type === 'admin') {
        setIsAdmin(true);
      }
    } else {
      setIsLoggedIn(false);
    }

    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true); 
        
        const { data: dbUser } = await supabase
          .from('users')
          .select('userid, avatarurl, type_id')
          .eq('email', user.email)
          .single();

        if (dbUser) {
          const isStaffOrBoss = dbUser.type_id === 1 || dbUser.type_id === 2;
          setIsAdmin(isStaffOrBoss);

          if (!isStaffOrBoss) {
            const { count } = await supabase
              .from('cart_items')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', dbUser.userid);
            setCartItemCount(count || 0);
          } else {
            setCartItemCount(0); 
          }

          let finalUrl = dbUser.avatarurl || user.user_metadata?.avatar_url || user.user_metadata?.picture;
          if (finalUrl) {
            if (finalUrl.includes('fbcdn.net')) {
              finalUrl = finalUrl.replace(/\/[sp]\d+x\d+\//, '/');
            } else if (finalUrl.includes('graph.facebook.com')) {
              const separator = finalUrl.includes('?') ? '&' : '?';
              finalUrl = `${finalUrl}${separator}width=400&height=400`;
            } else if (finalUrl.includes('googleusercontent.com')) {
              finalUrl = finalUrl.replace('s96-c', 's400-c');
            }
            setAvatarUrl(finalUrl);
          }
        }
      }
    };

    fetchUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        fetchUserData();
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setAvatarUrl(null);
        setCartItemCount(0);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname]);

  const isShopPage = pathname === '/cattery' || pathname === '/petshop';
  const wrapperSize = isShopPage ? 'w-20 h-20 md:w-24 md:h-24' : 'w-24 h-24 md:w-32 md:h-32';
  const spinRingSize = isShopPage ? 'w-16 h-16 md:w-20 md:h-20' : 'w-20 h-20 md:w-28 md:h-28';
  const logoSize = isShopPage ? 'w-14 h-14 md:w-18 md:h-18' : 'w-16 h-16 md:w-24 md:h-24';

  // 🎯 LƯU Ý: Em bọc toàn bộ bằng thẻ <> </> để tách riêng Header và Menu Mobile
  return (
    <>
      <header className="fixed top-0 w-full z-40 bg-white/70 backdrop-blur-md border-b border-pink-50">
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes run-front { 0% { transform: rotate(30deg); } 100% { transform: rotate(-40deg); } }
          @keyframes run-back { 0% { transform: rotate(-40deg); } 100% { transform: rotate(30deg); } }
          @keyframes tail-wag { 0% { transform: rotate(10deg); } 100% { transform: rotate(-20deg); } }
          @keyframes cat-bounce { 0% { transform: translateY(0px); } 100% { transform: translateY(-3px); } }
          
          .cat-leg-f { transform-origin: 65px 50px; animation: run-front 0.2s infinite alternate ease-in-out; }
          .cat-leg-b { transform-origin: 35px 50px; animation: run-back 0.2s infinite alternate ease-in-out; }
          .cat-tail { transform-origin: 25px 45px; animation: tail-wag 0.25s infinite alternate ease-in-out; }
          .cat-body-group { animation: cat-bounce 0.2s infinite alternate ease-in-out; }
        `}} />

        <div className="container mx-auto px-4 h-20 flex items-center justify-between relative">
          
          {/* NÚT MENU ĐIỆN THOẠI */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden z-20 w-10 h-10 flex items-center justify-center text-pink-500 hover:bg-pink-50 rounded-full transition-colors"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          {/* MENU TRÁI (DESKTOP) */}
          <nav className="hidden md:flex gap-8 font-medium text-stone-600 w-1/3">
            <Link href="/" className={`pb-1 transition-colors ${pathname === '/' ? 'text-pink-500 font-bold border-b-2 border-pink-500 cursor-default' : 'hover:text-pink-400'}`}>Trang Chủ</Link>
            <Link href="/cattery" className={`pb-1 transition-colors ${pathname === '/cattery' ? 'text-pink-500 font-bold border-b-2 border-pink-500 cursor-default' : 'hover:text-pink-400'}`}>KinVie Cattery</Link>
            <Link href="/petshop" className={`pb-1 transition-colors ${pathname === '/petshop' ? 'text-pink-500 font-bold border-b-2 border-pink-500 cursor-default' : 'hover:text-pink-400'}`}>Beam Petshop</Link>
          </nav>

          {/* LOGO TRUNG TÂM */}
          <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center top-1/2 -translate-y-1/2 mt-2 z-10">
            <div className={`relative flex items-center justify-center transition-all duration-300 ${wrapperSize}`}>
               <div className={`absolute border-2 border-pink-200 border-dashed rounded-full animate-[spin_8s_linear_infinite] z-20 transition-all duration-300 ${spinRingSize}`}>
                 <div className="absolute -top-4 md:-top-5 left-1/2 -translate-x-1/2 w-8 h-8 md:w-10 md:h-10 text-pink-400 drop-shadow-sm">
                   <svg viewBox="0 0 100 100" className="w-full h-full fill-current stroke-current overflow-visible">
                     <g className="cat-body-group">
                        <path className="cat-tail" d="M25,45 Q10,25 15,10" fill="none" strokeWidth="5" strokeLinecap="round"/>
                        <line className="cat-leg-b" x1="35" y1="50" x2="25" y2="75" strokeWidth="6" strokeLinecap="round"/>
                        <line className="cat-leg-b" x1="45" y1="50" x2="35" y2="75" strokeWidth="6" strokeLinecap="round" style={{animationDelay: '0.1s', opacity: 0.6}}/>
                        <line className="cat-leg-f" x1="65" y1="50" x2="70" y2="75" strokeWidth="6" strokeLinecap="round"/>
                        <line className="cat-leg-f" x1="55" y1="50" x2="60" y2="75" strokeWidth="6" strokeLinecap="round" style={{animationDelay: '0.1s', opacity: 0.6}}/>
                        <ellipse cx="50" cy="45" rx="25" ry="15" className="stroke-none" />
                        <circle cx="75" cy="35" r="14" className="stroke-none" />
                        <polygon points="68,25 65,10 78,25" className="stroke-none" />
                        <polygon points="82,25 85,10 72,25" className="stroke-none" />
                     </g>
                   </svg>
                 </div>
                 <div className="absolute top-1/2 -left-3 -translate-y-1/2 -rotate-90 text-[8px] md:text-[10px] opacity-60">🐾</div>
                 <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rotate-180 text-[8px] md:text-[10px] opacity-30">🐾</div>
               </div>
               <div className={`absolute rounded-full overflow-hidden shadow-md border-2 border-white bg-white z-10 transition-all duration-300 ${logoSize}`}>
                 <Image src="/images/logo.jpg" alt="KinVie Logo" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" priority />
               </div>
            </div>
            {isShopPage && (
              <span className="font-serif italic font-bold text-[10px] md:text-sm text-pink-500 md:-mt-1 whitespace-nowrap bg-white/50 px-2 rounded-full">
                {pathname === '/cattery' ? 'KinVie Cattery' : 'Beam Petshop'}
              </span>
            )}
          </Link>

          {/* MENU PHẢI */}
          <nav className="flex gap-3 md:gap-6 font-medium text-stone-600 items-center justify-end w-1/3 z-20">
            <Link href="/blog" className={`hidden md:block pb-1 transition-colors ${pathname === '/blog' ? 'text-pink-500 font-bold border-b-2 border-pink-500 cursor-default mr-2' : 'hover:text-pink-400 mr-2'}`}>Blog</Link>

            {isLoggedIn && isAdmin && (
              <Link href="/dashboard" className="hidden md:flex items-center gap-1.5 text-sm font-bold text-rose-500 hover:text-white hover:bg-rose-500 bg-rose-50 px-3 py-1.5 rounded-full transition-colors border border-rose-100">
                <span>⚙️</span> Quản lý
              </Link>
            )}
            
            {/* GIỎ HÀNG */}
            {isLoggedIn && !isAdmin && (
              <Link href="/cart" className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-stone-50 transition-colors">
                <span className="text-xl md:text-2xl">🛒</span>
                {cartItemCount > 0 && (
                  <span className="absolute 0 md:-top-1 -right-1 bg-rose-500 text-white text-[9px] md:text-[10px] font-black px-1.5 min-w-[18px] md:min-w-[20px] h-4 md:h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {/* AVATAR LOGIN */}
            {isLoggedIn ? (
              <Link href="/profile" className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-pink-100 flex items-center justify-center bg-stone-100 hover:border-pink-300 transition-all shadow-sm">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg md:text-xl text-stone-400">👤</span>
                )}
              </Link>
            ) : (
              <Link href="/login" className="text-xs md:text-sm font-bold text-pink-500 hover:text-pink-600 transition-colors">
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* =======================================
          📱 OVERLAY MENU ĐIỆN THOẠI (ĐÃ BẾ RA NGOÀI HEADER)
          ======================================= */}
      <div className={`md:hidden fixed inset-0 z-[100] transition-all duration-400 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        
        {/* Nền đen che tối mờ màn hình, ấn vào để đóng */}
        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
        
        {/* Khung Menu trắng tinh khôi full màn hình (100dvh chống lỗi lướt trên Safari) */}
        <div className={`absolute top-0 left-0 w-[85%] max-w-[360px] h-[100dvh] bg-white shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col rounded-r-[2rem] ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          
          {/* Header Menu Mobile */}
          <div className="flex items-center justify-between p-6 border-b border-pink-50 bg-pink-50/20">
            <div className="flex flex-col">
              <span className="font-serif italic font-black text-2xl text-pink-500">KinVie</span>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Cattery & Petshop</span>
            </div>
            {/* Nút X to đùng dễ bấm */}
            <button onClick={() => setIsMobileMenuOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white text-pink-500 rounded-full shadow-sm border border-pink-100 transition-transform active:scale-90">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Danh sách nút bấm (To, có box bao quanh dễ nhấp) */}
          <div className="flex flex-col p-6 gap-3 overflow-y-auto flex-grow bg-gradient-to-b from-white to-pink-50/20">
            {[
              { name: 'Trang Chủ', href: '/', icon: '🏠' },
              { name: 'KinVie Cattery', href: '/cattery', icon: '🐱' },
              { name: 'Beam Petshop', href: '/petshop', icon: '🏪' },
              { name: 'Blog Kiến Thức', href: '/blog', icon: '📖' }
            ].map((item) => (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all border ${pathname === item.href ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-200' : 'bg-white border-stone-100 hover:border-pink-200 text-stone-700 shadow-sm'}`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-black text-[17px]">{item.name}</span>
              </Link>
            ))}
            
            {/* Nút Quản lý nổi bần bật cho Admin */}
            {isLoggedIn && isAdmin && (
              <Link href="/dashboard" className="flex items-center gap-4 p-4 rounded-2xl bg-stone-900 border-stone-900 text-white shadow-lg shadow-stone-300 mt-2">
                <span className="text-2xl">⚙️</span>
                <span className="font-black text-[17px]">Quản lý hệ thống</span>
              </Link>
            )}
          </div>

          {/* User Profile cắm chốt bên dưới */}
          <div className="p-6 border-t border-pink-100 bg-white shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <img src={avatarUrl || ''} className="w-12 h-12 rounded-full border-2 border-pink-200 object-cover shadow-sm" alt="user" />
                <div className="flex flex-col">
                  <span className="font-bold text-stone-800 text-sm">Chào Boss!</span>
                  <Link href="/profile" className="text-xs font-bold text-pink-500 py-1 hover:underline">Quản lý tài khoản</Link>
                </div>
              </div>
            ) : (
              <Link href="/login" className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-black text-center block shadow-lg shadow-pink-200">
                Đăng nhập ngay
              </Link>
            )}
          </div>

        </div>
      </div>
    </>
  );
}