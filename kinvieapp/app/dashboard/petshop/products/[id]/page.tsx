"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLoadingStore } from '@/store/useLoadingStore';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

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

export default function ProductDetailedAdmin() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const { showLoading: showGlobalLoading, hideLoading: hideGlobalLoading } = useLoadingStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [isOpenCategory, setIsOpenCategory] = useState(false);
  
  const [product, setProduct] = useState<any>({
    name: '', price: 0, category: 'Khác', stock: 0, status: 'Sẵn sàng', images: ['', '', '', '', ''],
    description: '', sales_count: 0, brand: '', origin: '', discount_percent: 0
  });

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => { fetchProduct(); }, [id]);

  const fetchProduct = async () => {
    setIsLoading(true);
    showGlobalLoading('SYSTEM SCANNING...');
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    
    if (error) {
      alert("Không tìm thấy sản phẩm!");
      router.push('/dashboard/petshop/products');
    } else {
      const dbImages = data.images || [];
      const paddedImages = [...dbImages, ...Array(5 - dbImages.length).fill('')];
      
      setProduct({
        ...data,
        name: data.name || '',
        description: data.description || '',
        brand: data.brand || '',
        origin: data.origin || '',
        price: data.price || 0,
        stock: data.stock || 0,
        status: data.status || 'Sẵn sàng',
        images: paddedImages
      });
    }
    setIsLoading(false);
    hideGlobalLoading();
  };

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
      let newImages = [...product.images];
      newImages[uploadingSlot] = newUrl;
      setProduct({ ...product, images: newImages });
      setActiveImageIndex(uploadingSlot);
    } else {
      alert("Lỗi tải ảnh sếp ơi: " + uploadError.message);
    }
    setIsUploading(false);
    setUploadingSlot(null);
  };

  // 🎯 HÀM XÓA ẢNH (DẤU TRỪ) SẾP YÊU CẦU
  const handleRemoveImage = (index: number) => {
    let newImages = [...product.images];
    newImages[index] = ''; // Xóa trắng slot này
    setProduct({ ...product, images: newImages });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const cleanImages = product.images.filter((img: string) => img !== '');
    
    const { error } = await supabase.from('products').update({
      ...product,
      images: cleanImages
    }).eq('id', id);

    if (!error) {
      alert("✅ Đã lưu thay đổi nét căng!");
      router.push('/dashboard/petshop/products');
    } else {
      alert("Lỗi cập nhật: " + error.message);
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      alert("🗑 Đã tiễn sản phẩm lên đường!");
      router.push('/dashboard/petshop/products');
    } else {
      alert("Lỗi xóa: " + error.message);
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-[#fffafa] pb-20 relative overflow-hidden selection:bg-rose-200">
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-rose-400/15 rounded-full blur-[80px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[800px] h-[800px] bg-pink-500/10 rounded-full blur-[90px] pointer-events-none -z-10 animate-pulse animation-delay-2000"></div>
      <div className="fixed top-[20%] right-[10%] w-[400px] h-[400px] bg-violet-400/10 rounded-full blur-[70px] pointer-events-none -z-10 animate-blob"></div>

      <div className="pointer-events-none -z-5"></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1440px] mx-auto px-6 pt-10 relative z-10">
        
        <div className="mb-10">
          <Link href="/dashboard/petshop/products" className="cursor-pointer group inline-flex items-center gap-2 bg-white/70 backdrop-blur-xl rounded-2xl text-sm font-black text-rose-600 hover:bg-white px-6 py-3 transition-all shadow-xl shadow-rose-500/5 border border-white hover:-translate-x-1">
            <span className="transition-transform group-hover:-translate-x-1">←</span> QUAY LẠI KHO HÀNG
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 relative z-10">
          
          <div className="w-full lg:w-5/12 flex flex-col gap-6">
            <div className="bg-white/60 backdrop-blur-3xl rounded-[3rem] border border-white shadow-2xl p-6 sticky top-8">
              <div className="relative aspect-square rounded-[2rem] bg-slate-50 overflow-hidden mb-6 border border-stone-100 group flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeImageIndex}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                    src={product.images[activeImageIndex] || 'https://via.placeholder.com/800?text=No+Image'} 
                    className="w-full h-full object-contain p-4 mix-blend-multiply"
                  />
                </AnimatePresence>
                
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="px-4 py-2 bg-white/90 text-slate-800 text-[10px] font-black rounded-xl shadow-sm border border-stone-100 tracking-widest uppercase">SLOT #{activeImageIndex + 1}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleImageClick(activeImageIndex)} className="cursor-pointer px-4 py-2 bg-rose-500 text-white text-[10px] font-black rounded-xl shadow-lg hover:bg-rose-600 transition-all uppercase">THAY ẢNH 📸</button>
                    {product.images[activeImageIndex] && (
                      <button onClick={() => handleRemoveImage(activeImageIndex)} className="cursor-pointer px-4 py-2 bg-white text-rose-500 text-[10px] font-black rounded-xl shadow-lg hover:bg-rose-50 transition-all border border-rose-100 uppercase">XÓA 🗑️</button>
                    )}
                  </div>
                </div>
                {isUploading && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20"><div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div></div>}
              </div>

              {/* Danh sách 5 ảnh nhỏ - CÓ THÊM DẤU TRỪ ĐỂ XÓA */}
              <div className="grid grid-cols-5 gap-3">
                {product.images.map((img: string, idx: number) => (
                  <div key={idx} className="relative group/thumb">
                    <div 
                      onClick={() => img ? setActiveImageIndex(idx) : handleImageClick(idx)}
                      className={`cursor-pointer relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-rose-500 ring-4 ring-rose-500/10 scale-105' : 'border-stone-100 opacity-60 hover:opacity-100'}`}
                    >
                      {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-stone-50 flex items-center justify-center text-stone-300 text-xl">+</div>}
                    </div>
                    {/* DẤU TRỪ XÓA ẢNH */}
                    {img && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/thumb:opacity-100 transition-all hover:scale-110 z-10 font-black text-xs"
                      >
                        -
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-rose-50/50 rounded-2xl p-4 text-center border border-rose-100/50"><p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">Đã bán</p><p className="text-2xl font-black text-rose-600">{product.sales_count}</p></div>
                <div className="bg-pink-50/50 rounded-2xl p-4 text-center border border-pink-100/50"><p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">Tồn kho</p><p className="text-2xl font-black text-pink-600">{product.stock}</p></div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-7/12">
            <div className="bg-white/60 backdrop-blur-3xl rounded-[3.5rem] border border-white shadow-2xl p-8 md:p-12 relative overflow-visible">
              <h2 className="text-sm font-black text-rose-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3 relative z-10">
                Thông số mặt hàng <span className="text-xl">✨</span>
              </h2>
              
              <div className="space-y-8 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Tên mặt hàng *</label>
                  <input value={product.name} onChange={e => setProduct({...product, name: e.target.value})} className="w-full bg-white border border-stone-100 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-300 transition-all" />
                </div>

                <div className="relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Phân loại hàng</label>
                  <div 
                    onClick={() => setIsOpenCategory(!isOpenCategory)}
                    className="cursor-pointer w-full bg-white border border-stone-100 rounded-2xl px-6 py-4 font-bold text-slate-700 flex justify-between items-center shadow-sm hover:border-rose-200 transition-all group"
                  >
                    {product.category}
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
                            key={cat} onClick={() => { setProduct({...product, category: cat}); setIsOpenCategory(false); }}
                            className="cursor-pointer px-6 py-4 rounded-xl font-bold text-sm text-slate-600 hover:bg-rose-500 hover:text-white transition-all mb-1 last:mb-0"
                          >
                            {cat}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block">Thương hiệu</label>
                    <input value={product.brand} onChange={e => setProduct({...product, brand: e.target.value})} className="w-full bg-white border border-stone-100 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:border-rose-300 transition-all" placeholder="VD: Royal Canin, CIAO..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block">Xuất xứ</label>
                    <input value={product.origin} onChange={e => setProduct({...product, origin: e.target.value})} className="w-full bg-white border border-stone-100 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:border-rose-300 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-dashed border-stone-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-2 block">Giá niêm yết (đ)</label>
                    <div className="relative">
                      <input type="number" value={product.price} onChange={e => setProduct({...product, price: +e.target.value})} className="w-full bg-rose-50/50 border-2 border-rose-100 text-rose-600 rounded-2xl pl-12 pr-6 py-5 font-black text-3xl outline-none shadow-inner" />
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-rose-300 font-black text-xl">đ</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block">Số lượng tồn kho</label>
                    <input type="number" value={product.stock} onChange={e => setProduct({...product, stock: +e.target.value})} className="w-full bg-slate-50 border border-stone-100 text-slate-700 rounded-2xl px-6 py-5 font-black text-3xl outline-none" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Trạng thái kệ hàng</label>
                  <div className="flex bg-slate-100/50 rounded-2xl p-1.5 border border-stone-100 gap-2 shadow-inner">
                    {['Sẵn sàng', 'Hết hàng'].map(st => (
                      <button 
                        key={st} type="button" onClick={() => setProduct({...product, status: st})}
                        className={`cursor-pointer flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${product.status === st ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block">Mô tả sản phẩm</label>
                  <textarea rows={6} value={product.description} onChange={e => setProduct({...product, description: e.target.value})} className="w-full bg-white border border-stone-100 rounded-[2rem] px-6 py-5 font-medium text-stone-700 leading-relaxed outline-none focus:border-rose-300 transition-all resize-none shadow-sm" placeholder="Nhập công dụng, thành phần, lưu ý..." />
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                  <button onClick={() => { if(window.confirm("Xóa vĩnh viễn sản phẩm này?")) handleDelete(); }} className="cursor-pointer px-10 py-5 bg-white border-2 border-rose-100 text-rose-500 rounded-2xl font-black hover:bg-rose-50 transition-all active:scale-95">🗑 XÓA MẶT HÀNG</button>
                  <button onClick={handleSave} disabled={isSaving} className="cursor-pointer flex-1 py-5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-rose-200 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70">
                    {isSaving ? "ĐANG SYNC..." : "LƯU & CẬP NHẬT GALLERY"}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{__html: `
        .animate-blob { animation: blob 10s infinite alternate; }
        .animation-delay-2000 { animation-delay: 2s; }
        @keyframes blob { 
          0% { transform: translate(0px, 0px) scale(1); } 
          33% { transform: translate(40px, -60px) scale(1.1); } 
          66% { transform: translate(-30px, 30px) scale(0.9); } 
          100% { transform: translate(0px, 0px) scale(1); } 
        }
      `}} />
    </div>
  );
}