"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  'Tất cả',
  'Kiến thức đi Show',
  'Kiến thức về Mèo',
  'Dinh dưỡng & Chăm sóc',
  'Tin tức Cattery',
];

export default function BlogPage() {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setBlogs(data);
    setIsLoading(false);
  };

  // Lấy đoạn text đầu tiên trong content để làm mô tả ngắn ngoài card
  const getExcerpt = (content: any[]) => {
    const textBlock = content?.find((b: any) => b.type === 'text' && b.value?.trim());
    return textBlock ? textBlock.value.slice(0, 150) : 'Khám phá bài viết mới nhất từ KinVie Cattery...';
  };

  const filteredBlogs = blogs.filter((b) => {
    const matchesTab = activeTab === 'Tất cả' || b.category === activeTab;
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-700 font-sans">
      <Header />

      <main className="pt-32 pb-20 container mx-auto px-4 relative z-10">

        <div className="mb-10 text-center">
          <div className="inline-block bg-white border border-pink-100 p-4 rounded-full mb-4 shadow-sm">
             <span className="text-4xl">📖</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-stone-800 mb-4">Góc Sen Tự Học</h1>
          <p className="text-stone-500 max-w-2xl mx-auto">Cẩm nang nuôi dưỡng, chăm sóc và huấn luyện mèo Maine Coon chuẩn khoa học được đúc kết từ kinh nghiệm thực tế của KinVie.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          <div className="lg:w-1/4">
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-sm border border-white/50 sticky top-32">

              <div className="mb-8">
                <h3 className="font-bold text-stone-800 mb-3 text-sm uppercase tracking-wider">Tìm kiếm</h3>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nhập từ khóa..."
                    className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:bg-white transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400">🔍</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-stone-800 mb-3 text-sm uppercase tracking-wider">Chủ đề</h3>
                <div className="flex flex-col gap-2">
                  {CATEGORIES.map(topic => (
                    <button
                      key={topic}
                      onClick={() => setActiveTab(topic)}
                      className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
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

          <div className="lg:w-3/4">

            {isLoading ? (
              <div className="py-32 text-center text-4xl text-pink-300 animate-spin">🐾</div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-32 bg-white/40 rounded-[3rem] border border-white">
                <div className="text-5xl mb-4 opacity-50">📰</div>
                <h3 className="text-2xl font-black text-stone-800">Chưa có bài viết nào</h3>
                <p className="text-stone-500 font-medium">Quay lại sau nhé, KinVie đang cập nhật thêm!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredBlogs.map((post) => (
                  <Link href={`/blog/${post.id}`} key={post.id} className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 hover:shadow-xl hover:shadow-pink-100/50 hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col cursor-pointer">

                    <div className="aspect-[16/10] bg-pink-50 flex items-center justify-center overflow-hidden relative">
                      {post.cover_image ? (
                        <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <span className="text-pink-300 text-xs px-2 text-center relative z-10">KINVIE BLOG</span>
                      )}
                      <div className="absolute inset-0 bg-pink-400/0 group-hover:bg-pink-400/10 transition-colors z-0"></div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-bold text-pink-400 uppercase tracking-wide bg-pink-50 px-3 py-1 rounded-full">
                          {post.category}
                        </span>
                        <span className="text-stone-400 text-xs flex items-center gap-1">
                          🗓️ {new Date(post.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-stone-800 mb-3 group-hover:text-pink-500 transition-colors leading-snug">
                        {post.title}
                      </h3>

                      <p className="text-stone-500 text-sm line-clamp-3 leading-relaxed mb-6 flex-1">
                        {getExcerpt(post.content)}
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

                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}