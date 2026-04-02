import React from 'react';
import Link from 'next/link';
import { Cat } from '@/types';

export default function CatteryList({ cats }: { cats: Cat[] }) {
  return (
    <section id="kinvie-cattery" className="container mx-auto px-4 mt-32 relative z-10">
      <div className="text-center mb-16">
        <div className="flex justify-center mb-4">
          <div className="bg-pink-50 w-16 h-16 flex items-center justify-center rounded-full"><span className="text-3xl">🐱</span></div>
        </div>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-4">KinVie Cattery</h2>
        <p className="text-stone-500 max-w-xl mx-auto">Những em bé Maine Coon mũm mĩm, form dáng chuẩn show đang chờ Sen tới đón về dinh.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cats.map((cat) => (
          <div key={cat.id} className="bg-white rounded-[2.5rem] p-4 shadow-sm hover:shadow-xl hover:shadow-pink-100/50 transition-all duration-300 border border-pink-50 group">
            <div className="aspect-[4/5] bg-gradient-to-br from-pink-50 to-rose-50 rounded-t-[50%] rounded-b-3xl flex items-center justify-center overflow-hidden relative mb-6 border-4 border-white shadow-inner">
              <img 
                src={cat.img} // <--- Nó sẽ lấy đường dẫn '/bemeo-1.jpg' từ file data
                alt={`Mèo Maine Coon - ${cat.name}`} // <--- Text mô tả cho SEO
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" // <--- Tailwind để ảnh khít khung và có hiệu ứng zoom nhẹ khi hover
              />
              {/* <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-pink-500 shadow-sm">
                Sẵn sàng về nhà
              </div> */}
            </div>
            <div className="px-4 text-center pb-4">
              <h3 className="text-2xl font-bold text-stone-800 mb-1">{cat.name}</h3>
              <p className="text-stone-500 text-sm mb-5">{cat.breed} &bull; {cat.color}</p>
              <button className="w-full bg-pink-50 text-pink-600 font-bold py-3.5 rounded-2xl group-hover:bg-pink-400 group-hover:text-white transition-colors duration-300">
                Xem Thông Tin Bố Mẹ
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <Link 
          href="/cattery" 
          className="text-pink-500 font-bold hover:text-pink-600 inline-flex items-center gap-2 px-6 py-3 rounded-full hover:bg-pink-50 transition-colors"
        >
          Xem tất cả các bé <span className="font-sans">➔</span>
        </Link>
      </div>
    </section>
  );
}