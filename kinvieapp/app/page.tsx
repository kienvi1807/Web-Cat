"use client";

import React, { useState, useEffect } from 'react'; // 👈 1. Thêm cái này
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/home/HeroBanner';
import CatteryList from '@/components/home/CatteryList';
import PetshopGrid from '@/components/home/PetshopGrid';
import BlogPreview from '@/components/home/BlogPreview';
import { SHOP_PRODUCTS, BLOG_POSTS } from '@/lib/mock-data'; // 👈 Đã bỏ FEATURED_CATS

// 👈 2. Import Supabase client của sếp vào
import { supabase } from '@/lib/supabase'; 

export default function Home() {
  // 👈 3. Tạo State để lưu dữ liệu mèo thật
  const [realCats, setRealCats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 👈 4. Viết hàm kéo dữ liệu từ bảng 'cats'
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data, error } = await supabase
          .from('cats')
          // 👇 BÍ QUYẾT Ở ĐÂY: Bảo Supabase móc luôn cattery_name từ bảng users ra
          .select('*, users(cattery_name)') 
          .in('status', ['Sẵn sàng', 'Đã cọc']) 
          .order('likes', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        if (data) setRealCats(data);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu mèo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCats();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF8FA] text-stone-700 font-sans selection:bg-pink-200 selection:text-pink-900">
      <Header />

      <main className="relative z-10 pt-24 pb-20">
        <HeroBanner />

        <div className="container mx-auto px-6 space-y-32 mt-10">
          
          {/* Section Cattery */}
          <div>
            {/* 🌟 THIẾT KẾ LẠI PHẦN HEADER CỦA DANH SÁCH MÈO */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14 relative">
              
              {/* Cột trái: Tiêu đề */}
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-pink-100 text-pink-500 text-xs font-black uppercase tracking-widest mb-4 shadow-sm">
                  <span className="text-pink-400 text-sm">🐾</span> Tìm Sen Cho Boss
                </div>
                
                <h2 className="text-4xl md:text-5xl font-black text-stone-800 tracking-tight flex items-center gap-3">
                  KinVie <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400 font-serif italic font-light">Cattery</span>
                </h2>
              </div>

              {/* Cột phải: Nút Xem tất cả (Dạng Pill Button sang chảnh) */}
              <Link 
                href="/cattery" 
                className="group flex items-center gap-3 px-6 py-2.5 bg-white border-2 border-pink-50 rounded-full text-xs font-black text-pink-500 uppercase tracking-widest hover:border-pink-200 hover:bg-pink-50/50 hover:shadow-lg hover:shadow-pink-100/50 transition-all duration-300 w-fit relative z-10"
              >
                Xem Tất Cả
                <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center group-hover:bg-pink-200 group-hover:translate-x-1 transition-all">
                  <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
              
              {/* Họa tiết glow mờ ảo phía sau để tôn tiêu đề lên */}
              <div className="absolute left-0 top-0 w-40 h-40 bg-pink-200/30 rounded-full blur-3xl -z-10 -translate-y-1/2 -translate-x-1/4"></div>
            </div>

            {/* Khối CatteryList giữ nguyên */}
            {isLoading ? (
              <div className="text-center py-10 text-pink-400 font-bold animate-pulse">Đang rước các Boss ra...</div>
            ) : (
              <CatteryList cats={realCats} />
            )}
          </div>
          
          <PetshopGrid products={SHOP_PRODUCTS} />
          <BlogPreview posts={BLOG_POSTS} />

        </div>        
      </main>

      <Footer />
    </div>
  );
}