"use client";
import React from 'react';
import Link from 'next/link';

export default function AdminOrders() {
  return (
    <div className="flex h-screen bg-stone-100 font-sans overflow-hidden">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="h-20 flex items-center justify-center border-b border-slate-800"><span className="text-white font-serif italic font-bold text-xl">🐾 Admin Panel</span></div>
        <nav className="p-4 space-y-2"><Link href="/admin" className="block px-4 py-3 rounded-xl hover:bg-slate-800">⬅️ Trở về Hub</Link></nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto bg-stone-50">
        <header className="h-20 bg-white border-b border-stone-200 flex items-center px-8 shrink-0">
          <h1 className="text-xl font-bold text-stone-800">📦 Theo dõi Đơn Hàng (Kanban Board)</h1>
        </header>

        <div className="p-8 flex gap-6 overflow-x-auto h-full items-start">
          
          {/* CỘT 1: Chờ xác nhận */}
          <div className="w-80 bg-stone-100/50 rounded-3xl p-4 border border-stone-200 shrink-0">
            <h3 className="font-bold text-stone-700 mb-4 flex justify-between">Chờ xác nhận <span className="bg-orange-200 text-orange-700 px-2 rounded-full text-xs flex items-center">2</span></h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 cursor-grab hover:border-orange-300 transition-colors">
                <div className="flex justify-between text-xs text-stone-400 mb-2"><span>#KV-1004</span><span>10 phút trước</span></div>
                <h4 className="font-bold text-stone-800">Nguyễn Thu Hà</h4>
                <p className="text-sm text-stone-500 mb-3">1x Bát ăn chống gù, 2x Pate</p>
                <div className="flex justify-between items-center border-t border-stone-50 pt-2">
                  <span className="font-black text-rose-500">210.000đ</span>
                  <button className="bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-lg">Duyệt đơn</button>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT 2: Đang giao hàng */}
          <div className="w-80 bg-stone-100/50 rounded-3xl p-4 border border-stone-200 shrink-0">
            <h3 className="font-bold text-stone-700 mb-4 flex justify-between">Đang giao hàng <span className="bg-blue-200 text-blue-700 px-2 rounded-full text-xs flex items-center">1</span></h3>
            <div className="space-y-4">
               <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 cursor-grab hover:border-blue-300">
                <div className="flex justify-between text-xs text-stone-400 mb-2"><span>#KV-1002</span><span>Hôm qua</span></div>
                <h4 className="font-bold text-stone-800">Trần Văn B</h4>
                <p className="text-sm text-stone-500 mb-3">1x Cần câu lông vũ</p>
                <div className="flex justify-between items-center border-t border-stone-50 pt-2">
                  <span className="font-black text-rose-500">35.000đ</span>
                  <span className="text-xs text-blue-500 font-bold">🚚 Đang ship</span>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT 3: Hoàn thành */}
          <div className="w-80 bg-stone-100/50 rounded-3xl p-4 border border-stone-200 shrink-0">
            <h3 className="font-bold text-stone-700 mb-4 flex justify-between">Đã hoàn thành <span className="bg-green-200 text-green-700 px-2 rounded-full text-xs flex items-center">15</span></h3>
            <div className="space-y-4 opacity-70">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                <div className="flex justify-between text-xs text-stone-400 mb-2"><span>#KV-1001</span><span>28/03/2026</span></div>
                <h4 className="font-bold text-stone-800 line-through decoration-stone-300">Nguyễn Trung Kiên</h4>
                <div className="flex justify-between items-center border-t border-stone-50 pt-2 mt-3">
                  <span className="font-black text-stone-400">1.200.000đ</span>
                  <span className="text-xs text-green-500 font-bold">✅ Xong</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}