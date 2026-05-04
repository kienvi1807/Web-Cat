"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';

export default function CartPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);

  // 1. KÉO DỮ LIỆU GIỎ HÀNG
  const fetchCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: dbUser } = await supabase.from('users').select('userid').eq('email', user.email).maybeSingle();
    
    if (dbUser) {
      setUserId(dbUser.userid);
      // 🎯 ĐÃ FIX: Yêu cầu Supabase lấy cả cột 'images' nữa
      const { data: items, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          product_id,
          variant, 
          products ( id, name, price, imageurl, images )
        `)
        .eq('user_id', dbUser.userid)
        .order('created_at', { ascending: false });

      if (!error && items) {
        setCartItems(items);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, [router]);

  // 2. HÀM ĐỔI SỐ LƯỢNG (+ / -)
  const updateQuantity = async (cartId: number, newQuantity: number) => {
    if (newQuantity < 1) return; 

    setCartItems(prev => prev.map(item => item.id === cartId ? { ...item, quantity: newQuantity } : item));
    await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', cartId);
  };

  // 3. HÀM XÓA KHỎI GIỎ
  const removeItem = async (cartId: number) => {
    if (window.confirm("Bỏ món này ra khỏi giỏ hàng Sen nhé?")) {
      setCartItems(prev => prev.filter(item => item.id !== cartId));
      await supabase.from('cart_items').delete().eq('id', cartId);
      // Bắn tín hiệu để Header cập nhật lại số lượng rổ hàng sau khi xóa
      window.dispatchEvent(new Event('update_cart'));
    }
  };

  // 4. TÍNH TỔNG TIỀN
  const subTotal = cartItems.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0);
  const shippingFee = subTotal > 0 ? 0 : 0; 
  const finalTotal = subTotal + shippingFee;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center font-sans">
        <div className="text-4xl text-pink-300 animate-[spin_2s_linear_infinite] mb-4">🐾</div>
        <p className="text-stone-400 font-medium text-sm animate-pulse">Đang kiểm tra giỏ hàng...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-700 font-sans">
      <Header />

      <main className="pt-32 pb-20 container mx-auto px-4 relative z-10 max-w-6xl">
        <div className="mb-8">
          <Link href="/petshop" className="text-stone-400 hover:text-pink-500 text-sm font-bold flex items-center gap-2 mb-6 inline-block transition-colors">
            <span>❮</span> Tiếp tục mua sắm
          </Link>
          <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2 flex items-center gap-3">
            <span>🛒</span> Giỏ hàng của bạn
          </h1>
          <p className="text-stone-500 text-sm">Kiểm tra lại đồ ăn, phụ kiện cho Boss trước khi chốt đơn nhé!</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 p-12 text-center py-20">
            <span className="text-7xl opacity-40 block mb-6">🛍️</span>
            <h2 className="text-xl font-bold text-stone-700 mb-2">Giỏ hàng đang trống</h2>
            <p className="text-stone-500 text-sm mb-8">Sen chưa chọn món đồ nào cho Boss cả.</p>
            <Link href="/petshop" className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3.5 px-8 rounded-xl shadow-md shadow-pink-200 transition-all inline-block">
                Đến Cửa Hàng Ngay
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            <div className="lg:w-2/3 space-y-4">
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden p-6 sm:p-8">
                <div className="hidden sm:flex text-xs font-bold text-stone-400 uppercase border-b border-stone-100 pb-4 mb-4">
                  <div className="w-1/2">Sản phẩm</div>
                  <div className="w-1/4 text-center">Số lượng</div>
                  <div className="w-1/4 text-right">Tạm tính</div>
                </div>

                <div className="space-y-6">
                  {cartItems.map((item) => {
                    // 🎯 ĐÃ FIX: Lọc ảnh chuẩn bài như ngoài trang chủ
                    const p = item.products;
                    const displayImg = p?.imageurl || (p?.images && p.images.length > 0 ? p.images[0] : 'https://placehold.co/400x400/ffedd5/ea580c?text=Beam+Petshop');

                    return (
                      <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pb-6 border-b border-stone-50 last:border-0 last:pb-0">
                        
                        <div className="w-full sm:w-1/2 flex items-center gap-4">
                          <div className="w-20 h-20 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-center overflow-hidden shrink-0">
                            <img 
                              src={displayImg} 
                              alt={p?.name || 'Sản phẩm'} 
                              className="w-full h-full object-cover" 
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/ffedd5/ea580c?text=Beam+Petshop'; }}
                            />
                          </div>
                          <div className="flex flex-col items-start">
                            <h3 className="font-bold text-stone-800 text-sm md:text-base leading-tight line-clamp-2 hover:text-pink-600 transition-colors cursor-pointer">
                              {p?.name || 'Sản phẩm không xác định'}
                            </h3>
                            
                            {item.variant && item.variant !== 'Mặc định' && (
                              <span className="mt-1.5 bg-orange-50 text-orange-500 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-orange-100 inline-block tracking-wider">
                                {item.variant}
                              </span>
                            )}

                            <p className="text-stone-400 font-medium text-xs mt-1.5">
                              {p?.price?.toLocaleString('vi-VN')}đ
                            </p>
                          </div>
                        </div>

                        <div className="w-full sm:w-1/4 flex justify-between sm:justify-center items-center">
                          <span className="sm:hidden text-xs font-bold text-stone-400 uppercase">Số lượng:</span>
                          <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl overflow-hidden p-1">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-white hover:text-pink-500 hover:shadow-sm rounded-lg transition-all font-bold">
                              -
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-stone-700">
                              {item.quantity}
                            </span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-white hover:text-pink-500 hover:shadow-sm rounded-lg transition-all font-bold">
                              +
                            </button>
                          </div>
                        </div>

                        <div className="w-full sm:w-1/4 flex justify-between sm:justify-end items-center">
                          <span className="sm:hidden text-xs font-bold text-stone-400 uppercase">Tạm tính:</span>
                          <div className="flex items-center gap-4">
                            <p className="font-black text-rose-500 text-sm md:text-base">
                              {((p?.price || 0) * item.quantity).toLocaleString('vi-VN')}đ
                            </p>
                            <button onClick={() => removeItem(item.id)} className="w-8 h-8 bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg flex items-center justify-center transition-colors tooltip" title="Xóa">
                              ✕
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:w-1/3">
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 p-8 sticky top-24">
                <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
                  <span>🧾</span> Tóm tắt đơn hàng
                </h3>
                
                <div className="space-y-4 text-sm mb-6 border-b border-stone-100 pb-6">
                  <div className="flex justify-between items-center text-stone-500 font-medium">
                    <span>Tổng tiền hàng ({cartItems.length} món)</span>
                    <span className="text-stone-800 font-bold">{subTotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between items-center text-stone-500 font-medium">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-500 font-bold uppercase text-xs tracking-wide">Miễn phí</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-8">
                  <span className="text-stone-800 font-bold uppercase text-xs">Thành tiền</span>
                  <span className="text-3xl font-black text-rose-500">{finalTotal.toLocaleString('vi-VN')}đ</span>
                </div>

                <button className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-6 rounded-xl shadow-md shadow-pink-200 transition-all flex items-center justify-center gap-2 text-lg">
                  Tiến hành thanh toán <span>→</span>
                </button>

                <p className="text-center text-[10px] text-stone-400 font-bold mt-4 flex items-center justify-center gap-1 uppercase tracking-widest">
                  <span>🔒</span> Thanh toán bảo mật & an toàn
                </p>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}