"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Lấy màu ngẫu nhiên cho Avatar nếu khách không có ảnh
const getAvatarColor = (name: string) => {
  const colors = ['bg-rose-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];
  const charCode = (name || 'A').charCodeAt(0);
  return colors[charCode % colors.length];
};

export default function CreateOrderPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  
  // State Giỏ hàng
  const [cart, setCart] = useState<any[]>([]);
  
  // 🎯 State cho Dropdown Khách hàng xịn xò
  const [customerSearch, setCustomerSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form Đơn hàng
  const [orderForm, setOrderForm] = useState({
    customer_name: '',
    customer_phone: '',
    address: '',
    delivery_date: ''
  });

  // 🎯 Thêm biến này để nhớ ID khách hàng đã chọn
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
    // Click ra ngoài để đóng Dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    // Kéo danh sách Sản phẩm
    const { data: prodData } = await supabase.from('products').select('*').gt('stock', 0);
    // Kéo danh sách User (Khách hàng)
    const { data: userData } = await supabase.from('users').select('*');
    
    setProducts(prodData || []);
    setCustomers(userData || []);
    setIsLoading(false);
  };

  // 🎯 LOGIC TÌM KIẾM KHÁCH HÀNG THÔNG MINH
  const filteredCustomers = customers.filter(c => {
    const searchLower = customerSearch.toLowerCase();
    const name = (c.fullname || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    return name.includes(searchLower) || phone.includes(searchLower);
  });

  // Khi chọn khách từ Dropdown -> Tự fill data
  const handleSelectCustomer = (customer: any) => {
    setSelectedUserId(customer.userid);
    setCustomerSearch(customer.fullname || customer.phone || '');
    setOrderForm({
      ...orderForm,
      customer_name: customer.fullname || '',
      customer_phone: customer.phone || '',
      address: customer.address || ''
    });
    setIsDropdownOpen(false);
  };

  // Logic Giỏ hàng
  const addToCart = (product: any) => {
    const existing = cart.find(item => item.productid === product.id);
    if (existing) {
      setCart(cart.map(item => item.productid === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { productid: product.id, name: product.name, price: product.price, quantity: 1, image: product.images?.[0] }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.productid === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.productid !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // 🎯 LƯU ĐƠN HÀNG
  const handleSaveOrder = async () => {
    if (cart.length === 0) return alert("Giỏ hàng đang trống sếp ơi!");
    if (!orderForm.customer_name || !orderForm.customer_phone) return alert("Phải nhập tên và SĐT khách hàng!");

    setIsSaving(true);
    const { error } = await supabase.from('orders').insert([{
      userid: selectedUserId,
      customer_name: orderForm.customer_name,
      customer_phone: orderForm.customer_phone,
      address: orderForm.address,
      delivery_date: orderForm.delivery_date || null,
      totalamount: totalAmount,
      orderstatus: 'Đã đặt hàng',
      items: cart
    }]);

    setIsSaving(false);
    if (!error) {
      alert("✅ Đã tạo đơn hàng thành công!");
      router.push('/dashboard/operations/orders');
    } else {
      alert("Lỗi khi tạo đơn: " + error.message);
    }
  };

  return (
    <div className="animate-fade-in min-h-screen bg-stone-50 pb-24 pt-10 px-6 relative selection:bg-blue-200">
      {/* BACKGROUND ĐẸP */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <Link href="/dashboard/operations/orders" className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl text-sm font-bold text-blue-600 shadow-sm border border-stone-100 hover:bg-blue-50 transition-all active:scale-95">
            ← Quay lại
          </Link>
          <h1 className="text-3xl font-black text-stone-800">Tạo Đơn Hàng 🛒</h1>
          <button 
            onClick={handleSaveOrder}
            disabled={isSaving || cart.length === 0}
            className="cursor-pointer bg-stone-900 hover:bg-black text-white font-black px-10 py-3.5 rounded-2xl shadow-lg transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
          >
            {isSaving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Lưu Đơn Hàng'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* BÊN TRÁI: DANH SÁCH SẢN PHẨM */}
          <div className="lg:col-span-7 bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-xl font-black text-stone-800 mb-6 flex items-center gap-3">
              <span className="text-2xl">🛍️</span> Chọn Sản Phẩm
            </h3>
            
            {isLoading ? (
              <div className="py-20 text-center text-stone-400 font-bold animate-pulse">Đang tải kệ hàng...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => addToCart(p)}
                    className="cursor-pointer bg-white border border-stone-100 rounded-[2rem] p-4 hover:border-blue-300 hover:shadow-md hover:-translate-y-1 transition-all group"
                  >
                    <div className="w-full aspect-square bg-stone-50 rounded-2xl mb-4 overflow-hidden flex items-center justify-center">
                      {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : '📦'}
                    </div>
                    <h4 className="font-bold text-stone-800 text-sm mb-1 line-clamp-1">{p.name}</h4>
                    <p className="font-black text-blue-600">{p.price.toLocaleString()}đ</p>
                    <p className="text-[10px] text-stone-400 font-bold mt-1">Tồn: {p.stock}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BÊN PHẢI: GIỎ HÀNG & KHÁCH HÀNG */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* GIỎ HÀNG */}
            <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-xl font-black text-stone-800 mb-6 border-b border-stone-100 pb-4">Giỏ hàng hiện tại</h3>
              
              {cart.length === 0 ? (
                <div className="py-10 text-center text-stone-400 font-bold bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">Chưa chọn món nào</div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item) => (
                    <div key={item.productid} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-stone-100 shadow-sm">
                      <div className="w-12 h-12 bg-stone-50 rounded-xl overflow-hidden shrink-0">
                        {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : ''}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-stone-800 text-sm truncate">{item.name}</p>
                        <p className="font-black text-blue-600 text-sm">{item.price.toLocaleString()}đ</p>
                      </div>
                      <div className="flex items-center gap-2 bg-stone-50 rounded-xl p-1">
                        <button onClick={() => updateQuantity(item.productid, -1)} className="cursor-pointer w-7 h-7 flex items-center justify-center bg-white rounded-lg font-bold shadow-sm text-stone-500 hover:text-rose-500">-</button>
                        <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productid, 1)} className="cursor-pointer w-7 h-7 flex items-center justify-center bg-white rounded-lg font-bold shadow-sm text-stone-500 hover:text-emerald-500">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.productid)} className="cursor-pointer text-stone-300 hover:text-rose-500 p-2">✕</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-stone-100 flex justify-between items-end">
                <span className="font-black text-stone-400 uppercase tracking-widest text-xs">Tổng tiền</span>
                <span className="font-black text-3xl text-blue-600">{totalAmount.toLocaleString()} <span className="text-lg">đ</span></span>
              </div>
            </div>

            {/* 🎯 FORM THÔNG TIN KHÁCH HÀNG CỰC XỊN */}
            <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              
              {/* DROPDOWN TÌM KHÁCH QUEN */}
              <div className="relative mb-6 z-50" ref={dropdownRef}>
                <label className="block text-[11px] font-black text-blue-500 uppercase tracking-widest mb-2">Tìm Khách Quen</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
                  <input 
                    type="text" 
                    placeholder="Gõ tên hoặc số điện thoại..."
                    value={customerSearch}
                    onChange={(e) => { setCustomerSearch(e.target.value); setIsDropdownOpen(true); }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="cursor-text w-full pl-11 pr-4 py-4 bg-blue-50/50 border-2 border-blue-100 rounded-2xl font-bold text-stone-800 outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                  />
                  {customerSearch && (
                    <button onClick={() => {setCustomerSearch(''); setIsDropdownOpen(false)}} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-rose-500 font-black cursor-pointer">✕</button>
                  )}
                </div>

                {/* MENU SỔ XUỐNG */}
                {isDropdownOpen && (
                  <div className="absolute top-full mt-2 left-0 w-full bg-white/90 backdrop-blur-2xl border border-stone-100 shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden max-h-64 overflow-y-auto animate-slide-down custom-scrollbar">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-4 text-center text-stone-400 font-bold text-sm">Không tìm thấy khách nào</div>
                    ) : (
                      filteredCustomers.map(c => (
                        <div 
                          key={c.userid}
                          onClick={() => handleSelectCustomer(c)}
                          className="cursor-pointer flex items-center gap-4 p-3 hover:bg-blue-50 border-b border-stone-50 last:border-0 transition-colors"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black shadow-inner shrink-0 ${getAvatarColor(c.fullname)}`}>
                            {c.avatarurl ? <img src={c.avatarurl} className="w-full h-full object-cover rounded-full" /> : (c.fullname || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-stone-800 text-sm">{c.fullname || 'Chưa cập nhật tên'}</p>
                            <p className="font-bold text-stone-400 text-xs">{c.phone || 'Chưa có SĐT'}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* CÁC Ô NHẬP LIỆU BÊN DƯỚI */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-1">Tên khách hàng *</label>
                  <input type="text" value={orderForm.customer_name} onChange={e => setOrderForm({...orderForm, customer_name: e.target.value})} className="cursor-text w-full bg-white border border-stone-200 rounded-2xl px-5 py-3.5 font-bold text-stone-800 outline-none focus:border-blue-400 shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-1">Số điện thoại *</label>
                  <input type="text" value={orderForm.customer_phone} onChange={e => setOrderForm({...orderForm, customer_phone: e.target.value})} className="cursor-text w-full bg-white border border-stone-200 rounded-2xl px-5 py-3.5 font-bold text-stone-800 outline-none focus:border-blue-400 shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-1">Địa chỉ giao hàng</label>
                  <input type="text" placeholder="Để trống nếu mua tại shop" value={orderForm.address} onChange={e => setOrderForm({...orderForm, address: e.target.value})} className="cursor-text w-full bg-white border border-stone-200 rounded-2xl px-5 py-3.5 font-bold text-stone-800 outline-none focus:border-blue-400 shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-orange-500 uppercase tracking-widest ml-1 mb-1">Ngày hẹn giao (Dành cho Pate)</label>
                  <input type="date" value={orderForm.delivery_date} onChange={e => setOrderForm({...orderForm, delivery_date: e.target.value})} className="cursor-pointer w-full bg-orange-50 border border-orange-100 text-orange-700 rounded-2xl px-5 py-3.5 font-bold outline-none focus:border-orange-400 shadow-sm" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .animate-slide-down { animation: slideDown 0.2s ease-out forwards; transform-origin: top; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: scaleY(0.95); } to { opacity: 1; transform: scaleY(1); } }
      `}} />
    </div>
  );
}