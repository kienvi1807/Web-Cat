"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Product = { id: string; name: string; price: number; stock: number; category: string; images: string[] };
type CartItem = Product & { quantity: number };
type User = { id: string; name: string; phone: string; address: string }; // Thêm type User

export default function AddOrderPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [existingUsers, setExistingUsers] = useState<User[]>([]); // Data khách cũ
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const [cart, setCart] = useState<CartItem[]>([]);
  
  // 🎯 Thêm State phân loại khách hàng
  const [customerType, setCustomerType] = useState<'new' | 'existing'>('new');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
  });

  // Fetch dữ liệu (Sản phẩm + Khách hàng cũ)
  useEffect(() => {
    const fetchData = async () => {
      // Lấy sản phẩm
      const { data: prodData } = await supabase.from('products').select('*').eq('status', 'Sẵn sàng');
      if (prodData) setProducts(prodData);

      // Lấy danh sách khách hàng cũ từ bảng users
      // Lưu ý: Tùy database của sếp cột tên là name, display_name hay full_name thì sửa lại cho khớp nhé
      const { data: userData } = await supabase.from('users').select('*');
      if (userData) setExistingUsers(userData);
    };
    fetchData();
  }, []);

  // Xử lý khi chọn Khách Quen
  const handleSelectExistingUser = (userId: string) => {
    setSelectedUserId(userId);
    const user = existingUsers.find(u => (u.id || (u as any).userid) == userId);
    if (user) {
      // Auto fill thông tin
      setCustomerInfo({
        name: user.name || (user as any).full_name || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert("Sản phẩm này đã hết hàng!"); return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Chỉ còn ${product.stock} sản phẩm trong kho!`); return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    const productInDb = products.find(p => p.id === id);
    if (productInDb && qty > productInDb.stock) {
      alert(`Chỉ còn ${productInDb.stock} cái!`); return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // 🎯 LOGIC TẠO ĐƠN VÀ TẠO USER MỚI
  const handleCreateOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      alert("Sếp điền thiếu Tên hoặc Số điện thoại khách rồi!"); return;
    }
    if (cart.length === 0) {
      alert("Giỏ hàng đang trống!"); return;
    }

    setIsLoading(true);
    let finalUserId = selectedUserId;

    // 1. Nếu là KHÁCH MỚI -> Bắn data vào bảng users trước
    if (customerType === 'new') {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([{
          name: customerInfo.name, // Sửa thành full_name nếu DB của sếp đang dùng tên đó
          phone: customerInfo.phone,
          address: customerInfo.address,
          // Đánh dấu đây là user do admin tự tạo, chưa có mật khẩu
          status: 'guest_account' 
        }])
        .select()
        .single();

      if (userError) {
        alert("Lỗi khi tạo hồ sơ khách hàng mới: " + userError.message);
        setIsLoading(false);
        return;
      }
      finalUserId = newUser.id || newUser.userid; // Lấy ID vừa tạo
    }

    // 2. Format mảng items và TẠO ĐƠN HÀNG
    const itemsToSave = cart.map(item => ({
      productid: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    const { error: orderError } = await supabase.from('orders').insert([{
      userid: finalUserId, // Gắn ID khách hàng vào đơn
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      address: customerInfo.address,
      totalamount: totalPrice,
      orderstatus: 'Đã đặt hàng',
      paymentmethod: 'COD',
      items: itemsToSave
    }]);

    setIsLoading(false);

    if (!orderError) {
      alert("🎉 Lên đơn & Lưu hồ sơ khách thành công!");
      router.push('/dashboard/operations/orders');
    } else {
      alert("Lỗi tạo đơn: " + orderError.message);
    }
  };

  const filteredAndSortedProducts = products
    .filter(product => (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      return 0; 
    });

  return (
    <div className="animate-fade-in max-w-[1600px] mx-auto pb-24 px-4 pt-6 relative">
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>

      <div className="flex items-center gap-6 mb-10">
        <Link href="/dashboard/operations/orders" className="p-3 bg-white rounded-2xl shadow-sm border border-stone-100 hover:bg-blue-50 text-blue-600 transition-all font-bold">← Quay lại</Link>
        <div>
          <h1 className="text-3xl font-black text-stone-800">Tạo Đơn Hàng ✍️</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* CỘT TRÁI: SẢN PHẨM (Giữ nguyên như cũ) */}
        <div className="lg:col-span-7 bg-white/70 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-sm p-8">
           {/* ... Giao diện List Sản phẩm ... */}
           <h2 className="text-xl font-black text-stone-800 mb-6 flex items-center gap-2">🛒 Chọn Sản Phẩm</h2>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">🔍</span>
              <input type="text" placeholder="Tìm tên sản phẩm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-stone-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20" />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-stone-700 outline-none focus:border-blue-400">
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredAndSortedProducts.map(product => (
              <div key={product.id} onClick={() => product.stock > 0 ? addToCart(product) : null} className={`bg-stone-50 border border-stone-100 rounded-2xl p-4 transition-all group flex flex-col h-full relative overflow-hidden ${product.stock > 0 ? 'cursor-pointer hover:border-blue-400 hover:shadow-md' : 'cursor-not-allowed opacity-80'}`}>
                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-none">
                     <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md transform -rotate-12">Hết Hàng</span>
                  </div>
                )}
                <div className="aspect-square bg-white rounded-xl mb-3 overflow-hidden flex items-center justify-center p-2">
                   <img src={product.images?.[0] || 'https://via.placeholder.com/150'} className="w-full h-full object-contain group-hover:scale-110 transition-transform mix-blend-multiply" />
                </div>
                <h3 className="text-xs font-bold text-stone-700 line-clamp-2 mb-2 flex-1">{product.name}</h3>
                <p className="font-black text-blue-600">{product.price?.toLocaleString()}đ</p>
                <p className={`text-[10px] mt-1 font-bold ${product.stock > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>Tồn: {product.stock}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CỘT PHẢI: GIỎ HÀNG & THÔNG TIN KHÁCH */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* GIỎ HÀNG */}
          <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm p-8 flex-1 flex flex-col">
            <h2 className="text-xl font-black text-stone-800 mb-6">Giỏ hàng hiện tại</h2>
            <div className="flex-1 overflow-y-auto max-h-[250px] pr-2 space-y-4 custom-scrollbar mb-6">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 items-center bg-stone-50 p-3 rounded-2xl border border-stone-100">
                  <img src={item.images?.[0]} className="w-12 h-12 rounded-xl object-cover bg-white" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-stone-700 line-clamp-1">{item.name}</p>
                    <p className="font-black text-blue-600 mt-1">{item.price?.toLocaleString()}đ</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-lg border border-stone-200 px-2 py-1">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-stone-400 font-bold">-</button>
                    <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-stone-400 font-bold">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-stone-300 hover:text-rose-500 px-2">✕</button>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-dashed border-stone-200 flex justify-between items-end mt-auto">
              <span className="text-sm font-black text-stone-400 uppercase tracking-widest">Tổng tiền</span>
              <span className="text-3xl font-black text-blue-600">{totalPrice.toLocaleString()}<span className="text-xl ml-1">đ</span></span>
            </div>
          </div>

          {/* 🎯 GIAO DIỆN THÔNG TIN KHÁCH HÀNG MỚI */}
          <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm p-8">
            <h2 className="text-sm font-black text-stone-400 uppercase tracking-widest mb-4">Thông tin giao hàng</h2>
            
            {/* Tabs Chọn Loại Khách */}
            <div className="flex p-1 bg-stone-100 rounded-xl mb-6">
              <button 
                onClick={() => setCustomerType('new')}
                className={`flex-1 py-2.5 text-sm font-black rounded-lg transition-all ${customerType === 'new' ? 'bg-white text-blue-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
              >
                🌟 Khách Mới
              </button>
              <button 
                onClick={() => setCustomerType('existing')}
                className={`flex-1 py-2.5 text-sm font-black rounded-lg transition-all ${customerType === 'existing' ? 'bg-white text-blue-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
              >
                🤝 Khách Quen
              </button>
            </div>

            <div className="space-y-4">
              {customerType === 'existing' && (
                <div className="mb-2">
                  <select 
                    value={selectedUserId || ''} 
                    onChange={(e) => handleSelectExistingUser(e.target.value)}
                    className="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-5 py-4 font-bold text-sm text-blue-700 outline-none cursor-pointer"
                  >
                    <option value="" disabled>-- Tìm & Chọn khách quen --</option>
                    {existingUsers.map(user => (
                      <option key={user.id || (user as any).userid} value={user.id || (user as any).userid}>
                        {user.name || (user as any).full_name} - {user.phone}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <input type="text" placeholder="Tên khách hàng *" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full bg-stone-50 border-none rounded-xl px-5 py-4 font-bold text-sm text-stone-800 outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <input type="text" placeholder="Số điện thoại *" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full bg-stone-50 border-none rounded-xl px-5 py-4 font-bold text-sm text-stone-800 outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <input type="text" placeholder="Địa chỉ giao hàng (Để trống nếu mua tại Shop)" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} className="w-full bg-stone-50 border-none rounded-xl px-5 py-4 font-bold text-sm text-stone-800 outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>

            <button onClick={handleCreateOrder} disabled={isLoading || cart.length === 0} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg py-4 rounded-2xl shadow-lg transition-all disabled:opacity-50">
              {isLoading ? 'Đang tải...' : 'Chốt Đơn Ngay 🚀'}
            </button>
          </div>

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `... css ...`}} />
    </div>
  );
}