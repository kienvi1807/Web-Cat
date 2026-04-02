"use client";
import React from 'react';
import Link from 'next/link';

export default function AdminBlog() {
  return (
    <div className="flex h-screen bg-stone-100 font-sans overflow-hidden">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="h-20 flex items-center justify-center border-b border-slate-800"><span className="text-white font-serif italic font-bold text-xl">🐾 Admin Panel</span></div>
        <nav className="p-4 space-y-2"><Link href="/admin" className="block px-4 py-3 rounded-xl hover:bg-slate-800">⬅️ Trở về Hub</Link></nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-20 bg-white border-b border-stone-200 flex justify-between items-center px-8 shrink-0">
          <h1 className="text-xl font-bold text-stone-800">✍️ Soạn bài viết mới</h1>
          <div className="flex gap-3">
            <button className="bg-stone-100 text-stone-600 px-6 py-2 rounded-xl font-bold hover:bg-stone-200">Lưu nháp</button>
            <button className="bg-pink-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-pink-600 shadow-md">Xuất bản ngay</button>
          </div>
        </header>

        <div className="p-8 flex gap-8">
          
          {/* VÙNG SOẠN THẢO CHÍNH (2/3) */}
          <div className="flex-1 space-y-6">
            <input 
              type="text" 
              placeholder="Nhập tiêu đề bài viết thật kêu..." 
              className="w-full text-4xl font-serif font-bold bg-transparent border-none outline-none placeholder:text-stone-300 text-stone-800"
            />
            
            {/* Thanh công cụ Editor (Fake) */}
            <div className="bg-white border border-stone-200 rounded-2xl flex items-center p-2 gap-2 shadow-sm">
              <button className="w-8 h-8 rounded-lg hover:bg-stone-100 font-bold">B</button>
              <button className="w-8 h-8 rounded-lg hover:bg-stone-100 italic font-serif">I</button>
              <button className="w-8 h-8 rounded-lg hover:bg-stone-100 underline">U</button>
              <div className="w-px h-6 bg-stone-200 mx-2"></div>
              <button className="px-2 h-8 rounded-lg hover:bg-stone-100 text-sm">H1</button>
              <button className="px-2 h-8 rounded-lg hover:bg-stone-100 text-sm">H2</button>
              <div className="w-px h-6 bg-stone-200 mx-2"></div>
              <button className="w-8 h-8 rounded-lg hover:bg-stone-100">🔗</button>
              <button className="w-8 h-8 rounded-lg hover:bg-stone-100">🖼️</button>
            </div>

            <textarea 
              placeholder="Bắt đầu viết câu chuyện của bạn tại đây..." 
              className="w-full h-[500px] bg-white border border-stone-200 rounded-3xl p-8 outline-none focus:border-pink-300 resize-none text-stone-700 leading-relaxed shadow-sm"
            ></textarea>
          </div>

          {/* CỘT CÀI ĐẶT BÀI VIẾT (1/3) */}
          <div className="w-80 space-y-6 shrink-0">
            <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
              <h3 className="font-bold text-stone-800 mb-4">Danh mục</h3>
              <select className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl outline-none">
                <option>Cẩm nang Newbie</option>
                <option>Chăm sóc lông</option>
                <option>Dinh dưỡng</option>
              </select>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
              <h3 className="font-bold text-stone-800 mb-4">Ảnh bìa (Thumbnail)</h3>
              <div className="aspect-video bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-stone-400 hover:bg-stone-100 cursor-pointer transition-colors">
                <span className="text-2xl mb-2">📸</span>
                <span className="text-xs font-bold">Tải ảnh lên</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
              <h3 className="font-bold text-stone-800 mb-4">Cài đặt SEO</h3>
              <label className="text-xs font-bold text-stone-500 mb-2 block">Thẻ Meta Description</label>
              <textarea className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl text-sm outline-none h-24" placeholder="Mô tả ngắn hiển thị trên Google..."></textarea>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}