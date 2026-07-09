
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import EvilEye from '@/components/common/EvilEye';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // 🌟 LƯU LẠI USER ID ĐỂ DÙNG CHO VIỆC ĐẾM GIỎ HÀNG
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // 🌟 HÀM ĐẾM GIỎ HÀNG TÁCH RỜI ĐỂ GỌI LẠI ĐƯỢC
  const fetchCartCount = async (userId: string) => {
    const { count } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    setCartItemCount(count || 0);
  };

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.is_read).length);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        if (isMounted) setIsLoadingAuth(true);

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          if (isMounted) {
            setIsLoggedIn(false);
            setIsLoadingAuth(false);
          }
          return;
        }

        if (isMounted) setIsLoggedIn(true);

        const { data: dbUser } = await supabase
          .from('users')
          .select('userid, avatarurl, type_id')
          .eq('email', session.user.email)
          .single();

        if (dbUser && isMounted) {
          setCurrentUserId(dbUser.userid); // Lưu ID lại
          const isStaffOrBoss = dbUser.type_id === 1 || dbUser.type_id === 2;
          setIsAdmin(isStaffOrBoss);

          if (!isStaffOrBoss) {
            fetchCartCount(dbUser.userid); // Gọi hàm đếm giỏ hàng
          } else {
            setCartItemCount(0);
          }
          fetchNotifications(dbUser.userid);

          let finalUrl = dbUser.avatarurl || session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture;
          if (finalUrl) {
            if (finalUrl.includes('fbcdn.net')) {
              finalUrl = finalUrl.replace(/\/[sp]\d+x\d+\//, '/');
            } else if (finalUrl.includes('graph.facebook.com')) {
              const separator = finalUrl.includes('?') ? '&' : '?';
              finalUrl = `${finalUrl}${separator}width=400&height=400`;
            } else if (finalUrl.includes('googleusercontent.com')) {
              finalUrl = finalUrl.replace('s96-c', 's400-c');
            }

            if (typeof finalUrl === 'string' && finalUrl.trim() !== '') {
              setAvatarUrl(finalUrl);
            }
          }
        }
      } catch (error) {
        console.error("Lỗi xác thực:", error);
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        checkSession();
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setAvatarUrl(null);
        setCartItemCount(0);
        setIsAdmin(false);
        setIsLoadingAuth(false);
        setCurrentUserId(null);
        setNotifications([]);
        setUnreadCount(0);
        setIsNotifOpen(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [pathname]);

  // 🌟 LẮNG NGHE TÍN HIỆU TỪ NÚT THÊM VÀO GIỎ HÀNG
  useEffect(() => {
    const handleCartUpdate = () => {
      if (currentUserId) {
        fetchCartCount(currentUserId);
      }
    };

    // Mở ăng-ten bắt sóng sự kiện tên là 'update_cart'
    window.addEventListener('update_cart', handleCartUpdate);
    return () => window.removeEventListener('update_cart', handleCartUpdate);
  }, [currentUserId]);

  // 🔔 REALTIME: lắng nghe thông báo mới đến ngay lập tức
  useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase
      .channel(`notifications-${currentUserId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${currentUserId}` }, (payload) => {
        setNotifications(prev => [payload.new, ...prev].slice(0, 20));
        setUnreadCount(prev => prev + 1);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'notifications', filter: `user_id=eq.${currentUserId}` }, (payload) => {
        setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUserId]);

  const handleClickNotification = async (notif: any) => {
    if (!notif.is_read) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setIsNotifOpen(false);
    if (notif.link) router.push(notif.link);
  };

  const isShopPage = pathname === '/cattery' || pathname === '/petshop';
  const isCatteryPage = pathname === '/cattery';
  const wrapperSize = isCatteryPage ? 'w-40 h-16 md:w-52 md:h-20' : isShopPage ? 'w-20 h-20 md:w-24 md:h-24' : 'w-24 h-24 md:w-32 md:h-32';
  const spinRingSize = isShopPage ? 'w-16 h-16 md:w-20 md:h-20' : 'w-20 h-20 md:w-28 md:h-28';
  const logoSize = isCatteryPage ? 'w-40 h-16 md:w-52 md:h-20' : isShopPage ? 'w-14 h-14 md:w-18 md:h-18' : 'w-16 h-16 md:w-24 md:h-24';


  const safeAvatarUrl = (avatarUrl && avatarUrl.trim() !== '') ? avatarUrl : 'https://ui-avatars.com/api/?name=Sen&background=fce7f3&color=db2777';

  return (
    <>
      <header className={`fixed top-0 w-full z-40 backdrop-blur-md border-b transition-colors duration-300 ${isCatteryPage ? 'bg-black border-stone-800' : 'bg-white/70 border-pink-50'}`}>

        <style dangerouslySetInnerHTML={{
          __html: `
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

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`lg:hidden z-20 w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isCatteryPage ? 'text-white hover:bg-white/10' : 'text-pink-500 hover:bg-pink-50'}`}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          <nav className={`hidden lg:flex lg:gap-3 xl:gap-8 font-medium text-sm xl:text-base w-1/3 whitespace-nowrap transition-colors duration-300 ${isCatteryPage ? 'text-white' : 'text-stone-600'}`}>
            <Link href="/" className={`pb-1 transition-colors ${pathname === '/' ? 'text-pink-500 font-bold border-b-2 border-pink-500 cursor-default' : 'hover:text-pink-400'}`}>Trang Chủ</Link>
            <Link href="/cattery" className={`pb-1 transition-colors ${pathname === '/cattery' ? 'text-pink-500 font-bold border-b-2 border-pink-500 cursor-default' : 'hover:text-pink-400'}`}>KinVie Cattery</Link>
            <Link href="/petshop" className={`pb-1 transition-colors ${pathname === '/petshop' ? 'text-pink-500 font-bold border-b-2 border-pink-500 cursor-default' : 'hover:text-pink-400'}`}>Beam Petshop</Link>
            <Link href="/memorial" className={`pb-1 transition-colors ${pathname === '/memorial' ? 'text-pink-500 font-bold border-b-2 border-pink-500 cursor-default' : 'hover:text-pink-400'}`}>Cây Ký Ức</Link>
          </nav>

          <Link href="/" className={`absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center top-1/2 -translate-y-1/2 z-10 ${isCatteryPage ? '' : 'mt-2'}`}>
            <div className={`relative flex items-center justify-center transition-all duration-300 ${wrapperSize}`}>
              {!isCatteryPage && (
                <div className={`absolute border-2 border-pink-200 border-dashed rounded-full animate-[spin_8s_linear_infinite] z-20 transition-all duration-300 ${spinRingSize}`}>
                  <div className="absolute -top-4 md:-top-5 left-1/2 -translate-x-1/2 w-8 h-8 md:w-10 md:h-10 text-pink-400 drop-shadow-sm">
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-current stroke-current overflow-visible">
                      <g className="cat-body-group">
                        <path className="cat-tail" d="M25,45 Q10,25 15,10" fill="none" strokeWidth="5" strokeLinecap="round" />
                        <line className="cat-leg-b" x1="35" y1="50" x2="25" y2="75" strokeWidth="6" strokeLinecap="round" />
                        <line className="cat-leg-b" x1="45" y1="50" x2="35" y2="75" strokeWidth="6" strokeLinecap="round" style={{ animationDelay: '0.1s', opacity: 0.6 }} />
                        <line className="cat-leg-f" x1="65" y1="50" x2="70" y2="75" strokeWidth="6" strokeLinecap="round" />
                        <line className="cat-leg-f" x1="55" y1="50" x2="60" y2="75" strokeWidth="6" strokeLinecap="round" style={{ animationDelay: '0.1s', opacity: 0.6 }} />
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
              )}
              <div className={`absolute overflow-hidden z-10 transition-all duration-300 ${logoSize} ${isCatteryPage ? '' : 'rounded-full shadow-md border-2 border-white bg-white'}`}>
                {pathname === '/cattery' ? (
                  <EvilEye
                    cycleColors={true}
                    cycleIntervalMs={20 * 1000}
                    intensity={1.5}
                    pupilSize={0.95}
                    irisWidth={0.25}
                    glowIntensity={0.35}
                    scale={1.3}
                    noiseScale={1}
                    pupilFollow={1}
                    flameSpeed={1.1}
                    backgroundColor="#000000"
                  />
                ) : (
                  <Image src="/images/logo.jpg" alt="KinVie Logo" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" priority />
                )}
              </div>
            </div>
            {isShopPage && !isCatteryPage && (
              <span className="font-serif italic font-bold text-[10px] md:text-sm text-pink-500 md:-mt-1 whitespace-nowrap bg-white/50 px-2 rounded-full">
                Beam Petshop
              </span>
            )}
          </Link>

          <nav className={`flex gap-1.5 sm:gap-3 lg:gap-2 xl:gap-6 font-medium items-center justify-end w-auto lg:w-1/3 z-20 shrink-0 text-sm xl:text-base transition-colors duration-300 ${isCatteryPage ? 'text-white' : 'text-stone-600'}`}>
            <Link href="/blog" className={`hidden lg:block pb-1 transition-colors whitespace-nowrap ${pathname === '/blog' ? 'text-pink-500 font-bold border-b-2 border-pink-500 cursor-default mr-2' : 'hover:text-pink-400 mr-2'}`}>Blog</Link>
            <Link href="/feed" className={`hidden lg:block pb-1 transition-colors whitespace-nowrap ${pathname === '/feed' ? 'text-pink-500 font-bold border-b-2 border-pink-500 cursor-default' : 'hover:text-pink-400'}`}>Cộng đồng</Link>

            {isLoggedIn && isAdmin && !isLoadingAuth && (
              <Link href="/dashboard" className="hidden lg:flex items-center gap-1.5 text-sm font-bold text-rose-500 hover:text-white hover:bg-rose-500 bg-rose-50 px-3 py-1.5 rounded-full transition-colors border border-rose-100">
                <span>⚙️</span> Quản lý
              </Link>
            )}

            {isLoggedIn && !isLoadingAuth && (
              <div className="relative">
                <button onClick={() => setIsNotifOpen(p => !p)} className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${isCatteryPage ? 'hover:bg-white/10' : 'hover:bg-stone-50'}`}>
                  <span className="text-xl md:text-2xl">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] md:text-[10px] font-black px-1.5 min-w-[18px] md:min-w-[20px] h-4 md:h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsNotifOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-[85vw] max-w-80 max-h-[28rem] overflow-y-auto bg-white rounded-[1.5rem] shadow-2xl border border-stone-100 z-40 custom-scrollbar">
                      <div className="p-4 border-b border-stone-100 font-black text-stone-700 text-sm sticky top-0 bg-white rounded-t-[1.5rem]">Thông báo</div>
                      {notifications.length === 0 ? (
                        <p className="p-6 text-center text-xs text-stone-400 font-bold">Chưa có thông báo nào 🐾</p>
                      ) : notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => handleClickNotification(notif)}
                          className={`w-full text-left px-4 py-3 border-b border-stone-50 hover:bg-pink-50/50 transition-colors flex gap-3 items-start ${!notif.is_read ? 'bg-pink-50/30' : ''}`}
                        >
                          <span className="text-lg shrink-0 mt-0.5">
                            {notif.type === 'order_success' ? '📦' : notif.type === 'order_approved' ? '🚚' : notif.type === 'cat_inquiry' ? '💌' : notif.type === 'memorial_approved' ? '🌿' : notif.type === 'memorial_rejected' ? '😿' : notif.type === 'post_like' ? '❤️' : (notif.type === 'post_comment' || notif.type === 'comment_reply') ? '💬' : '🔔'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-stone-800 line-clamp-1">{notif.title}</p>
                            <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">{notif.content}</p>
                            <p className="text-[9px] text-stone-300 font-bold mt-1">{new Date(notif.created_at).toLocaleString('vi-VN')}</p>
                          </div>
                          {!notif.is_read && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5"></span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {isLoggedIn && !isAdmin && !isLoadingAuth && (
              <Link href="/cart" className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-stone-50 transition-colors">
                <span className="text-xl md:text-2xl">🛒</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] md:text-[10px] font-black px-1.5 min-w-[18px] md:min-w-[20px] h-4 md:h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {isLoadingAuth ? (
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-stone-200 animate-pulse border-2 border-white shadow-sm"></div>
            ) : isLoggedIn ? (
              <Link href="/profile" className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-pink-100 flex items-center justify-center bg-stone-100 hover:border-pink-300 transition-all shadow-sm">
                <img
                  src={safeAvatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Sen&background=fce7f3&color=db2777';
                  }}
                />
              </Link>
            ) : (
              <Link href="/login" className="text-xs md:text-sm font-bold text-pink-500 hover:text-pink-600 transition-colors">
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* OVERLAY MENU ĐIỆN THOẠI */}
      <div className={`lg:hidden fixed inset-0 z-[100] transition-all duration-400 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}></div>

        <div className={`absolute top-0 left-0 w-[85%] max-w-[360px] h-[100dvh] bg-white shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col rounded-r-[2rem] ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>

          <div className="flex items-center justify-between p-6 border-b border-pink-50 bg-pink-50/20">
            <div className="flex flex-col">
              <span className="font-serif italic font-black text-2xl text-pink-500">KinVie</span>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Cattery & Petshop</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white text-pink-500 rounded-full shadow-sm border border-pink-100 transition-transform active:scale-90">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex flex-col p-6 gap-3 overflow-y-auto flex-grow bg-gradient-to-b from-white to-pink-50/20">
            {[
              { name: 'Trang Chủ', href: '/', icon: '🏠' },
              { name: 'KinVie Cattery', href: '/cattery', icon: '🐱' },
              { name: 'Beam Petshop', href: '/petshop', icon: '🏪' },
              { name: 'Cộng Đồng Sen', href: '/feed', icon: '🌟' },
              { name: 'Cây Ký Ức', href: '/memorial', icon: '🌿' },
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

            {isLoggedIn && isAdmin && !isLoadingAuth && (
              <Link href="/dashboard" className="flex items-center gap-4 p-4 rounded-2xl bg-stone-900 border-stone-900 text-white shadow-lg shadow-stone-300 mt-2">
                <span className="text-2xl">⚙️</span>
                <span className="font-black text-[17px]">Quản lý hệ thống</span>
              </Link>
            )}
          </div>

          {/* AVATAR TRONG MENU MOBILE */}
          <div className="p-6 border-t border-pink-100 bg-white shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            {isLoadingAuth ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : isLoggedIn ? (
              <div className="flex items-center gap-4">
                <img
                  src={safeAvatarUrl}
                  className="w-12 h-12 rounded-full border-2 border-pink-200 object-cover shadow-sm"
                  alt="user"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Sen&background=fce7f3&color=db2777';
                  }}
                />
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