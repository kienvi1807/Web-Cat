import React from 'react';
import { Product } from '@/types';

export default function PetshopGrid({ products }: { products: Product[] }) {
  return (
    <section id="beam-petshop" className="mt-32 relative py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-pink-50/50 to-white transform -skew-y-2 z-0"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white w-14 h-14 flex items-center justify-center rounded-2xl shadow-sm"><span className="text-2xl">🏪</span></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-4">Beam Petshop</h2>
            <p className="text-stone-500 max-w-md">Lựa chọn những món đồ xinh xắn, chất lượng và dinh dưỡng nhất để chăm sóc hoàng thượng.</p>
          </div>
          <button className="hidden md:flex text-pink-500 font-bold hover:text-pink-600 items-center gap-2 mb-2 bg-white px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all">
            Đến cửa hàng <span className="font-sans">➔</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-lg hover:shadow-pink-100/50 border border-transparent hover:border-pink-100 transition-all duration-300 group cursor-pointer relative">
               <button className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full text-pink-400 shadow-md opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 hover:bg-pink-50 hover:text-pink-600">
                 <span className="text-sm">🛍️</span>
               </button>
               <div className="aspect-square bg-stone-50 rounded-2xl flex items-center justify-center mb-5 overflow-hidden relative border border-stone-100">
                 <span className="text-stone-400 text-xs px-4 text-center">{product.img}</span>
               </div>
               <div className="px-2">
                 <p className="text-xs text-pink-400 font-bold uppercase tracking-wider mb-2">{product.category}</p>
                 <h3 className="font-bold text-stone-700 leading-snug mb-3 line-clamp-2 group-hover:text-pink-500 transition-colors">{product.name}</h3>
                 <p className="text-lg font-black text-rose-500">{product.price}</p>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}