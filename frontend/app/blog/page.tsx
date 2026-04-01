"use client";

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BLOG_POSTS } from '@/lib/mock-data';

export default function BlogPage() {
  const [activeTab, setActiveTab] = useState('Tất cả');
  
  // Fake danh mục chủ đề bài viết
  const topics = ['Tất cả', 'Cẩm nang Newbie', 'Dinh dưỡng', 'Chăm sóc lông', 'Kiến thức đi Show'];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-700 font-sans">
      <Header />

      <main className="pt-32 pb-20 container mx-auto px-4 relative z-10">
        
        {/* TIÊU ĐỀ TRANG */}
        <div className="mb-10 text-center">
          <div className="inline-block bg-white border border-pink-100 p-4 rounded-full mb-4 shadow-sm">
             <span className="text-4xl">📖</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-stone-800 mb-4">Góc Sen Tự Học</h1>
          <p className="text-stone-500 max-w-2xl mx-auto">Cẩm nang nuôi dưỡng, chăm sóc và huấn luyện mèo Maine Coon chuẩn khoa học được đúc kết từ kinh nghiệm thực tế của KinVie.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* =========================================
              CỘT TRÁI (1/4): TÌM KIẾM & CHỦ ĐỀ
              ========================================= */}
          <div className="lg:w-1/4">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 sticky top-32">
              
              {/* Ô Tìm kiếm */}
              <div className="mb-8">
                <h3 className="font-bold text-stone-800 mb-3 text-sm uppercase tracking-wider">Tìm kiếm</h3>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Nhập từ khóa..." 
                    className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:bg-white transition-colors"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-pink-500">
                    🔍
                  </button>
                </div>
              </div>

              {/* Danh sách chủ đề */}
              <div>
                <h3 className="font-bold text-stone-800 mb-3 text-sm uppercase tracking-wider">Chủ đề</h3>
                <div className="flex flex-col gap-2">
                  {topics.map(topic => (
                    <button 
                      key={topic}
                      onClick={() => setActiveTab(topic)}
                      className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        activeTab === topic 
                          ? 'bg-pink-50 text-pink-600 font-bold border-l-4 border-pink-500' 
                          : 'bg-transparent text-stone-600 hover:bg-stone-50 hover:text-pink-400 border-l-4 border-transparent'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* =========================================
              CỘT PHẢI (3/4): LƯỚI BÀI VIẾT
              ========================================= */}
          <div className="lg:w-3/4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {BLOG_POSTS.map((post) => (
                <article key={post.id} className="bg-white rounded-[2rem] shadow-sm border border-stone-100 hover:shadow-xl hover:shadow-pink-100/50 hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col cursor-pointer">
                  
                  {/* Thumbnail bài viết */}
                  <div className="aspect-[16/10] bg-pink-50 flex items-center justify-center overflow-hidden relative">
                    <span className="text-pink-300 text-xs px-2 text-center relative z-10">{post.img}</span>
                    <div className="absolute inset-0 bg-pink-400/0 group-hover:bg-pink-400/10 transition-colors z-0"></div>
                  </div>
                  
                  {/* Nội dung text */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-bold text-pink-400 uppercase tracking-wide bg-pink-50 px-3 py-1 rounded-full">
                        Cẩm nang
                      </span>
                      <span className="text-stone-400 text-xs flex items-center gap-1">
                        🗓️ {post.date}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-stone-800 mb-3 group-hover:text-pink-500 transition-colors leading-snug">
                      {post.title}
                    </h3>
                    
                    <p className="text-stone-500 text-sm line-clamp-3 leading-relaxed mb-6 flex-1">
                      Khám phá những mẹo hay ho và chuẩn khoa học để giúp bé mèo nhà bạn khỏe mạnh, xinh đẹp hơn mỗi ngày. Đội ngũ KinVie đúc kết từ quá trình chăm sóc hàng chục thế hệ mèo...
                    </p>
                    
                    <div className="mt-auto border-t border-stone-100 pt-4 flex items-center justify-between">
                      <span className="text-sm font-bold text-stone-800 flex items-center gap-2">
                        <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center text-xs">🐾</div>
                        KinVie Team
                      </span>
                      <span className="text-pink-500 text-sm font-bold group-hover:translate-x-1 transition-transform">
                        Đọc tiếp ➔
                      </span>
                    </div>
                  </div>

                </article>
              ))}
            </div>

            {/* Phân trang (Pagination) */}
            <div className="mt-12 flex justify-center items-center gap-2">
              <button className="w-10 h-10 rounded-full bg-white border border-stone-200 text-stone-400 flex items-center justify-center hover:bg-stone-50 disabled:opacity-50">❮</button>
              <button className="w-10 h-10 rounded-full bg-pink-500 text-white font-bold flex items-center justify-center shadow-md shadow-pink-200">1</button>
              <button className="w-10 h-10 rounded-full bg-white border border-stone-200 text-stone-600 font-bold flex items-center justify-center hover:border-pink-300 hover:text-pink-500 transition-colors">2</button>
              <button className="w-10 h-10 rounded-full bg-white border border-stone-200 text-stone-600 flex items-center justify-center hover:bg-stone-50">❯</button>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}