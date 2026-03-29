import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-pink-50/50 pt-20 pb-10 mt-32 border-t border-pink-100 relative overflow-hidden">
      {/* Họa tiết Footer */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-200/40 rounded-full mix-blend-multiply blur-[80px] opacity-70 translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-100/40 rounded-full mix-blend-multiply blur-[60px] opacity-70 -translate-x-1/3 translate-y-1/3"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Cột 1: Logo & Intro (Chiếm 5 cột) */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white w-10 h-10 flex items-center justify-center rounded-full shadow-sm">
                <span className="text-sm">🐾</span>
              </div>
              <span className="font-serif italic font-bold text-2xl text-pink-500">KinVie Cattery</span>
            </div>
            <p className="text-stone-600 mb-6 leading-relaxed max-w-sm">
              Lan tỏa tình yêu thương đến những chú mèo Maine Coon. Chúng tôi cung cấp giải pháp toàn diện từ con giống khỏe mạnh đến dinh dưỡng chuẩn show.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-400 hover:bg-pink-400 hover:text-white transition-colors cursor-pointer shadow-sm font-bold text-sm">Fb</div>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-400 hover:bg-pink-400 hover:text-white transition-colors cursor-pointer shadow-sm font-bold text-sm">Ig</div>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-400 hover:bg-pink-400 hover:text-white transition-colors cursor-pointer shadow-sm font-bold text-sm">Tt</div>
            </div>
          </div>

          {/* Cột 2: Liên kết (Chiếm 3 cột) */}
          <div className="md:col-span-3">
            <h4 className="font-bold text-stone-800 text-lg mb-6 font-serif">Khám Phá</h4>
            <ul className="space-y-4 text-stone-600 font-medium">
              <li><a href="#kinvie-cattery" className="hover:text-pink-500 transition-colors flex items-center gap-2"><span className="text-xs">➔</span> Đàn Mèo Hiện Tại</a></li>
              <li><a href="#beam-petshop" className="hover:text-pink-500 transition-colors flex items-center gap-2"><span className="text-xs">➔</span> Sản Phẩm Khuyến Mãi</a></li>
              <li><a href="#blog" className="hover:text-pink-500 transition-colors flex items-center gap-2"><span className="text-xs">➔</span> Kiến Thức Đi Show</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors flex items-center gap-2"><span className="text-xs">➔</span> Chính Sách Bảo Hành</a></li>
            </ul>
          </div>

          {/* Cột 3: Liên hệ (Chiếm 4 cột) */}
          <div className="md:col-span-4">
            <h4 className="font-bold text-stone-800 text-lg mb-6 font-serif">Liên Hệ Với Sen</h4>
            <ul className="space-y-5 text-stone-600">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-400 shadow-sm shrink-0"><span>📍</span></div>
                <span className="mt-2">Đống Đa, Hà Nội, Việt Nam</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-400 shadow-sm shrink-0"><span>📞</span></div>
                <span>09xx.xxx.xxx</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-400 shadow-sm shrink-0"><span>✉️</span></div>
                <span>meow@kinvie.vn</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="text-center pt-8 border-t border-pink-200/60 text-stone-500 text-sm font-medium">
          &copy; 2026 Beam Petshop & KinVie Cattery. All rights reserved.
        </div>
      </div>
    </footer>
  );
}