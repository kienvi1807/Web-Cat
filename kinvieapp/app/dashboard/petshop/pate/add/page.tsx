"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; 

export default function AddPatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTypes, setIsFetchingTypes] = useState(true);
  
  // 🎯 Lưu danh sách các Loại Pate từ Database
  const [pateTypes, setPateTypes] = useState<any[]>([]);

  const [productData, setProductData] = useState<any>({
    name: '', 
    category: 'Pate tươi (Thủ công)', // Fix cứng
    price: '', 
    stock: '',
    status: 'Sẵn sàng', 
    expiry_date: '', 
    images: [''], 
    description: ''
  });

  // Nạp danh sách Pate Types khi mở trang
  useEffect(() => {
    const loadTypes = async () => {
      const { data } = await supabase.from('pate_types').select('*').order('name');
      setPateTypes(data || []);
      setIsFetchingTypes(false);
    };
    loadTypes();
  }, []);

  // 🎯 Khi sếp chọn 1 loại Pate từ sổ xuống -> Tự động điền data
  const handleSelectPateType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setProductData({ ...productData, name: '', price: '', images: [''], description: '' });
      return;
    }

    const selectedType = pateTypes.find(pt => pt.id === selectedId);
    if (selectedType) {
      // 🎯 BÍ THUẬT: Ghép thẳng Icon vào Tên Pate để nó lưu vào DB
      const finalName = selectedType.icons ? `${selectedType.name} ${selectedType.icons}` : selectedType.name;
      
      setProductData({
        ...productData,
        name: finalName, // Lấy tên đã có gắn Icon
        price: selectedType.default_price,
        description: selectedType.description || '',
        images: selectedType.image_url ? [selectedType.image_url] : ['']
      });
    }
  };

  const handleSaveProduct = async () => {
    if (!productData.name || !productData.price || !productData.expiry_date) {
      return alert("Vui lòng chọn loại Pate, nhập Giá và Hạn sử dụng!");
    }
    
    setIsLoading(true);
    const { error } = await supabase.from('products').insert([{
      name: productData.name,
      category: productData.category,
      price: Number(productData.price),
      stock: Number(productData.stock || 0),
      status: productData.status,
      expiry_date: productData.expiry_date,
      images: productData.images,
      description: productData.description
    }]);
    setIsLoading(false);

    if (!error) {
      alert("✅ Nấu mẻ Pate mới thành công!");
      router.push('/dashboard/petshop/pate');
    } else {
      alert("Lỗi lưu DB: " + error.message);
    }
  };

  return (
    <div className="animate-fade-in min-h-screen bg-[#F8F9FA] pb-24 px-6 pt-12 relative selection:bg-emerald-200">
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-400/20 blur-[150px] pointer-events-none z-0"></div>

      <div className="max-w-[800px] mx-auto relative z-10">
        <div className="flex justify-between items-center mb-10">
          <Link href="/dashboard/petshop/pate" className="cursor-pointer font-bold text-emerald-600 bg-white px-5 py-2.5 rounded-full shadow-sm hover:bg-emerald-50 transition-all">
            ← Quay lại
          </Link>
          <h1 className="text-3xl font-black text-stone-800">Nấu Mẻ Pate Mới 🍲</h1>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <div className="space-y-6">
            
            {/* 🎯 SỔ XUỐNG CHỌN LOẠI PATE (Thay thế ô nhập Text cũ) */}
            <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
              <label className="block text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-3">Chọn công thức Pate</label>
              
              {isFetchingTypes ? (
                <div className="w-full h-14 bg-emerald-100/50 animate-pulse rounded-2xl"></div>
              ) : (
                <select 
                  onChange={handleSelectPateType}
                  className="cursor-pointer w-full bg-white border-2 border-emerald-200 rounded-2xl px-5 py-4 font-black text-lg text-emerald-800 outline-none focus:border-emerald-500 shadow-sm appearance-none"
                >
                  <option value="">-- Bấm để chọn loại Pate --</option>
                  {pateTypes.map(pt => (
                    <option key={pt.id} value={pt.id}>{pt.name}</option>
                  ))}
                </select>
              )}
              
              {/* Hiển thị ảnh Review nếu có */}
              {productData.images[0] && (
                <div className="mt-4 flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-stone-100 w-fit">
                  <img src={productData.images[0]} className="w-12 h-12 rounded-lg object-cover" />
                  <span className="text-xs font-bold text-emerald-600">Đã nạp sẵn ảnh & giá!</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-black text-stone-400 uppercase tracking-widest mb-2">Giá bán (VNĐ)</label>
                <input type="number" value={productData.price} onChange={(e) => setProductData({...productData, price: e.target.value})} className="cursor-text w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 font-black text-emerald-600 outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="block text-[11px] font-black text-stone-400 uppercase tracking-widest mb-2">Số lượng nấu (Hộp)</label>
                <input type="number" value={productData.stock} onChange={(e) => setProductData({...productData, stock: e.target.value})} className="cursor-text w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 font-bold text-stone-800 outline-none focus:border-emerald-400" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-rose-500 uppercase tracking-widest mb-2">Hạn sử dụng (Bắt buộc)</label>
              <input type="date" value={productData.expiry_date} onChange={(e) => setProductData({...productData, expiry_date: e.target.value})} className="cursor-pointer w-full bg-rose-50 border border-rose-100 rounded-2xl px-5 py-4 font-bold text-rose-600 outline-none focus:border-rose-400" />
              <p className="text-[10px] text-rose-400 mt-2 italic">* Pate tươi thường chỉ nên để 3-5 ngày trong ngăn mát.</p>
            </div>

            <div>
              <label className="block text-[11px] font-black text-stone-400 uppercase tracking-widest mb-2">Ghi chú nguyên liệu</label>
              <textarea rows={3} value={productData.description} onChange={(e) => setProductData({...productData, description: e.target.value})} className="cursor-text w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 font-medium text-stone-600 outline-none focus:border-emerald-400" />
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-stone-100 flex justify-end">
            <button onClick={handleSaveProduct} disabled={isLoading} className="cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_40px_rgba(16,185,129,0.4)] hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50">
              {isLoading ? 'Đang đưa vào kho...' : 'Nấu & Nhập Kho'}
            </button>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}} />
    </div>
  );
}