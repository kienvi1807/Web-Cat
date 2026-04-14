"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';

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

// Hàm tính chính xác số tháng tuổi
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

// Hàm phân loại để bộ lọc vẫn hiểu được Kitten/Junior/Adult
const getAgeCategory = (dob: string) => {
  if (!dob) return 'Chưa rõ';
  const months = getAgeInMonths(dob);
  if (months <= 4) return 'Kitten (2-4 tháng)';
  if (months <= 8) return 'Junior (5-8 tháng)';
  return 'Adult (> 8 tháng)';
};

const formatDateDisplay = (dateString: string) => {
  if (!dateString) return 'Chưa cập nhật';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export default function CatteryDetailsPage() {
  const [cats, setCats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likedCats, setLikedCats] = useState<number[]>([]);
  const [likesCount, setLikesCount] = useState<Record<number, number>>({});

  const [filterBreed, setFilterBreed] = useState<string>('Tất cả');
  const [filterColor, setFilterColor] = useState<string>('Tất cả');
  const [filterAge, setFilterAge] = useState<string>('Tất cả');
  const [sortOption, setSortOption] = useState<string>('newest');

  useEffect(() => {
    const fetchCats = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from('cats')
        .select('*')
        .in('status', ['Sẵn sàng', 'Đã cọc']);

      if (data) {
        setCats(data);
        const savedLikes = localStorage.getItem('kinvie_likes');
        if (savedLikes) setLikedCats(JSON.parse(savedLikes));
        const counts: Record<number, number> = {};
        data.forEach(cat => counts[cat.id] = cat.likes || 0);
        setLikesCount(counts);
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

  const toggleLike = async (e: React.MouseEvent, catId: number) => {
    e.preventDefault(); e.stopPropagation();
    const isLiked = likedCats.includes(catId);
    let newLikeCount;

    if (isLiked) {
      const newLikedArray = likedCats.filter(id => id !== catId);
      setLikedCats(newLikedArray);
      localStorage.setItem('kinvie_likes', JSON.stringify(newLikedArray));
      newLikeCount = Math.max(0, (likesCount[catId] || 0) - 1);
    } else {
      const newLikedArray = [...likedCats, catId];
      setLikedCats(newLikedArray);
      localStorage.setItem('kinvie_likes', JSON.stringify(newLikedArray));
      newLikeCount = (likesCount[catId] || 0) + 1;
    }
    setLikesCount({ ...likesCount, [catId]: newLikeCount });
    await supabase.from('cats').update({ likes: newLikeCount }).eq('id', catId);
  };

  const getFirstImage = (imageString: string) => {
    if (!imageString) return "https://images.unsplash.com/photo-1589883661923-6476cb0ae9f2?q=80&w=1000&auto=format&fit=crop";
    try {
      const parsed = JSON.parse(imageString);
      return Array.isArray(parsed) ? parsed[0] : imageString;
    } catch (e) { return imageString; }
  };

  return (
    <div className="min-h-screen bg-[#FFF8FA] text-stone-700 font-sans selection:bg-pink-200">
      <Header />

      <main className="pt-28 pb-24 container mx-auto px-4 lg:px-8 relative z-10">
        
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-200/50 rounded-full blur-[80px] -z-10"></div>
          <div className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-white border border-pink-100 text-pink-500 text-xs font-black uppercase tracking-widest mb-6 shadow-sm">
            <span className="text-lg">👑</span> Showroom Độc Quyền
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-stone-800 mb-6 tracking-tight">
            Đàn Mèo Của <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400 font-serif italic pr-2">KinVie</span>
          </h1>
          <p className="text-stone-500 max-w-2xl mx-auto text-lg font-medium">
            Sử dụng bộ lọc thông minh bên dưới để tìm kiếm bé Maine Coon phù hợp với sở thích và không gian sống của bạn nhất nhé!
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* CỘT TRÁI: BỘ LỌC */}
          <div className="lg:w-1/4">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-[0_20px_50px_-10px_rgba(236,72,153,0.1)] sticky top-28">
              <h3 className="font-black text-xl text-stone-800 mb-8 flex items-center gap-3">
                <span className="text-2xl">⚡</span> Bộ Lọc Nhanh
              </h3>

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

          {/* CỘT PHẢI: LƯỚI SHOWROOM MÈO */}
          <div className="lg:w-3/4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <p className="text-stone-500 font-medium">
                Tìm thấy <span className="font-black text-pink-500 text-xl">{filteredCats.length}</span> Boss siêu cấp VIP
              </p>
              
              <div className="relative">
                <select 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none cursor-pointer bg-white border border-stone-200 px-6 py-3 pr-10 rounded-2xl text-sm font-bold text-stone-700 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all shadow-sm"
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredCats.map((cat) => {
                  const isReady = cat.status === 'Sẵn sàng';
                  const isLiked = likedCats.includes(cat.id);
                  const displayLikes = likesCount[cat.id] || 0;
                  const colorFullName = getColorName(cat.color);
                  const monthsOld = getAgeInMonths(cat.dob);

                  return (
                    <article 
                      key={cat.id} 
                      className="group relative bg-white rounded-[3rem] p-4 border border-pink-50 shadow-[0_10px_40px_-10px_rgba(236,72,153,0.05)] hover:shadow-[0_20px_50px_-10px_rgba(236,72,153,0.2)] transition-all duration-700 hover:-translate-y-3 flex flex-col h-full"
                    >
                      <div className="aspect-[4/5] relative overflow-hidden rounded-[2.5rem] bg-pink-50/50 shrink-0">
                        <img
                          src={getFirstImage(cat.images)} 
                          alt={cat.name}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-pink-900/70 via-pink-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <button 
                          onClick={(e) => toggleLike(e, cat.id)}
                          className="absolute top-4 right-4 w-11 h-11 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-pink-50 hover:scale-110 transition-all shadow-md z-20"
                        >
                          <svg className={`w-6 h-6 transition-colors duration-300 ${isLiked ? 'text-rose-500 fill-rose-500' : 'text-pink-300 fill-transparent hover:text-rose-400'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isLiked ? "0" : "2"}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {displayLikes > 0 && <span className="absolute -bottom-2 -right-1 bg-white border border-pink-100 text-rose-500 text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm">{displayLikes}</span>}
                        </button>

                        <div className="absolute bottom-5 left-5 right-5 opacity-0 group-hover:opacity-100 translate-y-8 group-hover:translate-y-0 transition-all duration-500 delay-75 z-10">
                          <Link href={`/cattery/${cat.id}`} className="w-full bg-white/95 backdrop-blur-xl text-pink-500 font-black py-4 rounded-[1.5rem] hover:bg-pink-500 hover:text-white transition-colors duration-300 shadow-[0_10px_20px_rgba(236,72,153,0.15)] flex items-center justify-center gap-2">
                            Xem Hồ Sơ Bé <span>➔</span>
                          </Link>
                        </div>
                      </div>
                      
                      <div className="px-3 pt-5 pb-2 flex flex-col flex-grow">
                        {/* 🎯 ĐÃ XÓA CHỮ "KITTEN (2-4 THÁNG)" Ở GÓC PHẢI THẺ */}
                        <div className="mb-1.5">
                           <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest">{cat.breed || 'Maine Coon'}</span>
                        </div>
                        
                        <div className="flex flex-col mb-4">
                          <h3 className="text-2xl font-black text-stone-800 truncate mb-1">{cat.name}</h3>
                          <span className="text-xs font-bold text-stone-500 truncate mb-1">
                            Màu: <span className="text-pink-600">{colorFullName}</span>
                          </span>
                          <span className="text-xs font-bold text-stone-500 truncate">
                            Sinh: <span className="text-stone-700">{formatDateDisplay(cat.dob)}</span> 
                            <span className="text-pink-500 ml-1">({monthsOld} tháng)</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-pink-50/50">
                          <span className="font-black text-rose-500 text-lg">{cat.price ? `${cat.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}</span>
                          <span className={`text-xs font-bold transition-colors ${isReady ? 'text-emerald-500' : 'text-amber-500'}`}>{cat.status}</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_50px_-10px_rgba(236,72,153,0.1)] rounded-[3rem] p-12 text-center flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center text-4xl mb-6 grayscale opacity-50 shadow-inner">😿</div>
                <h3 className="text-3xl font-black text-stone-800 mb-4 tracking-tight">Vũ Trụ Cạn Kiệt Boss!</h3>
                <p className="text-stone-500 max-w-md text-lg font-medium mb-8">
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