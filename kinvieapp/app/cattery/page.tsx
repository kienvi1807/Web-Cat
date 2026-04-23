"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
// 🌟 GỌI THẺ CATCARD TỪ COMMON VÀO ĐÂY
import CatCard from '@/components/common/CatCard';

// 🎯 BỘ TỪ ĐIỂN DỊCH MÀU EMS
const EMS_COLORS: Record<string, string> = {
  'NS11': 'Black Silver Shaded', 'NS 11': 'Black Silver Shaded',
  'NS12': 'Black Silver Shell', 'NS 12': 'Black Silver Shell',
  'N22': 'Black Classic Tabby', 'N 22': 'Black Classic Tabby',
  'NS22': 'Black Silver Classic Tabby', 'NS 22': 'Black Silver Classic Tabby',
  'N23': 'Black Mackerel Tabby', 'N 23': 'Black Mackerel Tabby',
  'NS23': 'Black Silver Mackerel Tabby', 'NS 23': 'Black Silver Mackerel Tabby',
  'N24': 'Black Spotted Tabby', 'N 24': 'Black Spotted Tabby',
  'NS24': 'Black Silver Spotted Tabby', 'NS 24': 'Black Silver Spotted Tabby',
  'D22': 'Red Classic Tabby', 'D 22': 'Red Classic Tabby',
  'DS22': 'Red Silver Classic Tabby', 'DS 22': 'Red Silver Classic Tabby',
  'D24': 'Red Spotted Tabby', 'D 24': 'Red Spotted Tabby',
  'W': 'Solid White', 'N': 'Solid Black', 'A': 'Solid Blue',
  'D': 'Solid Red', 'E': 'Solid Cream', 'F': 'Black Tortie',
  'FS': 'Black Tortie Smoke', 'G': 'Blue Tortie',
  'N03': 'Black Bicolor', 'N 03': 'Black Bicolor',
  'A03': 'Blue Bicolor', 'A 03': 'Blue Bicolor',
  'D03': 'Red Bicolor', 'D 03': 'Red Bicolor',
  'F03': 'Black Tortie Bicolor', 'F 03': 'Black Tortie Bicolor',
  'N09': 'Black & White', 'N 09': 'Black & White',
  'NS09': 'Black Silver & White', 'NS 09': 'Black Silver & White',
  'NS 22 03': 'Black Silver Classic Bicolor', 'NS2203': 'Black Silver Classic Bicolor'
};

const getColorName = (code: string) => {
  if (!code) return 'Khác';
  const cleanCode = code.trim().toUpperCase();
  return EMS_COLORS[cleanCode] || code;
};

const getAgeInMonths = (dob: string) => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12 + today.getMonth() - birthDate.getMonth();
  if (today.getDate() < birthDate.getDate()) {
    months--;
  }
  return Math.max(0, months);
};

const getAgeCategory = (dob: string) => {
  if (!dob) return 'Chưa rõ';
  const months = getAgeInMonths(dob);
  if (months <= 4) return 'Kitten (2-4 tháng)';
  if (months <= 8) return 'Junior (5-8 tháng)';
  return 'Adult (> 8 tháng)';
};

export default function CatteryDetailsPage() {
  const [cats, setCats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterBreed, setFilterBreed] = useState<string>('Tất cả');
  const [filterColor, setFilterColor] = useState<string>('Tất cả');
  const [filterAge, setFilterAge] = useState<string>('Tất cả');
  const [sortOption, setSortOption] = useState<string>('newest');

  // 🌟 STATE CHO BỘ LỌC ĐIỆN THOẠI VÀ MÁY TÍNH
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from('cats')
        .select('*')
        .in('status', ['Sẵn sàng', 'Đã cọc']);

      if (data) {
        setCats(data);
      }
      setIsLoading(false);
    };
    fetchCats();
  }, []);

  const breeds = ['Tất cả', ...Array.from(new Set(cats.map(cat => cat.breed || 'Khác')))];
  const colors = ['Tất cả', ...Array.from(new Set(cats.map(cat => getColorName(cat.color))))];
  const ages = ['Tất cả', 'Kitten (2-4 tháng)', 'Junior (5-8 tháng)', 'Adult (> 8 tháng)'];

  let filteredCats = cats.filter(cat => {
    const matchBreed = filterBreed === 'Tất cả' || cat.breed === filterBreed;
    const matchColor = filterColor === 'Tất cả' || getColorName(cat.color) === filterColor;
    const matchAge = filterAge === 'Tất cả' || getAgeCategory(cat.dob) === filterAge;
    return matchBreed && matchColor && matchAge;
  });

  if (sortOption === 'price_asc') filteredCats.sort((a, b) => (a.price || 0) - (b.price || 0));
  if (sortOption === 'price_desc') filteredCats.sort((a, b) => (b.price || 0) - (a.price || 0));
  if (sortOption === 'newest') filteredCats.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="min-h-screen bg-[#FFF8FA] text-stone-700 font-sans selection:bg-pink-200">
      <Header />

      <main className="pt-28 pb-24 container mx-auto px-4 lg:px-8 relative z-10">
        
        <div className="text-center mb-10 md:mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-200/50 rounded-full blur-[80px] -z-10"></div>
          <div className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-white border border-pink-100 text-pink-500 text-xs font-black uppercase tracking-widest mb-6 shadow-sm">
            <span className="text-lg">👑</span> Showroom Độc Quyền
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-stone-800 mb-6 tracking-tight">
            Đàn Mèo Của <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400 font-serif italic pr-2">KinVie</span>
          </h1>
          <p className="text-stone-500 max-w-2xl mx-auto text-sm md:text-lg font-medium">
            Sử dụng bộ lọc thông minh bên dưới để tìm kiếm bé Maine Coon phù hợp với sở thích và không gian sống của bạn nhất nhé!
          </p>
        </div>

        <div className="flex flex-col lg:flex-row">
          
          {/* NỀN TỐI CHE MÀN HÌNH KHI MỞ BỘ LỌC ĐIỆN THOẠI */}
          <div 
            className={`fixed inset-0 bg-stone-900/50 z-40 backdrop-blur-sm transition-opacity lg:hidden ${isMobileFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* =======================================
              CỘT TRÁI: BỘ LỌC (SLIDE MƯỢT TRÊN PC & ĐT)
              ======================================= */}
          <div className={`
            fixed inset-y-0 left-0 z-50 transition-all duration-500 ease-in-out
            lg:static lg:z-auto lg:shrink-0
            ${isMobileFilterOpen ? 'translate-x-0 w-[85%] max-w-sm' : '-translate-x-full w-[85%] max-w-sm'}
            ${isDesktopFilterOpen ? 'lg:w-1/4 lg:translate-x-0 lg:opacity-100 lg:pr-10 lg:overflow-visible' : 'lg:w-0 lg:opacity-0 lg:-translate-x-10 lg:pr-0 lg:overflow-hidden'}
          `}>
            {/* Thêm min-w-[280px] để khi bóp chiều ngang lại chữ không bị móp méo */}
            <div className="w-full min-w-[280px] h-full overflow-y-auto bg-white p-6 md:p-8 border-r border-pink-100 shadow-2xl lg:bg-white/80 lg:backdrop-blur-xl lg:rounded-[2.5rem] lg:border lg:border-white lg:shadow-[0_20px_50px_-10px_rgba(236,72,153,0.1)] lg:sticky lg:top-28 lg:h-auto">
              
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-black text-xl text-stone-800 flex items-center gap-3">
                  <span className="text-2xl">⚡</span> Bộ Lọc Nhanh
                </h3>
                <button 
                  onClick={() => setIsMobileFilterOpen(false)} 
                  className="lg:hidden w-8 h-8 flex items-center justify-center bg-stone-100 rounded-full text-stone-500 hover:bg-pink-100 hover:text-pink-500"
                >
                  ✕
                </button>
              </div>

              <div className="mb-8">
                <h4 className="font-bold text-pink-400 text-xs mb-4 uppercase tracking-widest">Giống Mèo</h4>
                <div className="flex flex-col gap-2">
                  {breeds.map(breed => (
                    <button 
                      key={breed} onClick={() => setFilterBreed(breed)}
                      className={`text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${filterBreed === breed ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-md shadow-pink-200 translate-x-2' : 'bg-stone-50 text-stone-500 hover:bg-pink-50 hover:text-pink-500'}`}
                    >
                      {breed}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="font-bold text-pink-400 text-xs mb-4 uppercase tracking-widest">Màu Lông (EMS)</h4>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button 
                      key={color} onClick={() => setFilterColor(color)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${filterColor === color ? 'bg-stone-800 text-white border-stone-800 shadow-lg shadow-stone-300' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="font-bold text-pink-400 text-xs mb-4 uppercase tracking-widest">Độ Tuổi</h4>
                <div className="flex flex-col gap-3">
                  {ages.map(age => (
                    <label 
                      key={age} 
                      onClick={() => setFilterAge(age)} 
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${filterAge === age ? 'border-pink-500 bg-pink-500 scale-110' : 'border-stone-300 bg-white group-hover:border-pink-400'}`}>
                        {filterAge === age && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={`text-sm transition-colors ${filterAge === age ? 'font-black text-stone-800' : 'font-bold text-stone-500 group-hover:text-stone-700'}`}>{age}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => { setFilterBreed('Tất cả'); setFilterColor('Tất cả'); setFilterAge('Tất cả'); }}
                className="w-full py-4 border-2 border-pink-100 text-pink-500 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-pink-50 hover:border-pink-200 transition-all flex justify-center items-center gap-2 group"
              >
                <span>↺</span> Khôi Phục Gốc
              </button>
            </div>
          </div>

          {/* =======================================
              CỘT PHẢI: LƯỚI SHOWROOM MÈO
              ======================================= */}
          <div className="flex-1 w-full transition-all duration-500 min-w-0">
            
            {/* Header Lưới */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="flex items-center flex-wrap gap-3 w-full sm:w-auto">
                <p className="text-stone-500 font-medium text-sm md:text-base">
                  Tìm thấy <span className="font-black text-pink-500 text-xl mx-1">{filteredCats.length}</span> Boss
                </p>
                
                {/* NÚT MỞ BỘ LỌC DÀNH RIÊNG CHO ĐIỆN THOẠI */}
                <button 
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-stone-200 text-stone-700 font-bold text-sm hover:bg-pink-50 hover:text-pink-500 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  Lọc
                </button>

                {/* NÚT THU/MỞ BỘ LỌC DÀNH RIÊNG CHO MÁY TÍNH */}
                <button 
                  onClick={() => setIsDesktopFilterOpen(!isDesktopFilterOpen)}
                  className="hidden lg:flex items-center gap-2 bg-white px-4 py-2 ml-2 rounded-xl shadow-sm border border-stone-200 text-stone-700 font-bold text-sm hover:bg-pink-50 hover:text-pink-500 transition-all"
                >
                  <svg className={`w-4 h-4 transition-transform duration-300 ${!isDesktopFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                  </svg>
                  {isDesktopFilterOpen ? 'Ẩn bộ lọc' : 'Mở bộ lọc'}
                </button>
              </div>
              
              <div className="relative w-full sm:w-auto">
                <select 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full sm:w-auto appearance-none cursor-pointer bg-white border border-stone-200 px-6 py-3 pr-10 rounded-2xl text-sm font-bold text-stone-700 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all shadow-sm"
                >
                  <option value="newest">✨ Mới gia nhập</option>
                  <option value="price_asc">💎 Giá từ Thấp → Cao</option>
                  <option value="price_desc">👑 Giá từ Cao → Thấp</option>
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">▼</span>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-pink-400">
                <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-black uppercase tracking-widest animate-pulse">Đang rước các Boss ra...</h2>
              </div>
            ) : filteredCats.length > 0 ? (
              
              /* 🌟 ĐÃ FIX: Chỉ giữ nguyên tối đa 3 cột. Khi đóng bộ lọc thì 3 cột này giãn to ra */
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8 transition-all duration-500">
                {filteredCats.map((cat) => (
                  <CatCard key={cat.id} cat={cat} />
                ))}
              </div>

            ) : (
              <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_50px_-10px_rgba(236,72,153,0.1)] rounded-[3rem] p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center text-4xl mb-6 grayscale opacity-50 shadow-inner">😿</div>
                <h3 className="text-2xl md:text-3xl font-black text-stone-800 mb-4 tracking-tight">Vũ Trụ Cạn Kiệt Boss!</h3>
                <p className="text-stone-500 max-w-md text-sm md:text-lg font-medium mb-8">
                  Hiện tại KinVie chưa có bé nào khớp với bộ lọc khắt khe của Sen. Hãy thử nới lỏng tiêu chí tìm kiếm nhé.
                </p>
                <button 
                  onClick={() => { setFilterBreed('Tất cả'); setFilterColor('Tất cả'); setFilterAge('Tất cả'); }}
                  className="bg-stone-800 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs shadow-xl hover:bg-pink-500 hover:shadow-pink-500/30 hover:-translate-y-1 transition-all"
                >
                  Xóa Lọc & Xem Tất Cả
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