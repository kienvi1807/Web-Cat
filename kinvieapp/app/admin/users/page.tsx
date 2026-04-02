"use client";
import React from 'react';
import Link from 'next/link';

export default function AdminUsers() {
  const users = [
    { id: 1, name: 'Nguyễn Trung Kiên', phone: '0988.xxx.xxx', rank: 'Kim Cương', total: '150.000.000đ', pets: 2 },
    { id: 2, name: 'Lê Diệu Linh', phone: '0912.xxx.xxx', rank: 'Vàng', total: '45.000.000đ', pets: 1 },
    { id: 3, name: 'Phạm Minh Tuấn', phone: '0903.xxx.xxx', rank: 'Đồng', total: '2.500.000đ', pets: 0 },
  ];

  return (
    <div className="flex h-screen bg-stone-100 font-sans overflow-hidden">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="h-20 flex items-center justify-center border-b border-slate-800"><span className="text-white font-serif italic font-bold text-xl">🐾 Admin Panel</span></div>
        <nav className="p-4 space-y-2"><Link href="/admin" className="block px-4 py-3 rounded-xl hover:bg-slate-800">⬅️ Trở về Hub</Link></nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-20 bg-white border-b border-stone-200 flex items-center px-8 shrink-0">
          <h1 className="text-xl font-bold text-stone-800">👥 Hệ thống Khách hàng (CRM)</h1>
        </header>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(user => (
            <div key={user.id} className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-full h-2 ${user.rank === 'Kim Cương' ? 'bg-gradient-to-r from-blue-400 to-cyan-300' : user.rank === 'Vàng' ? 'bg-yellow-400' : 'bg-orange-300'}`}></div>
              <div className="flex justify-between items-start mb-4 mt-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center text-xl">👤</div>
                  <div>
                    <h3 className="font-bold text-stone-800">{user.name}</h3>
                    <p className="text-xs text-stone-500">📞 {user.phone}</p>
                  </div>
                </div>
                <button className="text-stone-400 hover:text-pink-500">⚙️</button>
              </div>
              
              <div className="bg-stone-50 rounded-xl p-3 grid grid-cols-2 gap-2 mb-4">
                <div>
                  <p className="text-[10px] text-stone-400 uppercase font-bold">Hạng</p>
                  <p className="font-bold text-stone-700">{user.rank}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 uppercase font-bold">Đang nuôi</p>
                  <p className="font-bold text-stone-700">{user.pets} Boss</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center border-t border-stone-100 pt-4">
                <span className="text-xs text-stone-500">Tổng chi tiêu:</span>
                <span className="font-black text-pink-500">{user.total}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}