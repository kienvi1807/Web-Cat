"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; 

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

export default function ProductsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  
  // States cho Lọc & Tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('newest'); // newest, price_asc, price_desc

  // 🎯 FETCH DATA SẢN PHẨM (Giả định bảng tên là 'products')
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*'); // ❌ Xóa dòng .order ở đây đi sếp nhé

    if (error) {
      console.error("Lỗi tải hàng hóa:", error);
    } else {
      setProducts(data || []);
    }
    setIsLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0);
  };

  // 🎯 XỬ LÝ LỌC & TÌM KIẾM Ở CLIENT-SIDE
  const filteredAndSortedProducts = products
    .filter(product => {
      // 1. Nếu không có product thì bỏ qua (phòng lỗi data rác)
      if (!product) return false;

      // 2. Lọc theo tên (Search)
      const matchesSearch = (product.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      // 3. Lọc theo danh mục - FIX LỖI Ở ĐÂY
      // Ép cả 2 về trim() để xóa khoảng trắng thừa ở đầu/cuối cho chắc cú
      const catInDB = (product.category || '').trim();
      const catSelected = selectedCategory.trim();
      
      const matchesCategory = catSelected === 'Tất cả' || catInDB === catSelected;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort theo tiêu chí
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      return 0; // newest (đã sort từ database lúc fetch)
    });

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto pb-16 relative">
      {/* 🎨 BACKGROUND GLOW TÔNG HỒNG BEAM PETSHOP */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 right-0 w-[800px] h-[800px] bg-rose-500/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>

      <div className="px-4">
        {/* NÚT BACK (Bo tròn y hệt bên Cats) */}
        <div className="mb-6 relative z-20 pt-6">
          <Link href="/dashboard/petshop" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl text-sm font-bold text-pink-600 hover:bg-pink-50 hover:text-pink-500 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-stone-100 hover:-translate-y-0.5 cursor-pointer">
            <span className="text-lg leading-none">←</span> Quay lại Beam Petshop
          </Link>
        </div>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-serif font-black text-stone-800 flex items-center gap-3">
              Kho Hàng & Phụ Kiện <span className="text-3xl">🧸</span>
            </h1>
            <p className="text-stone-500 mt-2">Quản lý tồn kho, giá bán và danh mục sản phẩm của cửa hàng.</p>
          </div>

          <Link href="/dashboard/petshop/products/add" className="cursor-pointer bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black px-8 py-3.5 rounded-xl shadow-[0_4px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_4px_30px_rgba(244,63,94,0.5)] transition-all transform hover:-translate-y-1 flex items-center gap-2">
            <span>+</span> Thêm Sản Phẩm Mới
          </Link>
        </div>

        {/* 🎯 BỘ CÔNG CỤ TÌM KIẾM & LỌC (FILTER BAR) */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 border border-stone-100 shadow-sm mb-10 flex flex-col lg:flex-row gap-4 relative z-20">
          
          {/* Ô Tìm kiếm */}
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-lg">🔍</span>
            <input 
              type="text" 
              placeholder="Tìm tên sản phẩm, thương hiệu..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50/50 border border-stone-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-stone-700 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-rose-500 cursor-pointer font-black text-xs">✕</button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Lọc Danh mục */}
            <div className="relative min-w-[200px]">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm">📑</span>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none bg-stone-50/50 border border-stone-200 rounded-2xl pl-10 pr-10 py-3 text-sm font-bold text-stone-700 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10 transition-all cursor-pointer"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] pointer-events-none">▼</span>
            </div>

            {/* Sắp xếp (Sort) */}
            <div className="relative min-w-[180px]">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm">↕️</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none bg-stone-50/50 border border-stone-200 rounded-2xl pl-10 pr-10 py-3 text-sm font-bold text-stone-700 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10 transition-all cursor-pointer"
              >
                <option value="newest">Mới cập nhật</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao xuống Thấp</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] pointer-events-none">▼</span>
            </div>
          </div>
        </div>

        {/* 🎯 KHU VỰC HIỂN THỊ SẢN PHẨM */}
        {isLoading ? (
          <div className="text-center py-20">
             <span className="text-4xl animate-spin inline-block mb-4 text-pink-500">⚙️</span>
             <p className="text-pink-500 font-bold animate-pulse uppercase tracking-widest text-sm">Đang tải kho hàng...</p>
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white/60 backdrop-blur-md rounded-[2rem] border border-stone-100 shadow-sm border-dashed">
             <span className="text-5xl inline-block mb-4 opacity-50 grayscale">📦</span>
             <h3 className="text-xl font-black text-stone-600 mb-2">Không tìm thấy sản phẩm nào!</h3>
             <p className="text-stone-400 font-bold text-sm">Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc xem sao sếp nhé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredAndSortedProducts.map((product) => (
              <Link 
                href={`/dashboard/petshop/products/${product.id}`} 
                key={product.id} 
                className="group block bg-white rounded-3xl border border-stone-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(244,63,94,0.1)] hover:border-pink-200 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col"
              >
                {/* Ảnh sản phẩm */}
                <div className="relative aspect-square bg-stone-50 overflow-hidden shrink-0 p-4">
                  <img 
                    src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/400?text=No+Image'} 
                    alt={product.name} 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-[800ms] mix-blend-multiply" 
                  />
                  
                  {/* Badge Tồn kho */}
                  <div className="absolute top-3 right-3 z-10">
                    {product.stock && product.stock > 0 ? (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest bg-white/90 text-stone-600 border border-stone-200 shadow-sm backdrop-blur-md">
                        TỒN: {product.stock}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest bg-rose-500/90 text-white shadow-sm backdrop-blur-md">
                        HẾT HÀNG
                      </span>
                    )}
                  </div>
                </div>

                {/* Thông tin sản phẩm */}
                <div className="p-4 flex-1 flex flex-col relative z-10">
                  <div className="mb-2">
                     <span className="inline-block px-2 py-1 bg-pink-50 text-pink-600 text-[9px] font-black uppercase tracking-widest rounded-md mb-2">
                       {product.category || 'Chưa phân loại'}
                     </span>
                     <h3 className="text-sm font-black text-stone-800 group-hover:text-pink-600 transition-colors line-clamp-2 leading-snug" title={product.name}>
                       {product.name || 'Sản phẩm chưa có tên'}
                     </h3>
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-dashed border-stone-100">
                    <p className="text-lg font-black text-rose-500">
                      {formatPrice(product.price)}<span className="text-xs font-bold text-rose-400 ml-1">đ</span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}