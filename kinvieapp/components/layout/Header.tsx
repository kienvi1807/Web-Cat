"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // 👈 BẮT BUỘC IMPORT SUPABASE

export default function Header() {
  const pathname = usePathname();
  
  // ========================================================
  // STATE QUẢN LÝ ĐĂNG NHẬP & AVATAR
  // ========================================================
  const [isLoggedIn, setIsLoggedIn] = useState(false);       
  const [userRole, setUserRole] = useState('customer');    
  const [cartItemCount, setCartItemCount] = useState(0);       
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // 👈 Thêm state chứa ảnh

  // Hook kiểm tra đăng nhập và lấy Avatar
  useEffect(() => {
    // 1. Lấy dữ liệu nhanh từ LocalStorage để render UI ngay lập tức
    const userData = localStorage.getItem('kinvie_user');
    if (userData) {
      setIsLoggedIn(true);
      const parsedData = JSON.parse(userData);
      setUserRole(parsedData.type === 'Boss' ? 'admin' : 'customer');
      setCartItemCount(3); 
    } else {
      setIsLoggedIn(false);
    }

    // 2. Kéo ngầm Avatar chất lượng cao từ Database
    const fetchAvatar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true); // Backup check an toàn
        
        // Ưu tiên lấy ảnh từ DB (vì có thể khách vừa tải ảnh mới ở trang Edit Profile)
        const { data: dbUser } = await supabase
          .from('users')
          .select('avatarurl')
          .eq('email', user.email)
          .single();

        let finalUrl = dbUser?.avatarurl || user.user_metadata?.avatar_url || user.user_metadata?.picture;

        if (finalUrl) {
          // Áp dụng "Ma thuật" tẩy mờ ảnh cho Facebook/Google
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
    };

    fetchAvatar();

    // 3. Lắng nghe thay đổi (Khách vừa login/logout là Header tự cập nhật ngay)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        fetchAvatar();
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setAvatarUrl(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname]); // Vẫn giữ pathname để nó load lại khi nhảy trang

  // Logic check xem đang ở trang nào để đổi size logo
  const isShopPage = pathname === '/cattery' || pathname === '/petshop';
  
  // Kích thước vòng ngoài và logo thay đổi linh hoạt (TO RÕ RÀNG)
  const wrapperSize = isShopPage ? 'w-24 h-24' : 'w-32 h-32';
  const spinRingSize = isShopPage ? 'w-20 h-20' : 'w-28 h-28';
  const logoSize = isShopPage ? 'w-18 h-18' : 'w-24 h-24';

  return (
    <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-pink-50">
      
      {/* --- INLINE STYLE CHO ANIMATION MÈO CHẠY --- */}
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
        
        {/* --- MENU TRÁI --- */}
        <nav className="hidden md:flex gap-8 font-medium text-stone-600 w-1/3">
          {pathname === '/' ? (
            <span className="text-pink-500 font-bold border-b-2 border-pink-500 pb-1 cursor-default">Trang Chủ</span>
          ) : (
            <Link href="/" className="hover:text-pink-400 transition-colors pb-1">Trang Chủ</Link>
          )}
          {pathname === '/cattery' ? (
            <span className="text-pink-500 font-bold border-b-2 border-pink-500 pb-1 cursor-default">KinVie Cattery</span>
          ) : (
            <Link href="/cattery" className="hover:text-pink-400 transition-colors pb-1">KinVie Cattery</Link>
          )}
          {pathname === '/petshop' ? (
            <span className="text-pink-500 font-bold border-b-2 border-pink-500 pb-1 cursor-default">Beam Petshop</span>
          ) : (
            <Link href="/petshop" className="hover:text-pink-400 transition-colors pb-1">Beam Petshop</Link>
          )}
        </nav>

        {/* --- LOGO TRUNG TÂM --- */}
        <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center top-1/2 -translate-y-1/2 mt-2">
          
          <div className={`relative flex items-center justify-center transition-all duration-300 ${wrapperSize}`}>
             
             {/* 1. VÒNG QUỸ ĐẠO & ANIMATION CHẠY */}
             <div className={`absolute border-2 border-pink-200 border-dashed rounded-full animate-[spin_8s_linear_infinite] z-20 transition-all duration-300 ${spinRingSize}`}>
               
               <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 text-pink-400 drop-shadow-sm">
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

               <div className="absolute top-1/2 -left-3 -translate-y-1/2 -rotate-90 text-[10px] opacity-60">🐾</div>
               <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rotate-180 text-[10px] opacity-30">🐾</div>
             </div>
             
             {/* 2. LOGO HÌNH ẢNH Ở GIỮA */}
             <div className={`absolute rounded-full overflow-hidden shadow-md border-2 border-white bg-white z-10 transition-all duration-300 ${logoSize}`}>
               <Image 
                 src="/images/logo.jpg" 
                 alt="KinVie Logo" 
                 fill
                 className="object-cover" 
                 sizes="(max-width: 768px) 100vw, 33vw"
                 priority
               />
             </div>
             
          </div>
          
          {isShopPage && (
            <span className="font-serif italic font-bold text-sm text-pink-500 -mt-1 whitespace-nowrap">
              {pathname === '/cattery' ? 'KinVie Cattery' : 'Beam Petshop'}
            </span>
          )}
        </Link>

        {/* --- MENU PHẢI --- */}
        <nav className="hidden md:flex gap-6 font-medium text-stone-600 items-center justify-end w-1/3">
          {pathname === '/blog' ? (
            <span className="text-pink-500 font-bold border-b-2 border-pink-500 pb-1 cursor-default mr-2">Blog</span>
          ) : (
            <Link href="/blog" className="hover:text-pink-400 transition-colors pb-1 mr-2">Blog</Link>
          )}

          {/* HIỂN THỊ DỰA TRÊN STATE ĐÃ ĐĂNG NHẬP */}
          {isLoggedIn && userRole === 'admin' && (
            <Link href="/admin" className="flex items-center gap-1.5 text-sm font-bold text-rose-500 hover:text-white hover:bg-rose-500 bg-rose-50 px-3 py-1.5 rounded-full transition-colors border border-rose-100">
              <span>⚙️</span> Quản lý
            </Link>
          )}
          
          {isLoggedIn && userRole === 'customer' && (
            <Link href="/cart" className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-stone-50 transition-colors">
              <span className="text-2xl">🛒</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black px-1.5 min-w-[20px] h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>
          )}

          {isLoggedIn ? (
            <Link href="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-pink-100 flex items-center justify-center bg-stone-100 hover:border-pink-300 transition-all shadow-sm">
              {/* 👈 LOGIC HIỂN THỊ ẢNH HD Ở ĐÂY */}
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl text-stone-400">👤</span>
              )}
            </Link>
          ) : (
            <Link href="/login" className="text-sm font-bold text-pink-500 hover:text-pink-600 transition-colors ml-2">
              Đăng nhập
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}