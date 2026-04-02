"use client";

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { USER_DATA } from '@/lib/mock-data';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-700 font-sans">
      <Header />

      <main className="pt-32 pb-20 container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR TÓM TẮT (1/3) */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100 text-center">
              <div className="w-32 h-32 bg-pink-100 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl shadow-inner border-4 border-white">
                👤
              </div>
              <h1 className="text-2xl font-serif font-bold text-stone-800 mb-2">{USER_DATA.name}</h1>
              <div className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 shadow-md">
                Thành viên {USER_DATA.rank}
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-stone-50 pt-6">
                <div className="text-center">
                  <p className="text-xs text-stone-400 uppercase font-bold">Số Boss</p>
                  <p className="text-xl font-black text-pink-500">{USER_DATA.pets.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-stone-400 uppercase font-bold">Đơn hàng</p>
                  <p className="text-xl font-black text-stone-800">{USER_DATA.orders.length}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-pink-50 rounded-3xl p-6 border border-pink-100">
               <h4 className="font-bold text-pink-600 mb-2 flex items-center gap-2">
                 <span>⭐</span> Đặc quyền Kim Cương
               </h4>
               <ul className="text-xs text-stone-600 space-y-2">
                 <li>• Miễn phí vận chuyển mọi đơn hàng Petshop.</li>
                 <li>• Giảm 5% khi đón bé mèo tiếp theo tại Cattery.</li>
                 <li>• Ưu tiên tư vấn sức khỏe Boss 24/7.</li>
               </ul>
            </div>
          </div>

          {/* NỘI DUNG CHI TIẾT (2/3) */}
          <div className="lg:w-2/3 space-y-8">
            
            {/* Khối 1: Thông tin cá nhân */}
            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-stone-50 flex items-center justify-center rounded-lg">📝</span>
                Thông tin tài khoản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-stone-400 uppercase">Họ và tên</label>
                  <p className="text-stone-700 font-medium border-b border-stone-50 pb-2">{USER_DATA.name}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-400 uppercase">Tuổi</label>
                  <p className="text-stone-700 font-medium border-b border-stone-50 pb-2">{USER_DATA.age}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-400 uppercase">Số điện thoại</label>
                  <p className="text-stone-700 font-medium border-b border-stone-50 pb-2">{USER_DATA.phone}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-400 uppercase">Địa chỉ nhận hàng</label>
                  <p className="text-stone-700 font-medium border-b border-stone-50 pb-2">{USER_DATA.address}</p>
                </div>
              </div>
            </section>

            {/* Khối 2: Danh sách Boss đang chăm sóc */}
            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-stone-50 flex items-center justify-center rounded-lg">🐱</span>
                Boss nhà mình
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {USER_DATA.pets.map(pet => (
                  <div key={pet.id} className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex items-center gap-4 group hover:border-pink-200 transition-colors">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">😺</div>
                    <div>
                      <h4 className="font-bold text-stone-800">{pet.name}</h4>
                      <p className="text-xs text-stone-400">{pet.breed} • {pet.age}</p>
                      <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase mt-1 inline-block">
                        {pet.status}
                      </span>
                    </div>
                  </div>
                ))}
                <button className="border-2 border-dashed border-stone-200 rounded-2xl p-4 text-stone-400 font-bold hover:bg-stone-50 hover:border-pink-200 hover:text-pink-400 transition-all">
                  + Thêm Boss mới
                </button>
              </div>
            </section>

            {/* Khối 3: Lịch sử đơn hàng */}
            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-stone-50 flex items-center justify-center rounded-lg">📦</span>
                Lịch sử mua hàng
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-stone-400 text-xs uppercase border-b border-stone-50">
                      <th className="pb-4 font-bold">Mã ĐH</th>
                      <th className="pb-4 font-bold">Ngày mua</th>
                      <th className="pb-4 font-bold">Tổng tiền</th>
                      <th className="pb-4 font-bold">Trạng thái</th>
                      <th className="pb-4"></th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {USER_DATA.orders.map(order => (
                      <tr key={order.id} className="border-b border-stone-50 last:border-0">
                        <td className="py-4 font-bold text-stone-800">{order.id}</td>
                        <td className="py-4 text-stone-500">{order.date}</td>
                        <td className="py-4 font-bold text-rose-500">{order.total}</td>
                        <td className="py-4">
                          <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button className="text-pink-500 font-bold hover:underline">Chi tiết</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}