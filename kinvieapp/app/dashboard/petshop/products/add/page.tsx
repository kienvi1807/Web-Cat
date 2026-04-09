"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; 

const CATEGORIES = [
  'Thức ăn hạt', 
  'Pate đóng lon', 
  'Pate tươi (Thủ công)',
  'Cát vệ sinh', 
  'Phụ kiện (Bát, Dây, Túi)', 
  'Đồ chơi', 
  'Sữa tắm & Vệ sinh', 
  'Thuốc & Thực phẩm chức năng',
  'Khác'
];

export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null); 

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 
  
  const [productData, setProductData] = useState<any>({
    name: '', 
    category: 'Thức ăn hạt', 
    price: 0, 
    stock: 0,
    status: 'Sẵn sàng', 
    expiry_date: '', 
    images: ['', '', '', '', ''], 
    description: ''
  });

  const [mainImage, setMainImage] = useState<string>('');

  const handleImageClick = (index: number) => {
    setUploadingSlot(index);
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingSlot === null) return;
    setIsUploading(true);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `product_${Date.now()}.${fileExt}`;
    // Tận dụng bucket pet-images hoặc sếp có thể tạo bucket riêng cho products sau
    const { error: uploadError } = await supabase.storage.from('pet-images').upload(fileName, file);

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from('pet-images').getPublicUrl(fileName);
      const newUrl = publicUrlData.publicUrl;
      let newImages = [...productData.images];
      newImages[uploadingSlot] = newUrl;
      setProductData({ ...productData, images: newImages });
      if (uploadingSlot === 0) setMainImage(newUrl);
    } else {
      alert("Lỗi tải ảnh lên: " + uploadError.message);
    }
    setIsUploading(false);
    setUploadingSlot(null); 
    if (fileInputRef.current) fileInputRef.current.value = ''; 
  };

  const handleSaveProduct = async () => {
    if (!productData.name) {
      alert("Sếp quên nhập Tên sản phẩm rồi!"); return;
    }

    setIsLoading(true);
    const cleanImages = productData.images.filter((img: string) => img !== '');

    // Giả định sếp có bảng 'products' trong database
    const { error } = await supabase
      .from('products')
      .insert([{
        name: productData.name,
        category: productData.category,
        price: productData.price,
        stock: productData.stock,
        status: productData.status,
        expiry_date: productData.expiry_date || null,
        images: cleanImages,
        description: productData.description
      }]);

    setIsLoading(false);
    if (!error) {
      alert("Đã thêm sản phẩm mới lên kệ thành công! 🛍️");
      router.push('/dashboard/petshop/products');
    } else {
      alert("Có lỗi xảy ra khi lưu: " + error.message);
    }
  };

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto pb-24 relative">
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

      {/* KHỐI SÁNG NEON TÔNG HỒNG */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 backdrop-blur-md bg-white/40 p-6 rounded-[2rem] border border-white/60 shadow-sm sticky top-4 z-50">
        <div className="flex items-center gap-6 w-full md:w-auto">
          {/* NÚT BACK CHUẨN PILL BUTTON */}
          <Link href="/dashboard/petshop/products" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl text-sm font-bold text-pink-600 hover:bg-pink-50 hover:text-pink-500 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-stone-100 hover:-translate-y-0.5 cursor-pointer">
            <span className="text-lg leading-none">←</span> Quay lại Kho hàng
          </Link>
          <div>
            <p className="text-xs font-black text-pink-500 uppercase tracking-widest mb-1 animate-pulse">Beam Petshop</p>
            <h1 className="text-3xl font-black text-stone-800 flex items-center gap-3">
              Thêm Sản Phẩm 🧸
            </h1>
          </div>
        </div>

        <button 
          onClick={handleSaveProduct}
          disabled={isLoading || isUploading}
          className="cursor-pointer bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black px-12 py-4 rounded-xl shadow-[0_4px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_4px_30px_rgba(244,63,94,0.5)] transition-all transform hover:-translate-y-1 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang lưu...' : 'Lên Kệ Ngay 🚀'}
        </button>
      </div>

      {/* KHU VỰC CHÍNH */}
      <div className="flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* 📸 CỘT TRÁI: HÌNH ẢNH */}
        <div className="w-full lg:w-5/12 flex flex-col gap-4">
          <div onClick={() => handleImageClick(0)} className="cursor-pointer relative aspect-square bg-white rounded-[2.5rem] border border-stone-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden group p-4">
            {isUploading && uploadingSlot === 0 && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center text-pink-500 z-20">
                <span className="text-4xl animate-spin mb-2">⚙️</span><p className="font-bold text-stone-600">Đang tải ảnh lên...</p>
              </div>
            )}
            <img src={mainImage || 'https://via.placeholder.com/800?text=Chưa+Có+Ảnh'} alt="Main" className={`w-full h-full object-contain transition-transform duration-1000 ${mainImage ? 'group-hover:scale-105 mix-blend-multiply' : 'opacity-20'}`} />
            <div className="absolute inset-0 bg-stone-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
              <span className="bg-white text-pink-600 font-black px-6 py-3 rounded-full shadow-xl flex items-center gap-2">📸 {mainImage ? 'Đổi ảnh bìa' : 'Thêm ảnh bìa'}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((idx) => {
              const imgUrl = productData.images?.[idx];
              return (
                <div key={idx} onClick={() => handleImageClick(idx)} className="cursor-pointer relative aspect-square rounded-2xl bg-white overflow-hidden border-2 border-stone-100 shadow-sm hover:border-pink-300 transition-all duration-300 group p-2">
                  {isUploading && uploadingSlot === idx && (<div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center text-pink-500 z-20"><span className="animate-spin">⚙️</span></div>)}
                  {imgUrl ? (
                    <><img src={imgUrl} className="w-full h-full object-contain group-hover:opacity-50 mix-blend-multiply transition-all" alt={`Thumb ${idx}`} /><div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-stone-800 font-black text-xs z-10 transition-opacity drop-shadow-md">Đổi</div></>
                  ) : (
                    <div className="absolute inset-0 bg-stone-50 flex flex-col items-center justify-center text-stone-400 group-hover:bg-pink-50 group-hover:text-pink-500 transition-colors"><span className="text-2xl font-light mb-1">+</span></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 📝 CỘT PHẢI: FORM NHẬP LIỆU */}
        <div className="w-full lg:w-7/12">
          <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-8 lg:p-12 border border-white/80 shadow-[0_10px_50px_rgba(0,0,0,0.03)] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e11d48 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>

            <h2 className="text-2xl font-black text-stone-800 mb-8 flex items-center gap-3 relative z-10">
              Thông tin sản phẩm <span className="text-pink-500">❖</span>
            </h2>

            <div className="space-y-8 relative z-10">
              
              {/* TÊN SẢN PHẨM */}
              <div>
                <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Tên sản phẩm <span className="text-rose-500">*</span></label>
                <input 
                    type="text" placeholder="VD: Hạt Royal Canin Kitten 2kg..." 
                    value={productData.name} onChange={(e) => setProductData({...productData, name: e.target.value})} 
                    className="w-full bg-white border border-stone-200 rounded-2xl px-6 py-4 text-stone-800 font-bold text-lg focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10 transition-all shadow-sm" 
                />
              </div>

              {/* DANH MỤC & TỒN KHO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Danh mục</label>
                  <div className="relative">
                    <select 
                      value={productData.category} onChange={(e) => setProductData({...productData, category: e.target.value})} 
                      className="cursor-pointer w-full bg-white border border-stone-200 rounded-2xl px-6 py-4 text-stone-800 font-bold text-sm focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10 transition-all shadow-sm appearance-none"
                    >
                      {CATEGORIES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] pointer-events-none">▼</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">Số lượng tồn kho</label>
                  <input 
                    type="number" min="0"
                    value={productData.stock} onChange={(e) => setProductData({...productData, stock: parseInt(e.target.value) || 0})} 
                    className="w-full bg-white border border-stone-200 rounded-2xl px-6 py-4 text-stone-800 font-bold text-xl focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10 transition-all shadow-sm" 
                  />
                </div>
              </div>

              {/* HẠN SỬ DỤNG & TRẠNG THÁI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Hạn sử dụng (Date)</label>
                  <input 
                    type="date" 
                    value={productData.expiry_date} onChange={(e) => setProductData({...productData, expiry_date: e.target.value})} 
                    className="cursor-pointer w-full bg-white border border-stone-200 rounded-2xl px-6 py-4 text-stone-800 font-bold text-sm focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10 transition-all shadow-sm" 
                  />
                  <p className="text-[10px] text-stone-400 mt-2 ml-2 italic">* Rất quan trọng đối với dòng Pate tươi thủ công.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Trạng thái bán</label>
                  <div className="flex bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden p-1 shadow-sm h-[54px]">
                    {['Sẵn sàng', 'Hết hàng'].map(status => (
                      <button 
                        key={status} type="button" 
                        onClick={() => setProductData({...productData, status})} 
                        className={`cursor-pointer flex-1 text-xs font-black rounded-xl transition-all ${
                          productData.status === status 
                            ? status === 'Sẵn sàng' ? 'bg-emerald-500 text-white shadow-md' : 'bg-rose-500 text-white shadow-md' 
                            : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* MÔ TẢ */}
              <div className="pt-4 border-t border-stone-100">
                <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Mô tả chi tiết / Ghi chú</label>
                <textarea 
                  value={productData.description} onChange={(e) => setProductData({...productData, description: e.target.value})}
                  placeholder="Nhập thông tin thành phần, công dụng, hướng dẫn sử dụng..." rows={5} 
                  className="w-full bg-white border border-stone-200 rounded-2xl px-5 py-4 text-stone-800 text-sm focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10 transition-all shadow-sm resize-none"
                ></textarea>
              </div>

              {/* GIÁ BÁN */}
              <div className="border-t border-stone-200/60 pt-8 mt-4">
                <label className="block text-xs font-black text-pink-500 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                  <span className="text-xl">💰</span> Giá niêm yết (VNĐ)
                </label>
                <div className="relative group/price">
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl blur opacity-25 group-hover/price:opacity-50 transition duration-500 pointer-events-none"></div>
                  <input 
                    type="number" min="0"
                    value={productData.price} onChange={(e) => setProductData({...productData, price: parseInt(e.target.value) || 0})}
                    className="cursor-pointer relative w-full bg-white border-2 border-pink-100 rounded-2xl pl-16 pr-6 py-6 text-4xl md:text-5xl text-pink-600 font-black focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all shadow-lg placeholder:text-pink-200" 
                  />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-pink-400 font-black text-3xl select-none pointer-events-none">đ</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}