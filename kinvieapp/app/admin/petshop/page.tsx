"use client";
import React from 'react';
import Link from 'next/link';

export default function AdminPetshop() {
  const inventory = [
    { id: 'SP01', name: 'Hạt Mochi 2kg', category: 'Thức ăn', price: '12.000đ', stock: 150, status: 'Còn hàng' },
    { id: 'SP02', name: 'Pate cún Sen vàng 400g', category: 'Thức ăn', price: '39.000đ', stock: 12, status: 'Sắp hết' },
    { id: 'SP03', name: 'Cần câu lông vũ', category: 'Đồ chơi', price: '12.000đ', stock: 0, status: 'Hết hàng' },
    { id: 'SP04', name: 'Dưỡng lông Boss show', category: 'Chăm sóc', price: '125.000đ', stock: 45, status: 'Còn hàng' },
  ];

  return (
    <div className="flex h-screen bg-stone-100 font-sans overflow-hidden">
      {/* SIDEBAR TÓM TẮT (Copy sidebar cũ bỏ vào đây) */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="h-20 flex items-center justify-center border-b border-slate-800"><span className="text-white font-serif italic font-bold text-xl">🐾 Admin Panel</span></div>
        <nav className="p-4 space-y-2"><Link href="/admin" className="block px-4 py-3 rounded-xl hover:bg-slate-800">⬅️ Trở về Hub</Link></nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-20 bg-white border-b border-stone-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold text-stone-800">🏪 Quản lý Kho Petshop</h1>
          <button className="bg-pink-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-pink-600 shadow-md">+ Thêm sản phẩm</button>
        </header>

        <div className="p-8">
          <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <input type="text" placeholder="🔍 Tìm tên sản phẩm, mã SP..." className="w-96 px-4 py-2 rounded-xl border border-stone-200 focus:border-pink-400 outline-none" />
              <select className="px-4 py-2 rounded-xl border border-stone-200 bg-white outline-none"><option>Tất cả danh mục</option><option>Thức ăn</option><option>Đồ chơi</option></select>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-sm">
                  <th className="p-4 font-bold border-b border-stone-200">Mã SP</th>
                  <th className="p-4 font-bold border-b border-stone-200">Tên Sản Phẩm</th>
                  <th className="p-4 font-bold border-b border-stone-200">Danh mục</th>
                  <th className="p-4 font-bold border-b border-stone-200">Giá bán</th>
                  <th className="p-4 font-bold border-b border-stone-200">Tồn kho</th>
                  <th className="p-4 font-bold border-b border-stone-200">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {inventory.map(item => (
                  <tr key={item.id} className="hover:bg-pink-50/30 transition-colors border-b border-stone-100 last:border-0">
                    <td className="p-4 font-bold text-stone-600">{item.id}</td>
                    <td className="p-4 font-bold text-stone-800">{item.name}</td>
                    <td className="p-4 text-stone-500"><span className="bg-stone-100 px-2 py-1 rounded-md">{item.category}</span></td>
                    <td className="p-4 font-bold text-rose-500">{item.price}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{item.stock}</span>
                        {item.status === 'Còn hàng' && <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase font-bold">An toàn</span>}
                        {item.status === 'Sắp hết' && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full uppercase font-bold">Sắp hết</span>}
                        {item.status === 'Hết hàng' && <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full uppercase font-bold">Hết hàng</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <button className="text-blue-500 font-bold hover:underline mr-3">Sửa</button>
                      <button className="text-rose-500 font-bold hover:underline">Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}