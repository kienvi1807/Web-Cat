"use client";

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SHOP_PRODUCTS } from '@/lib/mock-data';

export default function PetshopPage() {
  // --- STATE QUẢN LÝ BỘ LỌC ---
  const [filterCategory, setFilterCategory] = useState<string>('Tất cả');

  // Lấy danh sách các danh mục không trùng lặp (Thức ăn, Đồ chơi, Phụ kiện...)
  const categories = ['Tất cả', ...Array.from(new Set(SHOP_PRODUCTS.map(product => product.category)))];

  // --- LOGIC LỌC SẢN PHẨM ---
  const filteredProducts = SHOP_PRODUCTS.filter(product => {
    return filterCategory === 'Tất cả' || product.category === filterCategory;
  });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-700 font-sans">
      <Header />

      <main className="pt-32 pb-20 container mx-auto px-4 relative z-10">
        
        {/* BREADCRUMB & TIÊU ĐỀ */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-pink-100 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white w-14 h-14 flex items-center justify-center rounded-2xl shadow-sm"><span className="text-2xl">🏪</span></div>
            </div>
            <h1 className="text-4xl font-serif font-bold text-stone-800 mb-2">Beam Petshop</h1>
            <p className="text-stone-500">Phụ kiện & Dinh dưỡng cao cấp cho Boss</p>
          </div>
          <div className="mt-4 md:mt-0 bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium text-stone-500 border border-stone-100">
            Hiển thị <span className="text-pink-500 font-bold">{filteredProducts.length}</span> sản phẩm
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* =========================================
              CỘT TRÁI (1/4): DANH MỤC TÌM KIẾM
              ========================================= */}
          <div className="lg:w-1/4">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 sticky top-32">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-stone-800">
                <span>📑</span> Danh Mục Sản Phẩm
              </h3>

              <div className="flex flex-col gap-2">
                {categories.map(category => (
                  <button 
                    key={category}
                    onClick={() => setFilterCategory(category)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      filterCategory === category 
                        ? 'bg-pink-50 text-pink-600 font-bold border border-pink-200' 
                        : 'bg-transparent text-stone-600 hover:bg-stone-50 border border-transparent hover:border-stone-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {/* Thêm icon vui nhộn dựa theo tên category */}
                      {category === 'Thức ăn' && '🥫'}
                      {category === 'Đồ chơi' && '🧶'}
                      {category === 'Chăm sóc' && '🛁'}
                      {category === 'Phụ kiện' && '🎀'}
                      {category === 'Tất cả' && '📦'}
                      {category}
                    </span>
                    
                    {/* Đếm số lượng sản phẩm mỗi loại */}
                    <span className="bg-white px-2 py-0.5 rounded-md text-xs text-stone-400 shadow-sm border border-stone-100">
                      {category === 'Tất cả' 
                        ? SHOP_PRODUCTS.length 
                        : SHOP_PRODUCTS.filter(p => p.category === category).length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Banner quảng cáo nhỏ ở cột trái */}
              <div className="mt-8 bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl p-5 text-white shadow-md relative overflow-hidden group cursor-pointer">
                <div className="absolute -right-4 -bottom-4 text-6xl opacity-20 transform group-hover:scale-110 transition-transform">🎁</div>
                <h4 className="font-bold mb-1 relative z-10">Voucher 50K</h4>
                <p className="text-xs text-pink-50 relative z-10 mb-3">Cho đơn hàng đầu tiên từ 500k</p>
                <button className="bg-white text-pink-500 text-xs font-bold px-3 py-1.5 rounded-lg relative z-10 hover:bg-pink-50">Lấy mã ngay</button>
              </div>

            </div>
          </div>

          {/* =========================================
              CỘT PHẢI (3/4): LƯỚI SẢN PHẨM
              ========================================= */}
          <div className="lg:w-3/4">
            
            <div className="flex justify-end mb-4">
              <select className="bg-white border border-stone-200 px-4 py-2 rounded-xl text-sm text-stone-600 focus:outline-none focus:border-pink-300 shadow-sm cursor-pointer">
                <option>Sắp xếp: Phổ biến nhất</option>
                <option>Giá: Thấp đến Cao</option>
                <option>Giá: Cao xuống Thấp</option>
                <option>Mới cập nhật</option>
              </select>
            </div>

            {/* Lưới Grid: 1 hàng 3 sản phẩm trên màn to, 2 trên ipad, 1 trên mobile */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl hover:shadow-pink-100/50 border border-transparent hover:border-pink-100 transition-all duration-300 group flex flex-col relative">
                    
                    {/* Badge Category */}
                    <div className="absolute top-6 left-6 z-10">
                       <span className="bg-white/90 backdrop-blur text-pink-500 text-xs font-bold px-2 py-1 rounded-md shadow-sm border border-pink-50">
                         {product.category}
                       </span>
                    </div>

                    {/* Khung Ảnh */}
                    <div className="aspect-square bg-stone-50 rounded-2xl flex items-center justify-center mb-4 overflow-hidden relative border border-stone-100 p-4">
                      <span className="text-stone-400 text-xs text-center">{product.img}</span>
                      {/* Nút xem nhanh hiện ra khi hover */}
                      <button className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white text-stone-700 font-bold text-xs px-4 py-2 rounded-full shadow-md transform translate-y-4 group-hover:translate-y-0 transition-all">Xem nhanh</span>
                      </button>
                    </div>
                    
                    {/* Thông tin sản phẩm */}
                    <div className="flex-1 flex flex-col px-1">
                      <h3 className="font-bold text-stone-700 leading-snug mb-2 line-clamp-2 group-hover:text-pink-500 transition-colors">
                        {product.name}
                      </h3>
                      
                      {/* Đánh giá sao fake */}
                      <div className="flex items-center gap-1 mb-3 text-xs text-yellow-400">
                        <span>★★★★★</span>
                        <span className="text-stone-400 ml-1">(12)</span>
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <p className="text-xl font-black text-rose-500">{product.price}</p>
                        <button className="w-10 h-10 flex items-center justify-center bg-pink-50 rounded-full text-pink-500 hover:bg-pink-400 hover:text-white transition-colors shadow-sm">
                          <span>🛒</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              // Trạng thái không tìm thấy sản phẩm
              <div className="bg-white border border-stone-100 rounded-[2rem] p-12 text-center flex flex-col items-center justify-center shadow-sm">
                <span className="text-5xl mb-4 grayscale opacity-40">📦</span>
                <h3 className="text-xl font-bold text-stone-700 mb-2">Đang nhập hàng!</h3>
                <p className="text-stone-500">Danh mục này hiện chưa có sản phẩm. Bạn vui lòng quay lại sau nhé.</p>
                <button 
                  onClick={() => setFilterCategory('Tất cả')}
                  className="mt-4 bg-pink-50 text-pink-500 px-6 py-2 rounded-full font-bold hover:bg-pink-100 transition-colors"
                >
                  Xem tất cả sản phẩm
                </button>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}