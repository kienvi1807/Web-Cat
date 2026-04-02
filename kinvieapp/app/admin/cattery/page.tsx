"use client";

import React from 'react';
import Link from 'next/link';

export default function AdminAddCat() {
  return (
    <div className="flex h-screen bg-stone-100 font-sans overflow-hidden">
      
      {/* SIDEBAR TÓM TẮT (Giữ nguyên bố cục để có cảm giác đang trong Admin) */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="h-20 flex items-center justify-center border-b border-slate-800">
          <span className="text-white font-serif italic font-bold text-xl flex items-center gap-2">
            <span>🐾</span> Admin Panel
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
            <span>⬅️</span> Trở về Hub
          </Link>
          <div className="flex items-center gap-3 bg-slate-800 text-white px-4 py-3 rounded-xl mt-4">
            <span>🐱</span> Mèo Maine Coon
          </div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto">
        
        <header className="h-20 bg-white border-b border-stone-200 flex items-center px-8 shrink-0">
          <h1 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <span className="text-stone-400 font-normal">Cattery /</span> Thêm bé mèo mới
          </h1>
        </header>

        <div className="p-8 max-w-4xl">
          <div className="bg-white rounded-[2rem] border border-stone-200 p-8 shadow-sm">
            <form className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tên Mèo */}
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Tên bé (VD: Bé Bánh Bao)</label>
                  <input type="text" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:outline-none focus:border-pink-500" placeholder="Nhập tên..." />
                </div>
                
                {/* Màu sắc */}
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Màu lông</label>
                  <select className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:outline-none focus:border-pink-500">
                    <option>Red Tabby</option>
                    <option>Silver Shade</option>
                    <option>Solid White</option>
                    <option>Bicolor</option>
                    <option>Khác...</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Độ tuổi */}
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Độ tuổi</label>
                  <select className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:outline-none focus:border-pink-500">
                    <option>Kitten (2-4 tháng)</option>
                    <option>Junior (5-8 tháng)</option>
                    <option>Adult (~8 tháng)</option>
                  </select>
                </div>

                {/* Giá bán */}
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Giá đón (VNĐ)</label>
                  <input type="text" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl focus:outline-none focus:border-pink-500" placeholder="VD: 25.000.000" />
                </div>
              </div>

              {/* Upload Ảnh */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Hình ảnh (Thumbnail)</label>
                <div className="border-2 border-dashed border-stone-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer">
                  <span className="text-4xl mb-2">📸</span>
                  <p className="text-stone-500 text-sm">Kéo thả ảnh vào đây hoặc bấm để chọn file</p>
                </div>
              </div>

              {/* Nút Submit */}
              <div className="flex justify-end gap-4 pt-4 border-t border-stone-100">
                <button type="button" className="px-6 py-3 rounded-xl font-bold text-stone-500 hover:bg-stone-100 transition-colors">Hủy bỏ</button>
                <button type="button" className="px-8 py-3 rounded-xl font-bold text-white bg-pink-500 hover:bg-pink-600 shadow-md shadow-pink-200 transition-colors">
                  Đăng Bán Ngay
                </button>
              </div>

            </form>
          </div>
        </div>

      </main>
    </div>
  );
}