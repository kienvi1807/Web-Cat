"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; 
import { motion, AnimatePresence } from 'framer-motion';

// 🎯 DANH MỤC ĐÃ LOẠI BỎ PATE TƯƠI THEO Ý SẾP
const CATEGORIES = [
  'Thức ăn hạt', 
  'Pate đóng lon', 
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
  const [isOpenCategory, setIsOpenCategory] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 
  
  // 🌟 STATE CHO TÍNH NĂNG AFFILIATE
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [affiliateUrl, setAffiliateUrl] = useState('');

  const [productData, setProductData] = useState<any>({
    name: '', 
    category: 'Thức ăn hạt', 
    brand: '',
    origin: '',
    price: '', 
    stock: '',
    status: 'Sẵn sàng', 
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
    const { error: uploadError } = await supabase.storage.from('pet-images').upload(fileName, file);

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from('pet-images').getPublicUrl(fileName);
      const newUrl = publicUrlData.publicUrl;
      let newImages = [...productData.images];
      newImages[uploadingSlot] = newUrl;
      setProductData({ ...productData, images: newImages });
      if (uploadingSlot === 0) setMainImage(newUrl);
    } else {
      alert("Lỗi tải ảnh sếp ơi: " + uploadError.message);
    }
    setIsUploading(false);
    setUploadingSlot(null); 
    if (fileInputRef.current) fileInputRef.current.value = ''; 
  };

  const handleSaveProduct = async () => {
    if (!productData.name || !productData.price) {
      return alert("Sếp quên nhập Tên hoặc Giá rồi!");
    }
    if (isAffiliate && !affiliateUrl) {
      return alert("Sếp chọn bán Affiliate thì phải dán link Shopee/TikTok vào nhé!");
    }

    setIsLoading(true);
    const cleanImages = productData.images.filter((img: string) => img !== '');

    const { error } = await supabase
      .from('products')
      .insert([{
        name: productData.name,
        category: productData.category,
        brand: productData.brand,
        origin: productData.origin,
        price: Number(productData.price),
        stock: isAffiliate ? 0 : Number(productData.stock || 0), // Affiliate ép stock về 0
        status: productData.status,
        images: cleanImages,
        description: productData.description,
        is_affiliate: isAffiliate,
        affiliate_url: isAffiliate ? affiliateUrl : null,
        affiliate_clicks: 0
      }]);

    setIsLoading(false);
    if (!error) {
      alert("✅ Sản phẩm đã được đưa lên kệ Beam Petshop!");
      router.push('/dashboard/petshop/products');
    } else {
      alert("Lỗi rồi sếp: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffafa] pb-24 relative overflow-hidden selection:bg-rose-200">
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

      {/* 🔮 HIỆU ỨNG NỀN LOANG MÀU HỒNG (Giống trang Pate sếp gửi) */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-rose-400/15 rounded-full blur-[150px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="fixed bottom-[-15%] left-[-5%] w-[700px] h-[700px] bg-pink-500/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>
      
      {/* Lớp kính mờ phủ nhẹ lên toàn bộ background để màu loang thật êm */}
      <div className="fixed inset-0 bg-white/40 backdrop-blur-[2px] pointer-events-none -z-5"></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1440px] mx-auto px-6 pt-10 relative z-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 backdrop-blur-md bg-white/40 p-6 rounded-[2.5rem] border border-white/60 shadow-xl sticky top-4 z-50">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <Link href="/dashboard/petshop/products" className="cursor-pointer group inline-flex items-center gap-2 px-6 py-3 bg-white rounded-2xl text-sm font-black text-rose-600 hover:bg-rose-50 transition-all shadow-sm border border-stone-100 hover:-translate-x-1">
              <span className="text-lg">←</span> Quay lại
            </Link>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Tạo Sản Phẩm <span className="italic bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">Beam Petshop</span>
            </h1>
          </div>

          <button 
            onClick={handleSaveProduct}
            disabled={isLoading || isUploading}
            className="cursor-pointer bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black px-12 py-4 rounded-2xl shadow-lg shadow-rose-200 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Đang lưu...' : 'Lên Kệ Ngay 🚀'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 relative z-10">
          
          {/* 📸 CỘT TRÁI: HÌNH ẢNH */}
          <div className="w-full lg:w-5/12 flex flex-col gap-6">
            <div onClick={() => handleImageClick(0)} className="cursor-pointer relative aspect-square bg-white rounded-[3rem] border-2 border-dashed border-stone-200 hover:border-rose-300 shadow-2xl shadow-rose-100/20 overflow-hidden group p-6 transition-all">
              {isUploading && uploadingSlot === 0 && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center text-rose-500 z-20">
                  <span className="text-4xl animate-spin mb-2">⚙️</span><p className="font-black tracking-widest text-[10px]">Đang tải...</p>
                </div>
              )}
              <img src={mainImage || 'https://via.placeholder.com/800?text=Beam+Petshop'} className={`w-full h-full object-contain transition-all duration-1000 ${mainImage ? 'group-hover:scale-105' : 'opacity-10 grayscale'}`} />
              <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <span className="bg-white text-rose-600 font-black px-8 py-3 rounded-2xl shadow-2xl flex items-center gap-2 uppercase text-xs tracking-widest">📸 {mainImage ? 'Đổi ảnh' : 'Tải ảnh bìa'}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} onClick={() => handleImageClick(idx)} className="cursor-pointer relative aspect-square rounded-2xl bg-white overflow-hidden border-2 border-stone-100 shadow-sm hover:border-rose-400 transition-all group p-2">
                  {isUploading && uploadingSlot === idx && (<div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center text-rose-500 z-20"><span className="animate-spin">⚙️</span></div>)}
                  {productData.images[idx] ? (
                    <img src={productData.images[idx]} className="w-full h-full object-contain group-hover:scale-110 transition-all" />
                  ) : (
                    <div className="absolute inset-0 bg-stone-50 flex items-center justify-center text-stone-300 group-hover:bg-rose-50 group-hover:text-rose-500 transition-all text-2xl font-light">+</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 📝 CỘT PHẢI: FORM CẤU HÌNH */}
          <div className="w-full lg:w-7/12">
            <div className="bg-white/60 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 border border-white shadow-2xl relative overflow-visible">
              <h2 className="text-sm font-black text-rose-400 uppercase tracking-[0.3em] mb-10">Thông số sản phẩm ✨</h2>

              <div className="space-y-8">
                {/* Tên & Thương hiệu */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tên mặt hàng *</label>
                    <input type="text" value={productData.name} onChange={(e) => setProductData({...productData, name: e.target.value})} className="w-full bg-white border border-stone-100 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-300 transition-all" placeholder="VD: Hạt Royal Canin..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Thương hiệu</label>
                    <input type="text" value={productData.brand} onChange={(e) => setProductData({...productData, brand: e.target.value})} className="w-full bg-white border border-stone-100 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:border-rose-300 transition-all" placeholder="Royal Canin, Me-O..." />
                  </div>
                </div>

                {/* Dropdown DANH MỤC */}
                <div className="relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Phân loại hàng</label>
                  <div 
                    onClick={() => setIsOpenCategory(!isOpenCategory)}
                    className="cursor-pointer w-full bg-white border border-stone-100 rounded-2xl px-6 py-4 font-bold text-slate-700 flex justify-between items-center shadow-sm hover:border-rose-200 transition-all group"
                  >
                    {productData.category}
                    <span className={`transition-transform duration-300 ${isOpenCategory ? 'rotate-180' : ''} text-rose-300`}>▼</span>
                  </div>
                  
                  <AnimatePresence>
                    {isOpenCategory && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="absolute z-[100] w-full mt-2 bg-white/95 backdrop-blur-2xl border border-white rounded-[2rem] shadow-2xl max-h-60 overflow-y-auto p-2"
                      >
                        {CATEGORIES.map(cat => (
                          <div 
                            key={cat} onClick={() => { setProductData({...productData, category: cat}); setIsOpenCategory(false); }}
                            className="cursor-pointer px-6 py-4 rounded-xl font-bold text-sm text-slate-600 hover:bg-rose-500 hover:text-white transition-all mb-1 last:mb-0"
                          >
                            {cat}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Xuất xứ */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block">Xuất xứ</label>
                  <input type="text" value={productData.origin} onChange={(e) => setProductData({...productData, origin: e.target.value})} placeholder="Pháp, Mỹ, Nhật Bản..." className="w-full bg-white border border-stone-100 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:border-rose-300 shadow-sm" />
                </div>

                {/* 🌟 CHỌN LOẠI HÀNG (SẴN/AFFILIATE) */}
                <div className="space-y-3 pt-4 border-t border-dashed border-stone-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block">Nguồn Hàng</label>
                  <div className="flex bg-slate-100/50 rounded-2xl p-1.5 border border-stone-100 gap-2 shadow-inner">
                    <button 
                      type="button" 
                      onClick={() => setIsAffiliate(false)}
                      className={`cursor-pointer flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${!isAffiliate ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      📦 Có sẵn tại Shop
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsAffiliate(true)}
                      className={`cursor-pointer flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isAffiliate ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      🔗 Affiliate (Shopee/TikTok)
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {isAffiliate && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <div className="mt-3">
                          <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest ml-2 block mb-2">Link Nơi Bán *</label>
                          <input 
                            type="url" 
                            value={affiliateUrl} 
                            onChange={(e) => setAffiliateUrl(e.target.value)} 
                            placeholder="https://shopee.vn/..." 
                            className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl px-6 py-4 font-medium text-slate-700 outline-none focus:border-orange-300 shadow-sm" 
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Giá & Tồn kho */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-dashed border-stone-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-2 block">Giá niêm yết (đ)</label>
                    <div className="relative">
                      <input type="number" value={productData.price} onChange={(e) => setProductData({...productData, price: e.target.value})} className="cursor-text w-full bg-rose-50/50 border-2 border-rose-100 text-rose-600 rounded-2xl pl-12 pr-6 py-5 font-black text-3xl outline-none" placeholder="0" />
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-300 font-black text-xl">đ</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block">Số lượng kho</label>
                    <input 
                      type="number" 
                      value={isAffiliate ? 0 : productData.stock} 
                      onChange={(e) => setProductData({...productData, stock: e.target.value})} 
                      disabled={isAffiliate}
                      className={`w-full border border-stone-100 rounded-2xl px-6 py-5 font-black text-3xl outline-none ${isAffiliate ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'cursor-text bg-slate-50 text-slate-700'}`} 
                      placeholder="0" 
                    />
                    {isAffiliate && <p className="text-[10px] text-orange-400 font-bold ml-2 mt-1">* Hàng Affiliate không cần nhập kho</p>}
                  </div>
                </div>

                {/* Trạng thái Bán */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Trạng thái kệ hàng</label>
                  <div className="flex bg-slate-100/50 rounded-2xl p-1.5 border border-stone-100 gap-2 shadow-inner">
                    {['Sẵn sàng', 'Hết hàng'].map(st => (
                      <button 
                        key={st} type="button" onClick={() => setProductData({...productData, status: st})}
                        className={`cursor-pointer flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${productData.status === st ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mô tả */}
                <div className="pt-4 border-t border-stone-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Mô tả sản phẩm</label>
                  <textarea value={productData.description} onChange={(e) => setProductData({...productData, description: e.target.value})} rows={5} placeholder="Nhập công dụng, thành phần, lưu ý..." className="w-full bg-white border border-stone-100 rounded-[2rem] px-6 py-5 font-medium text-slate-600 leading-relaxed outline-none focus:border-rose-300 transition-all resize-none shadow-sm" />
                </div>

              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}