import React from 'react';
import { BlogPost } from '@/types';

export default function BlogPreview({ posts }: { posts: BlogPost[] }) {
  return (
    <section id="blog" className="container mx-auto px-4 mt-20 relative z-10">
      <div className="text-center mb-16">
        <div className="flex justify-center mb-4">
          <div className="bg-pink-50 w-16 h-16 flex items-center justify-center rounded-full"><span className="text-3xl">📖</span></div>
        </div>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-4">Góc Sen Tự Học</h2>
        <p className="text-stone-500 max-w-xl mx-auto">Cẩm nang nuôi dưỡng và chăm sóc mèo chuẩn khoa học từ đội ngũ KinVie.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {posts.map((post) => (
          <div key={post.id} className="flex flex-col sm:flex-row gap-6 bg-white rounded-[2rem] p-4 shadow-sm border border-pink-50 hover:shadow-xl hover:shadow-pink-100/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
            <div className="w-full sm:w-2/5 aspect-[4/3] bg-pink-50 rounded-3xl flex items-center justify-center overflow-hidden shrink-0 relative">
               <span className="text-pink-300 text-xs px-2 text-center relative z-10">{post.img}</span>
               <div className="absolute inset-0 bg-pink-400/0 group-hover:bg-pink-400/10 transition-colors z-0"></div>
            </div>
            <div className="flex flex-col justify-center py-2 pr-4">
              <span className="text-xs font-bold text-pink-400 mb-3 uppercase tracking-wide bg-pink-50 inline-block w-fit px-3 py-1 rounded-full">{post.date}</span>
              <h3 className="text-xl font-bold text-stone-800 mb-3 group-hover:text-pink-500 transition-colors leading-snug">{post.title}</h3>
              <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed">Khám phá những mẹo hay ho và chuẩn khoa học để giúp bé mèo nhà bạn khỏe mạnh, xinh đẹp hơn mỗi ngày...</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}