"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; 
import BackgroundGlow from '@/components/layout/BackgroundGlow';
import { useLayoutStore } from '@/store/useLayoutStore';

export default function KinVieCatteryPage() {
  const [catsList, setCatsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const setThemeColor = useLayoutStore(state => state.setThemeColor);

  useEffect(() => {
    setThemeColor('red'); // 👈 Ra lệnh cho BackgroundGlow chuyển tone Đỏ
  }, [setThemeColor]);

  // 🎯 FETCH DỮ LIỆU TỪ BACK-END SUPABASE
  useEffect(() => {
    fetchCats();
  }, []);

  const fetchCats = async () => {
    setIsLoading(true);
    
    // BƯỚC 1: Lấy danh sách ID của Boss (KinVie) từ bảng users
    const { data: bossUsers } = await supabase
      .from('users')
      .select('userid')
      .eq('type_id', 1);

    if (!bossUsers || bossUsers.length === 0) {
      console.error("Không tìm thấy User nào là Boss (type_id = 1)");
      setIsLoading(false);
      return;
    }

    const bossIds = bossUsers.map(u => u.userid);

    // BƯỚC 2: Lấy mèo có breeder_id nằm trong danh sách bossIds
    const { data, error } = await supabase
      .from('cats')
      .select('*')
      .in('breeder_id', bossIds)
      .order('created_at', { ascending: false });

    if (error) console.error("Lỗi tải dữ liệu mèo:", error);
    else setCatsList(data || []);
    
    setIsLoading(false);
  };

  // Trạng thái bóng bẩy
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Sẵn sàng': return 'bg-emerald-500/95 text-white shadow-[0_4px_10px_rgba(16,185,129,0.3)]';
      case 'Đã cọc': return 'bg-amber-500/95 text-white shadow-[0_4px_10px_rgba(245,158,11,0.3)]';
      case 'Đã về nhà mới': return 'bg-rose-500/95 text-white shadow-[0_4px_10px_rgba(225,29,72,0.3)]';
      case 'Chưa sẵn sàng': default: return 'bg-stone-800/95 text-white shadow-[0_4px_10px_rgba(0,0,0,0.3)]';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa cập nhật';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // 🎯 HÀM DỊCH MÀU EMS
  const formatEmsCode = (code: string) => {
    if (!code) return 'Chưa rõ';
    if (code.includes(' ') || code.length > 5) return code;

    const baseColors: Record<string, string> = {
      'a': 'Blue', 'b': 'Chocolate', 'c': 'Lilac', 'd': 'Red', 'e': 'Cream',
      'f': 'Black Tortie', 'g': 'Blue Tortie', 'h': 'Chocolate Tortie', 'j': 'Lilac Tortie', 'n': 'Black'
    };
    
    const patterns: Record<string, string> = {
      '01': 'Van', '02': 'Harlequin', '03': 'Bicolor', '09': 'White Spotting',
      '11': 'Shaded', '12': 'Shell', '21': 'Tabby', '22': 'Classic Tabby', '23': 'Mackerel Tabby', '24': 'Spotted Tabby'
    };

    let result = [];
    let base = code[0].toLowerCase();
    
    if (baseColors[base]) result.push(baseColors[base]);
    else return code; 

    if (code.toLowerCase().includes('s')) result.push('Silver');

    const patternMatch = code.match(/\d{2}/);
    if (patternMatch && patterns[patternMatch[0]]) result.push(patterns[patternMatch[0]]);

    return result.join(' ');
  };

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto pb-16 relative">
      {/* 🎯 GỌI COMPONENT NỀN THÔNG MINH */}
      <BackgroundGlow />
      
      {/* HEADER & NÚT THÊM MÈO */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
        <div>
          <Link 
              href="/dashboard/cats" 
              className="cursor-pointer group inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white text-red-600 hover:bg-white hover:text-red-700 px-5 py-2.5 rounded-full font-black text-sm mb-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(239,68,68,0.15)] hover:-translate-y-0.5 active:scale-95 w-fit"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span> Quay lại Cattery
            </Link>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-red-900 to-stone-800 tracking-tight drop-shadow-sm">
              Đàn mèo nhà KinVie
          </h1>
          <p className="text-stone-500 mt-2">Quản lý, thêm mới và cập nhật trạng thái các bé Maine Coon.</p>
        </div>

        {/* 🎯 NÚT LINK THẲNG SANG TRANG /add */}
        <Link 
          href="/dashboard/cats/kinvie/add"
          className="relative group overflow-hidden bg-red-500 text-white font-black px-8 py-4 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] transition-all duration-300 hover:-translate-y-1 cursor-pointer block"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
          <span className="relative z-10 flex items-center gap-2">
            <span className="text-xl">+</span> Thêm Bé Mèo Mới
          </span>
        </Link>
      </div>

      {/* ==========================================
          DANH SÁCH MÈO (BENTO UI CARD)
          ========================================== */}
      {isLoading ? (
        <div className="text-center py-20">
           <span className="text-4xl animate-bounce inline-block mb-4">🐈</span>
           <p className="text-red-500 font-bold animate-pulse uppercase tracking-widest text-sm">Đang tải dữ liệu đàn mèo...</p>
        </div>
      ) : catsList.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-stone-100 shadow-sm">
           <span className="text-5xl inline-block mb-4 opacity-50">🐾</span>
           <p className="text-stone-400 font-bold text-lg">Trại KinVie hiện chưa có bé mèo nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {catsList.map((cat) => (
            <Link 
              href={`/dashboard/cats/kinvie/${cat.id}`} 
              key={cat.id} 
              className="group block relative bg-white p-3 rounded-[2.5rem] border border-stone-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(249,115,22,0.15)] hover:border-red-200 transition-all duration-500 hover:-translate-y-1 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>

              {/* 1. KHU VỰC ẢNH & TRẠNG THÁI */}
              <div className="relative h-64 rounded-[2rem] overflow-hidden mb-5 bg-stone-100 z-10 shadow-inner">
                <img 
                  src={cat.images && cat.images.length > 0 ? cat.images[0] : 'https://via.placeholder.com/500'} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[800ms]" 
                />
                <div className="absolute top-4 left-4 z-10">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-widest backdrop-blur-md ${getStatusStyle(cat.status)}`}>
                    {cat.status || 'Chưa sẵn sàng'}
                  </span>
                </div>
              </div>

              {/* 2. KHU VỰC THÔNG TIN */}
              <div className="px-3 pb-3 relative z-10">
                <h3 className="text-2xl font-black text-stone-800 mb-4 group-hover:text-red-600 transition-colors truncate" title={cat.name}>
                  {cat.name}
                </h3>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-stone-100/80 border border-stone-200 text-stone-600 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    🧬 <span className="truncate max-w-[100px]">{cat.breed}</span>
                  </span>
                  <span className="bg-stone-100/80 border border-stone-200 text-stone-600 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5" title={formatEmsCode(cat.color)}>
                    🎨 <span className="truncate max-w-[120px]">{formatEmsCode(cat.color)}</span>
                  </span>
                  <span className="bg-stone-100/80 border border-stone-200 text-stone-600 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5" title="Ngày sinh">
                    🎂 {formatDate(cat.dob)}
                  </span>
                </div>
                
                {/* 3. FOOTER: GIÁ TIỀN & ACTION */}
                <div className="flex justify-between items-end pt-4 border-t border-dashed border-stone-200">
                  <div>
                    <p className="text-[10px] uppercase font-black text-stone-400 tracking-widest mb-1">Giá chuyển nhượng</p>
                    <p className="text-[26px] font-black bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent tracking-tighter">
                      {formatPrice(cat.price)}<span className="text-sm font-bold text-red-500 ml-1">đ</span>
                    </p>
                  </div>
                  
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all duration-300 shadow-sm -rotate-45 group-hover:rotate-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}