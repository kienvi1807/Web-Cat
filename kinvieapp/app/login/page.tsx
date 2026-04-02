"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  // State để chuyển đổi qua lại giữa form Đăng Nhập và Đăng Ký
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="min-h-screen bg-pink-50/30 flex items-center justify-center font-sans relative overflow-hidden p-4">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-200/40 rounded-full mix-blend-multiply blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-rose-100/50 rounded-full mix-blend-multiply blur-[80px] pointer-events-none"></div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-pink-50 w-full max-w-4xl flex overflow-hidden relative z-10">
        
        {/* CỘT TRÁI: Hình ảnh minh họa (Ẩn trên mobile) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-pink-100 to-rose-100 p-10 flex-col items-center justify-center relative">
          <Link href="/" className="absolute top-8 left-8 bg-white/50 backdrop-blur w-10 h-10 flex items-center justify-center rounded-full hover:bg-white transition-colors">
             <span className="text-stone-600 text-sm">❮</span>
          </Link>
          <div className="w-48 h-48 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-7xl mb-8 shadow-inner border border-white/50">
            🐱
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-800 text-center mb-4">
            Beam Petshop & <br/> KinVie Cattery
          </h2>
          <p className="text-stone-500 text-center max-w-xs text-sm leading-relaxed">
            Đăng nhập ngay để theo dõi lịch sử đón mèo, tích điểm mua sắm và nhận các ưu đãi đặc quyền cho Boss!
          </p>
        </div>

        {/* CỘT PHẢI: Form Đăng nhập / Đăng ký */}
        <div className="w-full md:w-1/2 p-8 sm:p-12">
          
          <div className="md:hidden mb-8">
            <Link href="/" className="text-stone-400 hover:text-pink-500 text-sm flex items-center gap-2">
              <span>❮</span> Quay lại trang chủ
            </Link>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-2">
            {isLoginView ? 'Chào mừng Sen trở lại!' : 'Tạo tài khoản mới'}
          </h2>
          <p className="text-stone-500 text-sm mb-8">
            {isLoginView ? 'Đăng nhập để tiếp tục trải nghiệm mua sắm.' : 'Đăng ký ngay để nhận voucher 50K cho đơn hàng đầu tiên.'}
          </p>

          {/* CÁC NÚT ĐĂNG NHẬP MẠNG XÃ HỘI */}
          <div className="flex flex-col gap-3 mb-8">
            <button className="w-full border border-stone-200 hover:border-pink-300 hover:bg-pink-50 text-stone-600 font-medium py-3 rounded-xl flex items-center justify-center gap-3 transition-colors">
              <span className="text-xl">🇬</span> Tiếp tục với Google (Gmail)
            </button>
            <button className="w-full border border-stone-200 hover:border-blue-300 hover:bg-blue-50 text-stone-600 font-medium py-3 rounded-xl flex items-center justify-center gap-3 transition-colors">
              <span className="text-xl text-blue-600">🇫</span> Tiếp tục với Facebook
            </button>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-stone-100"></div>
            <span className="text-xs text-stone-400 font-medium uppercase">Hoặc dùng số điện thoại</span>
            <div className="flex-1 h-px bg-stone-100"></div>
          </div>

          {/* FORM ĐIỀN THÔNG TIN */}
          <form className="space-y-4">
            
            {!isLoginView && (
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Họ và tên</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Nguyễn Trung Kiên" 
                  className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:bg-white transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Số điện thoại</label>
              <input 
                type="tel" 
                placeholder="09xx xxx xxx" 
                className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-stone-500 uppercase">Mật khẩu</label>
                {isLoginView && (
                  <a href="#" className="text-xs text-pink-500 hover:underline">Quên mật khẩu?</a>
                )}
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 focus:bg-white transition-colors"
              />
            </div>

            {/* Nút Submit fake (Đưa về trang profile) */}
            <Link 
              href="/profile" 
              className="w-full bg-pink-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center hover:bg-pink-600 shadow-md shadow-pink-200 mt-6 block text-center"
            >
              {isLoginView ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
            </Link>
          </form>

          {/* NÚT TOGGLE ĐỔI FORM */}
          <div className="mt-8 text-center text-sm text-stone-500">
            {isLoginView ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button 
              onClick={() => setIsLoginView(!isLoginView)}
              className="text-pink-500 font-bold hover:underline"
            >
              {isLoginView ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}