"use client";

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ALL_CATS } from '@/lib/mock-data';

export default function CatteryDetailsPage() {
  // --- STATE QUẢN LÝ BỘ LỌC ---
  const [filterBreed, setFilterBreed] = useState<string>('Tất cả');
  const [filterColor, setFilterColor] = useState<string>('Tất cả');
  const [filterAge, setFilterAge] = useState<string>('Tất cả');

  // Trích xuất các options filter không bị trùng lặp từ data gốc
  const breeds = ['Tất cả', ...Array.from(new Set(ALL_CATS.map(cat => cat.breed)))];
  const colors = ['Tất cả', 'Red Tabby', 'Silver Shade', 'Solid White', 'Black Tabby', 'Bicolor'];
  const ages = ['Tất cả', 'Kitten (2-4 tháng)', 'Junior (5-8 tháng)', 'Adult (> 8 tháng)'];

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredCats = ALL_CATS.filter(cat => {
    const matchBreed = filterBreed === 'Tất cả' || cat.breed === filterBreed;
    const matchColor = filterColor === 'Tất cả' || cat.color === filterColor;
    const matchAge = filterAge === 'Tất cả' || cat.age === filterAge;
    return matchBreed && matchColor && matchAge;
  });

  return (
    <div className="min-h-screen bg-white text-stone-700 font-sans">
      <Header />

      <main className="pt-32 pb-20 container mx-auto px-4 relative z-10">
        
        {/* TIÊU ĐỀ TRANG */}
        <div className="text-center mb-12">
          <div className="inline-block bg-pink-50 p-4 rounded-full mb-4">
             <span className="text-4xl">👑</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-4">Đàn Mèo Của KinVie</h1>
          <p className="text-stone-500 max-w-2xl mx-auto">Sử dụng bộ lọc bên dưới để tìm kiếm bé mèo phù hợp với sở thích và không gian sống của bạn nhất nhé!</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* CỘT TRÁI: BỘ LỌC (FILTER) */}
          <div className="lg:w-1/4">
            <div className="bg-pink-50/50 p-6 rounded-[2rem] border border-pink-100 sticky top-32">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <span>🔍</span> Bộ Lọc Tìm Kiếm
              </h3>

              {/* Lọc Giống Mèo */}
              <div className="mb-6">
                <h4 className="font-semibold text-stone-800 text-sm mb-3 uppercase tracking-wider">Giống Mèo</h4>
                <div className="flex flex-wrap gap-2">
                  {breeds.map(breed => (
                    <button 
                      key={breed}
                      onClick={() => setFilterBreed(breed)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterBreed === breed ? 'bg-pink-400 text-white shadow-md shadow-pink-200' : 'bg-white text-stone-600 hover:bg-pink-100 border border-pink-50'}`}
                    >
                      {breed}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lọc Màu Sắc */}
              <div className="mb-6">
                <h4 className="font-semibold text-stone-800 text-sm mb-3 uppercase tracking-wider">Màu Lông</h4>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button 
                      key={color}
                      onClick={() => setFilterColor(color)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterColor === color ? 'bg-pink-400 text-white shadow-md shadow-pink-200' : 'bg-white text-stone-600 hover:bg-pink-100 border border-pink-50'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lọc Độ Tuổi */}
              <div className="mb-6">
                <h4 className="font-semibold text-stone-800 text-sm mb-3 uppercase tracking-wider">Độ Tuổi</h4>
                <div className="flex flex-col gap-2">
                  {ages.map(age => (
                    <label key={age} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${filterAge === age ? 'border-pink-500 bg-pink-500' : 'border-pink-200 group-hover:border-pink-400'}`}>
                        {filterAge === age && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <span className={`text-sm ${filterAge === age ? 'font-bold text-pink-600' : 'text-stone-600'}`}>{age}</span>
                      <input 
                        type="radio" 
                        name="ageFilter" 
                        className="hidden" 
                        checked={filterAge === age}
                        onChange={() => setFilterAge(age)} 
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Nút Reset */}
              <button 
                onClick={() => { setFilterBreed('Tất cả'); setFilterColor('Tất cả'); setFilterAge('Tất cả'); }}
                className="w-full mt-4 py-3 border-2 border-pink-200 text-pink-500 font-bold rounded-2xl hover:bg-pink-50 transition-colors"
              >
                Xóa Bộ Lọc
              </button>
            </div>
          </div>

          {/* CỘT PHẢI: DANH SÁCH MÈO */}
          <div className="lg:w-3/4">
            
            <div className="flex justify-between items-center mb-6">
              <p className="text-stone-500">Tìm thấy <span className="font-bold text-pink-500">{filteredCats.length}</span> bé phù hợp</p>
              
              <select className="bg-white border border-pink-100 px-4 py-2 rounded-xl text-stone-600 focus:outline-none focus:border-pink-300">
                <option>Mới nhất</option>
                <option>Giá tăng dần</option>
                <option>Giá giảm dần</option>
              </select>
            </div>

            {/* Lưới hiển thị mèo */}
            {filteredCats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCats.map((cat) => (
                  <div key={cat.id} className="bg-white rounded-[2rem] p-3 shadow-sm hover:shadow-xl hover:shadow-pink-100/50 transition-all duration-300 border border-pink-50 group flex flex-col">
                    
                    {/* Hình ảnh */}
                    <div className="aspect-[4/5] bg-pink-50 rounded-t-[40%] rounded-b-3xl flex items-center justify-center overflow-hidden relative mb-4">
                      <span className="text-pink-300 text-sm px-4 text-center">{cat.img}</span>
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-stone-600 shadow-sm flex items-center gap-1">
                        <span>🏷️</span> {cat.breed}
                      </div>
                    </div>
                    
                    {/* Thông tin */}
                    <div className="px-3 pb-3 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-stone-800">{cat.name}</h3>
                        <span className="text-pink-500 font-black">{cat.price}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-stone-100 text-stone-600 text-xs px-2 py-1 rounded-md">{cat.color}</span>
                        <span className="bg-rose-50 text-rose-500 text-xs px-2 py-1 rounded-md">{cat.age}</span>
                      </div>
                      
                      <div className="mt-auto pt-2">
                        <button className="w-full bg-pink-50 text-pink-600 font-bold py-3 rounded-2xl group-hover:bg-pink-400 group-hover:text-white transition-colors duration-300 flex justify-center items-center gap-2">
                          Xem Chi Tiết <span>➔</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              // Empty state
              <div className="bg-pink-50/50 border-2 border-dashed border-pink-200 rounded-[3rem] p-12 text-center flex flex-col items-center justify-center h-[50vh]">
                <span className="text-6xl mb-4 grayscale opacity-50">😿</span>
                <h3 className="text-2xl font-bold text-stone-700 mb-2">Chưa tìm thấy bé nào!</h3>
                <p className="text-stone-500 max-w-md">Hiện tại KinVie chưa có bé nào khớp với bộ lọc của Sen. Hãy thử chọn màu sắc hoặc độ tuổi khác nhé.</p>
                <button 
                  onClick={() => { setFilterBreed('Tất cả'); setFilterColor('Tất cả'); setFilterAge('Tất cả'); }}
                  className="mt-6 bg-pink-400 text-white px-6 py-3 rounded-full font-bold shadow-md hover:bg-pink-500 transition-colors"
                >
                  Xem lại tất cả
                </button>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}