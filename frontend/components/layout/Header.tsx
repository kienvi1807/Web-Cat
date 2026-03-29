import React from 'react';

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-pink-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Menu Trái */}
        <nav className="hidden md:flex gap-8 font-medium text-stone-600">
          <a href="#" className="text-pink-500 font-bold border-b-2 border-pink-500 pb-1">Trang Chủ</a>
          <a href="#kinvie-cattery" className="hover:text-pink-400 transition-colors">KinVie Cattery</a>
          <a href="#beam-petshop" className="hover:text-pink-400 transition-colors">Beam Petshop</a>
        </nav>

        {/* Logo Trung Tâm (Mô phỏng logo vòng hoa) */}
        <div className="flex flex-col items-center justify-center cursor-pointer absolute left-1/2 transform -translate-x-1/2">
          <div className="relative flex items-center justify-center">
             <div className="absolute inset-0 border-2 border-pink-200 border-dashed rounded-full animate-[spin_10s_linear_infinite] w-12 h-12 m-auto"></div>
             <div className="bg-white w-9 h-9 flex items-center justify-center rounded-full shadow-sm relative z-10 m-1">
               <span className="text-lg">🐾</span>
             </div>
          </div>
          <span className="font-serif italic font-bold text-lg text-pink-500 mt-1">KinVie</span>
        </div>

        {/* Menu Phải */}
        <nav className="hidden md:flex gap-8 font-medium text-stone-600 items-center">
          <a href="#blog" className="hover:text-pink-400 transition-colors">Blog / Kiến Thức</a>
          <button className="bg-pink-50 w-9 h-9 flex items-center justify-center rounded-full hover:bg-pink-100 transition-colors">
            <span className="text-pink-500 text-sm">💖</span>
          </button>
          <button className="flex items-center gap-2 bg-pink-400 text-white px-5 py-2.5 rounded-full hover:bg-pink-500 transition-colors shadow-lg shadow-pink-200/50 font-medium">
            <span>🛍️</span> Giỏ Hàng
          </button>
        </nav>

      </div>
    </header>
  );
}