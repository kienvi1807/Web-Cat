"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function BlogDetailPage() {
  const params = useParams();
  const blogId = params.id as string;

  const [blog, setBlog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (blogId) fetchBlog();
  }, [blogId]);

  const fetchBlog = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', blogId)
      .maybeSingle();

    if (!error && data) setBlog(data);
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Đang tải bài viết..." />;
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Header />
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-2xl font-black text-stone-800 mb-4">Không tìm thấy bài viết</h2>
          <Link href="/blog" className="text-pink-500 font-bold hover:underline">← Quay lại Blog</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-700 font-sans">
      <Header />

      <main className="pt-32 pb-20">
        <article className="max-w-3xl mx-auto px-4">

          <Link href="/blog" className="inline-flex items-center gap-2 text-stone-400 font-bold hover:text-pink-500 transition-colors mb-8">
            ← Quay lại Blog
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-bold text-pink-500 uppercase tracking-wide bg-pink-50 px-3 py-1.5 rounded-full">
              {blog.category}
            </span>
            <span className="text-stone-400 text-sm">
              🗓️ {new Date(blog.created_at).toLocaleDateString('vi-VN')}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-serif font-black text-stone-800 mb-8 leading-tight">
            {blog.title}
          </h1>

          {blog.cover_image && (
            <div className="aspect-[16/9] rounded-[2rem] overflow-hidden mb-10 shadow-lg">
              <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* 🎯 RENDER TỪNG KHỐI NỘI DUNG THEO ĐÚNG THỨ TỰ ĐÃ SOẠN */}
          <div className="max-w-none">
            {(blog.content || []).map((block: any) => {
              if (block.type === 'image' && block.value) {
                return (
                  <div key={block.id} className="my-8 rounded-3xl overflow-hidden shadow-sm">
                    <img src={block.value} alt="" className="w-full h-auto" />
                  </div>
                );
              }
              if (block.type === 'text' && block.value) {
                return (
                  <p key={block.id} className="text-stone-700 text-lg leading-relaxed mb-6 whitespace-pre-line">
                    {block.value}
                  </p>
                );
              }
              return null;
            })}
          </div>

        </article>
      </main>

      <Footer />
    </div>
  );
}