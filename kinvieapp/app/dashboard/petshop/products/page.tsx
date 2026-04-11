"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; 
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  'Tất cả', 
  'Thức ăn hạt', 
  'Pate đóng lon', 
  'Cát vệ sinh', 
  'Phụ kiện (Bát, Dây, Túi)', 
  'Đồ chơi', 
  'Sữa tắm & Vệ sinh', 
  'Thuốc & Thực phẩm chức năng',
  'Khác'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới cập nhật' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' }
];

export default function ProductsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('newest');

  // State quản lý bật/tắt menu
  const [isOpenCategoryFilter, setIsOpenCategoryFilter] = useState(false);
  const [isOpenSortFilter, setIsOpenSortFilter] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .neq('category', 'Pate tươi (Thủ công)') 
      .order('created_at', { ascending: false });

    if (error) console.error("Lỗi tải hàng hóa:", error);
    else setProducts(data || []);
    setIsLoading(false);
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price || 0);

  const filteredAndSortedProducts = products
    .filter(product => {
      if (!product) return false;
      const matchesSearch = (product.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Tất cả' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#fffafa] pb-20 relative overflow-hidden selection:bg-fuchsia-200">
      
      {/* HIỆU ỨNG NỀN */}
      <div className="fixed top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-400/20 mix-blend-multiply filter blur-[120px] animate-blob z-0"></div>
      <div className="fixed top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-500/20 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000 z-0"></div>
      <div className="fixed bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-fuchsia-300/20 mix-blend-multiply filter blur-[150px] animate-blob animation-delay-4000 z-0"></div>
      
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1440px] mx-auto px-6 pt-10 relative z-10">
        
        {/* NÚT BACK */}
        <div className="mb-10">
          <Link 
              href="/dashboard/petshop" 
              className="cursor-pointer group inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white text-fuchsia-600 hover:bg-white hover:text-fuchsia-700 px-5 py-2.5 rounded-full font-black text-sm mb-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(192,38,211,0.15)] hover:-translate-y-0.5 active:scale-95 w-fit"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span> Quay lại Beam Petshop
            </Link>
        </div>

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-slate-800 tracking-tight leading-tight">
              Kho Hàng <span className="inline-block bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 bg-clip-text text-transparent italic px-1">Cao Cấp</span> ✨
            </h1>
            <p className="text-slate-400 font-bold text-lg">Hệ sinh thái phụ kiện & thức ăn chuyên nghiệp cho hoàng thượng.</p>
          </div>

          <Link href="/dashboard/petshop/products/add" className="cursor-pointer bg-gradient-to-r from-fuchsia-500 to-fuchsia-500 hover:from-fuchsia-600 hover:to-fuchsia-600 text-white font-black px-10 py-5 rounded-2xl shadow-2xl shadow-fuchsia-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 tracking-wider text-sm uppercase">
            <span>+</span> THÊM SẢN PHẨM MỚI
          </Link>
        </div>

        {/* BỘ LỌC KÍNH MỜ (CUSTOM DROPDOWN NÉT CĂNG) */}
        <div className="bg-white/40 backdrop-blur-3xl rounded-[2.5rem] p-6 border border-white shadow-2xl shadow-fuchsia-100/50 mb-16 flex flex-col xl:flex-row gap-6">
          <div className="flex-1 relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl opacity-40 pointer-events-none">🔍</span>
            <input 
              type="text" placeholder="Tìm tên sản phẩm, thương hiệu..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/80 border-0 rounded-2xl pl-16 pr-6 py-4 text-base font-bold text-slate-700 shadow-inner outline-none focus:ring-4 focus:ring-fuchsia-500/10 transition-all"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            
            {/* MENU DANH MỤC */}
            <div className="relative min-w-[240px]">
              <div 
                onClick={() => { setIsOpenCategoryFilter(!isOpenCategoryFilter); setIsOpenSortFilter(false); }}
                className="w-full bg-white/80 border-0 rounded-2xl px-8 py-4 text-sm font-black text-slate-600 shadow-sm cursor-pointer hover:bg-white transition-all flex justify-between items-center group"
              >
                {selectedCategory}
                <span className={`transition-transform duration-300 ${isOpenCategoryFilter ? 'rotate-180' : ''} text-fuchsia-300 group-hover:text-fuchsia-400`}>▼</span>
              </div>
              
              <AnimatePresence>
                {isOpenCategoryFilter && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute z-[100] w-full mt-2 bg-white/95 backdrop-blur-2xl border border-white rounded-[2rem] shadow-2xl max-h-60 overflow-y-auto p-2 no-scrollbar"
                  >
                    {CATEGORIES.map(cat => (
                      <div 
                        key={cat} 
                        onClick={() => { setSelectedCategory(cat); setIsOpenCategoryFilter(false); }}
                        className={`cursor-pointer px-6 py-4 rounded-xl font-bold text-sm transition-all mb-1 last:mb-0 ${selectedCategory === cat ? 'bg-fuchsia-500 text-white' : 'text-slate-600 hover:bg-fuchsia-50 hover:text-fuchsia-600'}`}
                      >
                        {cat}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* MENU SẮP XẾP */}
            <div className="relative min-w-[220px]">
              <div 
                onClick={() => { setIsOpenSortFilter(!isOpenSortFilter); setIsOpenCategoryFilter(false); }}
                className="w-full bg-white/80 border-0 rounded-2xl px-8 py-4 text-sm font-black text-slate-600 shadow-sm cursor-pointer hover:bg-white transition-all flex justify-between items-center group"
              >
                {SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || 'Mới cập nhật'}
                <span className={`transition-transform duration-300 ${isOpenSortFilter ? 'rotate-180' : ''} text-fuchsia-300 group-hover:text-fuchsia-400`}>↕</span>
              </div>
              
              <AnimatePresence>
                {isOpenSortFilter && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute z-[100] w-full mt-2 bg-white/95 backdrop-blur-2xl border border-white rounded-[2rem] shadow-2xl p-2"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <div 
                        key={opt.value} 
                        onClick={() => { setSortBy(opt.value); setIsOpenSortFilter(false); }}
                        className={`cursor-pointer px-6 py-4 rounded-xl font-bold text-sm transition-all mb-1 last:mb-0 ${sortBy === opt.value ? 'bg-fuchsia-500 text-white' : 'text-slate-600 hover:bg-fuchsia-50 hover:text-fuchsia-600'}`}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* LƯỚI SẢN PHẨM */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="text-center py-40">
              <div className="w-16 h-16 border-4 border-fuchsia-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-fuchsia-600 font-black tracking-widest uppercase text-xs animate-pulse">ĐANG TẢI KHO HÀNG...</p>
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-32 bg-white/30 backdrop-blur-md rounded-[3rem] border border-dashed border-fuchsia-200">
              <span className="text-6xl block mb-6 grayscale opacity-30">📦</span>
              <h3 className="text-2xl font-black text-slate-400">Không tìm thấy hàng trong kho!</h3>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {filteredAndSortedProducts.map((product) => (
                <motion.div key={product.id} whileHover={{ y: -12 }} className="relative group cursor-pointer">
                  <Link href={`/dashboard/petshop/products/${product.id}`} className="block h-full cursor-pointer">
                    <div className="bg-white rounded-[2.5rem] p-4 border border-fuchsia-50/50 shadow-2xl shadow-fuchsia-100/20 group-hover:shadow-fuchsia-500/20 transition-all duration-500 flex flex-col h-full overflow-hidden">
                      
                      <div className="relative aspect-[4/5] rounded-[2rem] bg-slate-50 overflow-hidden mb-6 flex items-center justify-center p-6 group-hover:bg-fuchsia-50/30 transition-colors">
                        <img src={product.images?.[0] || 'https://via.placeholder.com/400'} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
                        <div className="absolute top-3 left-3 z-10">
                          <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter shadow-lg ${product.stock > 0 ? 'bg-white text-slate-800' : 'bg-fuchsia-600 text-white'}`}>
                            {product.stock > 0 ? `Tồn kho: ${product.stock}` : 'Hết hàng'}
                          </span>
                        </div>
                      </div>

                      <div className="px-2 pb-2 flex-1 flex flex-col">
                        <span className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest mb-1 block">{product.category}</span>
                        <h3 className="font-black text-slate-800 text-sm leading-snug line-clamp-2 min-h-[40px] group-hover:text-fuchsia-600 transition-colors">{product.name}</h3>
                        <p className="text-[11px] font-bold text-slate-500 mt-2 line-clamp-1 italic">Hiệu: {product.brand || 'Đang cập nhật'}</p>
                        
                        <div className="mt-auto pt-4 flex justify-between items-end border-t border-dashed border-stone-100">
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Giá bán</p>
                            <p className="text-xl font-black text-fuchsia-600 italic">{formatPrice(product.price)}<span className="text-[10px] ml-0.5">VNĐ</span></p>
                          </div>
                          <div className="w-10 h-10 rounded-2xl bg-fuchsia-500 text-white flex items-center justify-center group-hover:bg-fuchsia-600 transition-all shadow-xl shadow-fuchsia-500/30">
                            <span className="text-lg">→</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}