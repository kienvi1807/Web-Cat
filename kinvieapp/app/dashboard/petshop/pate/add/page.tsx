"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; 

export default function AddPatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [productData, setProductData] = useState<any>({
    name: '', 
    category: 'Pate tươi (Thủ công)', // Fix cứng luôn
    price: '', 
    stock: '',
    status: 'Sẵn sàng', 
    expiry_date: '', 
    images: [''], 
    description: ''
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    
    const fileName = `pate_${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('pet-images').upload(fileName, file);

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from('pet-images').getPublicUrl(fileName);
      setProductData({ ...productData, images: [publicUrlData.publicUrl] });
    } else {
      alert("Lỗi tải ảnh: " + uploadError.message);
    }
    setIsUploading(false);
  };

  const handleSave = async () => {
    if (!productData.name || !productData.price || !productData.expiry_date) {
      alert("Sếp điền thiếu Tên, Giá hoặc Hạn sử dụng rồi!"); return;
    }

    setIsLoading(true);
    const { error } = await supabase
      .from('products')
      .insert([{
        ...productData,
        price: parseInt(productData.price),
        stock: parseInt(productData.stock) || 0
      }]);

    setIsLoading(false);
    if (!error) {
      alert("Đã thêm mẻ Pate mới thành công! 🥫");
      router.push('/dashboard/petshop/pate');
    } else {
      alert("Lỗi: " + error.message);
    }
  };

  return (
    <div className="animate-fade-in max-w-[1000px] mx-auto pb-24 pt-10 px-4">
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <Link href="/dashboard/petshop/pate" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl text-sm font-bold text-emerald-600 shadow-sm border border-stone-100 cursor-pointer">
          ← Quay lại
        </Link>
        <h1 className="text-3xl font-black text-stone-800">Nấu Mẻ Pate Mới 👨‍🍳</h1>
        <button 
          onClick={handleSave}
          disabled={isLoading || isUploading}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-10 py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? 'Đang lưu...' : 'Hoàn tất'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* BÊN TRÁI: ẢNH MẺ PATE */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square bg-white rounded-[3rem] border-2 border-dashed border-stone-200 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all overflow-hidden relative"
        >
          {isUploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">⏳</div>}
          {productData.images[0] ? (
            <img src={productData.images[0]} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <span className="text-5xl mb-4 block">📸</span>
              <p className="font-bold text-stone-400">Chụp ảnh mẻ vừa nấu</p>
            </div>
          )}
        </div>

        {/* BÊN PHẢI: THÔNG SỐ */}
        <div className="bg-white rounded-[3rem] p-8 border border-stone-100 shadow-sm space-y-6">
          <div>
            <label className="block text-[11px] font-black text-stone-400 uppercase tracking-widest mb-2">Tên mẻ Pate</label>
            <input 
              type="text" placeholder="VD: Pate Gà Bí Đỏ - Mẻ Sáng 09/04" 
              value={productData.name} onChange={(e) => setProductData({...productData, name: e.target.value})}
              className="w-full bg-stone-50 border-none rounded-2xl px-5 py-4 font-bold text-stone-800 focus:ring-2 focus:ring-emerald-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-stone-400 uppercase tracking-widest mb-2">Giá bán (đ)</label>
              <input 
                type="number" value={productData.price} onChange={(e) => setProductData({...productData, price: e.target.value})}
                className="w-full bg-stone-50 border-none rounded-2xl px-5 py-4 font-bold text-stone-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-stone-400 uppercase tracking-widest mb-2">Số lượng hộp</label>
              <input 
                type="number" value={productData.stock} onChange={(e) => setProductData({...productData, stock: e.target.value})}
                className="w-full bg-stone-50 border-none rounded-2xl px-5 py-4 font-bold text-stone-800 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-rose-500 uppercase tracking-widest mb-2">Hạn sử dụng (Bắt buộc)</label>
            <input 
              type="date" value={productData.expiry_date} onChange={(e) => setProductData({...productData, expiry_date: e.target.value})}
              className="w-full bg-rose-50 border-none rounded-2xl px-5 py-4 font-bold text-rose-600 outline-none"
            />
            <p className="text-[10px] text-rose-400 mt-2 italic">* Pate tươi thường chỉ nên để 3-5 ngày trong ngăn mát.</p>
          </div>

          <div>
            <label className="block text-[11px] font-black text-stone-400 uppercase tracking-widest mb-2">Ghi chú nguyên liệu</label>
            <textarea 
              rows={3} value={productData.description} onChange={(e) => setProductData({...productData, description: e.target.value})}
              placeholder="VD: Gà ta, gan heo, bí đỏ, bổ sung thêm Taurine..."
              className="w-full bg-stone-50 border-none rounded-2xl px-5 py-4 font-bold text-stone-800 outline-none resize-none"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}