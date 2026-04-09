"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; 

export default function PateFreshPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [pateProducts, setPateProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPateData();
  }, []);

  const fetchPateData = async () => {
    setIsLoading(true);
    // 🎯 Lọc đúng danh mục Pate tươi
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', 'Pate tươi (Thủ công)');

    if (error) {
      console.error("Lỗi tải data Pate:", error);
    } else {
      setPateProducts(data || []);
    }
    setIsLoading(false);
  };

  // 🎯 Hàm tính ngày còn lại để cảnh báo cận date
  const getExpiryStatus = (expiryDate: string) => {
    if (!expiryDate) return { label: 'Chưa có date', color: 'bg-stone-100 text-stone-500' };
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Hết hạn', color: 'bg-rose-600 text-white animate-pulse' };
    if (diffDays <= 2) return { label: `Còn ${diffDays} ngày`, color: 'bg-amber-500 text-white' };
    return { label: `Còn ${diffDays} ngày`, color: 'bg-emerald-500 text-white' };
  };

  const filteredPate = pateProducts.filter(p => 
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto pb-16 relative">
      {/* BACKGROUND EMERALD TÔNG PATE TƯƠI */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>

      <div className="px-4">
        <div className="mb-6 relative z-20 pt-6">
          <Link href="/dashboard/petshop" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl text-sm font-bold text-emerald-600 hover:bg-emerald-50 shadow-sm border border-stone-100 cursor-pointer">
            ← Quay lại Beam Petshop
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-serif font-black text-stone-800 flex items-center gap-3">
              Quản lý Pate Tươi <span className="text-3xl">🥫</span>
            </h1>
            <p className="text-stone-500 mt-2">Theo dõi hạn sử dụng và số lượng các mẻ Pate nấu thủ công.</p>
          </div>

          <Link href="/dashboard/petshop/pate/add" className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-2">
            <span>+</span> Nấu mẻ mới
          </Link>
        </div>

        {/* SEARCH BOX */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 border border-stone-100 shadow-sm mb-10 relative z-20">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
            <input 
              type="text" 
              placeholder="Tìm kiếm mẻ Pate theo tên hoặc ngày nấu..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50/50 border border-stone-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-stone-700 focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        {/* GRID HIỂN THỊ */}
        {isLoading ? (
          <div className="text-center py-20 text-emerald-500 animate-pulse font-bold">Đang kiểm tra kho Pate...</div>
        ) : filteredPate.length === 0 ? (
          <div className="text-center py-20 bg-white/40 rounded-[2rem] border-dashed border-2 border-stone-200">
             <p className="text-stone-400 font-bold">Hiện không có mẻ Pate tươi nào khả dụng.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPate.map((p) => {
              const status = getExpiryStatus(p.expiry_date);
              return (
                <div key={p.id} className="bg-white rounded-[2rem] border border-stone-100 p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-tighter ${status.color}`}>
                    {status.label}
                  </div>

                  <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                    {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-contain rounded-2xl" /> : '🥫'}
                  </div>

                  <h3 className="text-lg font-black text-stone-800 mb-1 line-clamp-1">{p.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">HSD:</span>
                    <span className="text-xs font-black text-stone-600">{p.expiry_date ? new Date(p.expiry_date).toLocaleDateString('vi-VN') : '---'}</span>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-dashed border-stone-100">
                    <div>
                      <p className="text-[10px] font-black text-stone-400 uppercase">Còn lại</p>
                      <p className="text-xl font-black text-emerald-600">{p.stock}<span className="text-xs ml-1">hộp</span></p>
                    </div>
                    <Link href={`/dashboard/petshop/products/${p.id}`} className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:bg-emerald-500 hover:text-white transition-all">
                      ✎
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}