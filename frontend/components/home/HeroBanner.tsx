import React from 'react';

export default function HeroBanner() {
  return (
    <section className="container mx-auto px-4 text-center">
      <div className="inline-block bg-white/80 border border-pink-100 text-pink-500 px-6 py-2 rounded-full font-medium text-sm mb-6 shadow-sm backdrop-blur-sm">
        ✨ Nơi tình yêu bốn chân bắt đầu
      </div>
      <h1 className="text-5xl md:text-7xl font-serif text-stone-800 font-bold mb-6 tracking-tight leading-tight">
        Beam Petshop & <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400 italic">KinVie Cattery</span>
      </h1>
      <p className="text-lg text-stone-500 max-w-2xl mx-auto mb-10 leading-relaxed">
        Chuyên nhân giống Maine Coon thuần chủng với kích thước khổng lồ, tính cách ngọt ngào. 
        Cung cấp phụ kiện, đồ ăn dinh dưỡng và sản phẩm đi show cao cấp nhất cho các Boss.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <a href="#kinvie-cattery" className="flex items-center justify-center gap-2 bg-pink-400 text-white px-8 py-4 rounded-full font-bold hover:bg-pink-500 hover:shadow-xl hover:shadow-pink-200 hover:-translate-y-1 transition-all duration-300">
          <span className="text-xl">🐱</span> Đón Mèo Con
        </a>
        <a href="#beam-petshop" className="flex items-center justify-center gap-2 bg-white text-pink-500 border-2 border-pink-100 px-8 py-4 rounded-full font-bold hover:bg-pink-50 hover:border-pink-200 transition-all duration-300 shadow-sm">
          <span className="text-xl">🏪</span> Mua Sắm Đồ Dùng
        </a>
      </div>

      <div className="mt-16 relative max-w-4xl mx-auto group">
         <div className="absolute inset-0 bg-pink-100 rounded-[3rem] transform -rotate-2 scale-105 -z-10 transition-transform group-hover:rotate-0"></div>
         <div className="bg-white p-4 rounded-[3rem] shadow-xl border border-pink-50 relative z-10">
           <div className="aspect-[21/9] bg-rose-50 rounded-[2.5rem] flex items-center justify-center overflow-hidden relative">
              <span className="text-pink-300 font-medium text-lg"></span>
              <div className="absolute inset-0 bg-gradient-to-t from-pink-100/40 to-transparent"></div>
           </div>
         </div>
      </div>
    </section>
  );
}