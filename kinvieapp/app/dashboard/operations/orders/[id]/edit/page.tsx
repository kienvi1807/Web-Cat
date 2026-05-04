"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Product = { id: string; name: string; price: number; stock: number; images: string[] };
type CartItem = { productid: string; name: string; price: number; quantity: number; image?: string };

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    if (orderId) {
      fetchOrderAndProducts();
    }
  }, [orderId]);

  const fetchOrderAndProducts = async () => {
    setIsLoading(true);
    
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('orderid', orderId)
      .maybeSingle();

    if (orderData) {
      setCustomerInfo({
        name: orderData.customer_name || '',
        phone: orderData.customer_phone || '',
        address: orderData.address || ''
      });
      setCart(orderData.items || []);
    }

    const { data: prodData } = await supabase.from('products').select('*').eq('status', 'Sẵn sàng');
    if (prodData) setProducts(prodData);

    setIsLoading(false);
  };

  // --- XỬ LÝ GIỎ HÀNG TRONG LÚC SỬA ---
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert("Sản phẩm này đã hết hàng!"); 
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.productid === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Chỉ còn ${product.stock} sản phẩm trong kho!`); 
          return prev;
        }
        return prev.map(item => item.productid === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productid: product.id, name: product.name, price: product.price, quantity: 1, image: product.images?.[0] }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.productid !== id));

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    
    const productInDb = products.find(p => p.id === id);
    if (productInDb && qty > productInDb.stock) {
      alert(`Trong kho hiện chỉ còn ${productInDb.stock} cái!`); 
      return;
    }
    
    setCart(prev => prev.map(item => item.productid === id ? { ...item, quantity: qty } : item));
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // --- LƯU THAY ĐỔI VÀO DATABASE ---
  const handleSaveChanges = async () => {
    if (!customerInfo.name || cart.length === 0) {
      alert("Tên khách và Giỏ hàng không được để trống!");
      return;
    }
    setIsSaving(true);

    // 1. Cập nhật thông tin chung vào orders (KHÔNG CÓ cột items)
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        address: customerInfo.address,
        totalamount: totalPrice
      })
      .eq('orderid', orderId);

    if (orderError) {
      alert("Lỗi khi lưu đơn hàng: " + orderError.message);
      setIsSaving(false);
      return;
    }

    // 2. Xóa các chi tiết cũ trong orderdetails
    await supabase.from('orderdetails').delete().eq('orderid', orderId);

    // 3. Insert các chi tiết mới vào orderdetails
    const itemsToInsert = cart.map(item => ({
      orderid: orderId,
      productid: item.productid,
      quantity: item.quantity,
      unitprice: item.price,
      // variant: item.variant // Nếu trong cart state của sếp có variant thì nhớ nhét vào đây
    }));

    const { error: detailError } = await supabase.from('orderdetails').insert(itemsToInsert);

    setIsSaving(false);
    if (!detailError) {
      alert("✅ Đã cập nhật đơn hàng thành công!");
      router.push('/dashboard/operations/orders');
    } else {
      alert("Lỗi cập nhật chi tiết: " + detailError.message);
    }
  };

  const filteredProducts = products.filter(p => (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-stone-500">Đang tải hồ sơ đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 pb-24 relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20 blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-emerald-400/10 to-teal-400/10 blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-[1600px] mx-auto px-6 pt-12 relative z-10 animate-fade-in">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <Link href="/dashboard/operations/orders" className="inline-flex items-center gap-2 text-stone-500 hover:text-amber-600 font-bold text-sm mb-4 transition-colors group">
              <span className="w-8 h-8 rounded-full bg-white border border-stone-200 shadow-sm flex items-center justify-center group-hover:border-amber-300 group-hover:bg-amber-50 transition-all">←</span>
              Trở về danh sách
            </Link>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-800 to-stone-500 tracking-tight flex items-center gap-4">
              Sửa Đơn Hàng ✏️
            </h1>
            <p className="text-sm font-bold text-stone-400 mt-2 bg-stone-200/50 inline-block px-3 py-1 rounded-lg">
              Mã đơn: <span className="text-amber-600">#{String(orderId).toUpperCase()}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI: THÊM SẢN PHẨM */}
          <div className="lg:col-span-6 bg-white/70 backdrop-blur-xl border border-stone-200/60 rounded-[2.5rem] shadow-sm p-8 flex flex-col h-[750px]">
            <h2 className="text-xl font-black text-stone-800 mb-6 flex items-center gap-2">
              <span className="p-2 bg-amber-100 text-amber-600 rounded-xl">📦</span> Thêm sản phẩm vào đơn
            </h2>

            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50">🔍</span>
              <input 
                type="text" 
                placeholder="Tìm sản phẩm để thêm..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-50/50 border border-stone-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-stone-700 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all"
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4 content-start">
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  onClick={() => product.stock > 0 ? addToCart(product) : alert("Hết hàng rồi sếp ơi, không thêm được đâu!")}
                  className={`bg-white border border-stone-100 rounded-3xl p-4 transition-all group flex flex-col h-fit ${product.stock > 0 ? 'cursor-pointer hover:border-amber-300 hover:shadow-lg hover:-translate-y-1' : 'cursor-not-allowed opacity-80'}`}
                >
                  <div className="aspect-square bg-stone-50 rounded-2xl mb-3 overflow-hidden flex items-center justify-center p-2 relative">
                     {product.stock <= 0 && <span className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center text-[10px] font-black text-rose-500 tracking-widest">HẾT HÀNG</span>}
                     <img src={product.images?.[0] || 'https://via.placeholder.com/150'} className="w-full h-full object-contain group-hover:scale-110 transition-transform mix-blend-multiply" />
                  </div>
                  
                  <h3 className="text-xs font-bold text-stone-700 line-clamp-2 mb-2">{product.name}</h3>
                  
                  <div className="flex justify-between items-end mt-auto">
                    <p className="font-black text-amber-600">{product.price?.toLocaleString()}đ</p>
                    <button className="w-6 h-6 rounded-full bg-stone-100 text-stone-400 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center font-bold transition-colors">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: CHI TIẾT & KHÁCH HÀNG */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            <div className="bg-white rounded-[2.5rem] border border-stone-200/60 shadow-sm p-8 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-stone-800">Giỏ hàng</h2>
                <div className="px-4 py-1.5 bg-stone-100 rounded-xl text-xs font-bold text-stone-500">{cart.length} sản phẩm</div>
              </div>
              
              <div className="overflow-y-auto max-h-[300px] pr-2 space-y-3 custom-scrollbar mb-6">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-stone-50/50 p-3 rounded-2xl border border-stone-100 group hover:bg-stone-50 transition-colors">
                    <div className="w-12 h-12 bg-white rounded-xl border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
                      {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <span className="text-stone-300">📦</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-stone-700 truncate">{item.name}</p>
                      <p className="font-black text-amber-600 mt-0.5">{item.price?.toLocaleString()}đ</p>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-white rounded-lg border border-stone-200 p-1 shadow-sm">
                      <button onClick={() => updateQuantity(item.productid, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-rose-500 font-black rounded-md hover:bg-rose-50 transition-colors">-</button>
                      <span className="text-xs font-black w-6 text-center text-stone-700">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productid, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-emerald-500 font-black rounded-md hover:bg-emerald-50 transition-colors">+</button>
                    </div>
                    
                    <button onClick={() => removeFromCart(item.productid)} className="w-8 h-8 flex items-center justify-center text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                ))}
                {cart.length === 0 && <p className="text-center text-stone-400 font-bold py-10">Giỏ hàng trống! Hãy thêm sản phẩm ở bên trái.</p>}
              </div>

              <div className="pt-5 border-t border-dashed border-stone-200 flex justify-between items-end mt-auto">
                <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Tổng tiền thanh toán</span>
                <span className="text-3xl font-black text-stone-800">{totalPrice.toLocaleString()}<span className="text-xl text-stone-400 ml-1">đ</span></span>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-stone-200/60 shadow-sm p-8 flex-1 flex flex-col">
              <h2 className="text-sm font-black text-stone-400 uppercase tracking-widest mb-5">Thông tin giao hàng</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-4 mb-1 block">Tên khách hàng</label>
                  <input type="text" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full bg-stone-50/50 border border-stone-200 rounded-2xl px-5 py-3.5 font-bold text-sm text-stone-800 outline-none focus:ring-4 focus:ring-blue-400/10 focus:border-blue-400 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-4 mb-1 block">Số điện thoại</label>
                  <input type="text" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full bg-stone-50/50 border border-stone-200 rounded-2xl px-5 py-3.5 font-bold text-sm text-stone-800 outline-none focus:ring-4 focus:ring-blue-400/10 focus:border-blue-400 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-4 mb-1 block">Địa chỉ giao hàng</label>
                  <input type="text" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} className="w-full bg-stone-50/50 border border-stone-200 rounded-2xl px-5 py-3.5 font-bold text-sm text-stone-800 outline-none focus:ring-4 focus:ring-blue-400/10 focus:border-blue-400 transition-all" />
                </div>
              </div>

              <button 
                onClick={handleSaveChanges} 
                disabled={isSaving}
                className="w-full mt-auto bg-stone-900 hover:bg-black text-white font-black text-lg py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-70 flex items-center justify-center gap-2 group"
              >
                {isSaving ? (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-stone-400 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                    Lưu Thay Đổi Đơn Hàng
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e7e5e4; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d6d3d1; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}