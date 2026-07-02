"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';

export default function CheckoutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('Chuyển khoản / QR Momo');

  useEffect(() => {
    fetchCartAndUser();
  }, [router]);

  const fetchCartAndUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: dbUser } = await supabase.from('users').select('*').eq('email', user.email).maybeSingle();
    
    if (dbUser) {
      setUserId(dbUser.userid);
      // Tự động điền thông tin sẵn nếu có
      setCustomerInfo({
        name: dbUser.fullname || '',
        phone: dbUser.phone || '',
        address: dbUser.address || ''
      });

      const { data: items } = await supabase
        .from('cart_items')
        .select(`id, quantity, product_id, variant, products ( id, name, price, imageurl, images, stock )`)
        .eq('user_id', dbUser.userid);

      if (items && items.length > 0) {
        setCartItems(items);
      } else {
        router.push('/cart'); // Giỏ trống thì đá về lại trang giỏ hàng
      }
    }
    setIsLoading(false);
  };

  const subTotal = cartItems.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0);

  // 🎯 LOGIC CHỐT ĐƠN (TRANSACTION BỌC THÉP)
  const handlePlaceOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert("Sen vui lòng điền đầy đủ thông tin giao hàng nhé!");
      return;
    }
    setIsSubmitting(true);

    try {
      // 1. Tạo đơn hàng vào bảng orders
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          userid: userId,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          address: customerInfo.address,
          totalamount: subTotal,
          paymentmethod: paymentMethod,
          orderstatus: 'Chờ thanh toán',
          items: cartItems.map(item => ({
            productid: item.product_id,
            name: item.products?.name || '',
            price: item.products?.price || 0,
            quantity: item.quantity,
            image: item.products?.imageurl || item.products?.images?.[0] || ''
          }))
        }])
        .select('orderid')
        .maybeSingle();

      if (orderError || !orderData) throw orderError;
      const newOrderId = orderData.orderid;

      // 2. Chuyển giỏ hàng sang orderdetails
      const orderDetails = cartItems.map(item => ({
        orderid: newOrderId,
        productid: item.product_id,
        variant: item.variant,
        quantity: item.quantity,
        unitprice: item.products.price
      }));

      const { error: detailsError } = await supabase.from('orderdetails').insert(orderDetails);
      if (detailsError) throw detailsError;

      // 3. Trừ Stock trong bảng products
      for (const item of cartItems) {
        const newStock = Math.max(0, item.products.stock - item.quantity);
        await supabase.from('products').update({ stock: newStock }).eq('id', item.product_id);
      }

      // 4. Dọn sạch giỏ hàng của user này
      await supabase.from('cart_items').delete().eq('user_id', userId);
      window.dispatchEvent(new Event('update_cart')); // Báo Header reset số đếm

      // 5. Thành công -> Đẩy sang trang báo thành công
      router.push(`/checkout/success?orderid=${newOrderId}`);

    } catch (error: any) {
      alert("Có lỗi xảy ra khi tạo đơn: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center text-4xl text-pink-300 animate-spin">🐾</div>;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-700 font-sans">
      <Header />
      <main className="pt-32 pb-20 container mx-auto px-4 max-w-6xl relative z-10">
        <h1 className="text-3xl font-serif font-black text-stone-800 mb-8 flex items-center gap-3">
          <span>📦</span> Tiến hành thanh toán
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* CỘT TRÁI: FORM THÔNG TIN */}
          <div className="lg:w-2/3 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 p-8">
              <h2 className="text-xl font-bold text-stone-800 mb-6">Thông tin nhận hàng</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">Họ và Tên người nhận</label>
                  <input type="text" value={customerInfo.name} onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 font-bold text-stone-800 outline-none focus:border-pink-400 transition-all" placeholder="Tên của Sen..." />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">Số điện thoại</label>
                  <input type="tel" value={customerInfo.phone} onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 font-bold text-stone-800 outline-none focus:border-pink-400 transition-all" placeholder="Để Shipper gọi..." />
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">Địa chỉ giao hàng</label>
                  <textarea value={customerInfo.address} onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})} rows={3} className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 font-bold text-stone-800 outline-none focus:border-pink-400 transition-all resize-none" placeholder="VD: Gần Aeon Mall Lê Chân, Hải Phòng..." />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 p-8">
              <h2 className="text-xl font-bold text-stone-800 mb-6">Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'Chuyển khoản / QR Momo' ? 'border-pink-500 bg-pink-50' : 'border-stone-100 hover:border-stone-300'}`}>
                  <input type="radio" name="payment" value="Chuyển khoản / QR Momo" checked={paymentMethod === 'Chuyển khoản / QR Momo'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-pink-500" />
                  <span className="font-bold text-stone-700">Chuyển khoản / Mã QR Momo (Khuyên dùng)</span>
                </label>
                <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-pink-500 bg-pink-50' : 'border-stone-100 hover:border-stone-300'}`}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 accent-pink-500" />
                  <span className="font-bold text-stone-700">Thanh toán khi nhận hàng (COD)</span>
                </label>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: BILL & ĐẶT HÀNG */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 p-8 sticky top-24">
              <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2"><span>🧾</span> Tóm tắt đơn hàng</h3>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-stone-50 rounded-xl overflow-hidden shrink-0 border border-stone-100">
                        <img src={item.products?.imageurl || item.products?.images?.[0]} alt="product" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-700 line-clamp-2">{item.products?.name}</p>
                        <p className="text-[10px] font-black text-stone-400 uppercase mt-0.5">SL: {item.quantity} {item.variant !== 'Mặc định' && `| ${item.variant}`}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-100 pt-6 space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm font-medium text-stone-500">
                  <span>Tạm tính</span>
                  <span>{subTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium text-stone-500">
                  <span>Phí vận chuyển</span>
                  <span className="text-emerald-500 font-bold uppercase text-xs">Miễn phí</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-stone-800 font-bold uppercase text-xs">Tổng cộng</span>
                <span className="text-3xl font-black text-rose-500">{subTotal.toLocaleString('vi-VN')}đ</span>
              </div>

              <button onClick={handlePlaceOrder} disabled={isSubmitting} className="w-full bg-stone-900 hover:bg-pink-500 text-white font-black py-4 px-6 rounded-2xl shadow-xl hover:shadow-pink-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? 'ĐANG XỬ LÝ...' : 'ĐẶT HÀNG NGAY'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}