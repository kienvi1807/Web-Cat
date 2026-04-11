"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; 

export default function HealthAndBreedingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [allCats, setAllCats] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<any | null>(null);

  // 🎯 FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data: cats } = await supabase.from('cats').select('*').order('created_at', { ascending: false });
      const { data: users } = await supabase.from('users').select('*');
      
      if (cats) setAllCats(cats);
      if (users) setAllUsers(users);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // 🎯 LẤY TÊN TRẠI HOẶC KHÁCH
  const getUserDisplayName = (userId: number | null) => {
    if (!userId) return 'Chưa rõ';
    const u = allUsers.find(user => user.userid === userId);
    if (!u) return 'Chưa rõ';
    if (u.type_id === 1) return 'KinVie Cattery';
    return u.cattery_name || u.fullname || u.full_name || u.name || u.username || u.email || u.phone || `Người dùng #${u.userid}`;
  };

  // 🎯 TÌM KIẾM REAL-TIME
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const results = allCats.filter(cat => {
      const catName = (cat.name || '').toLowerCase();
      const breederName = getUserDisplayName(cat.breeder_id).toLowerCase();
      const ownerName = getUserDisplayName(cat.owner_id).toLowerCase(); 
      return catName.includes(query) || breederName.includes(query) || ownerName.includes(query);
    });
    setSearchResults(results.slice(0, 10)); 
  }, [searchQuery, allCats, allUsers]);

  const formatEmsCode = (code: string) => {
    if (!code) return '';
    if (code.includes(' ') || code.length > 5) return code;
    const baseColors: Record<string, string> = { 'a': 'Blue', 'b': 'Chocolate', 'c': 'Lilac', 'd': 'Red', 'e': 'Cream', 'f': 'Black Tortie', 'g': 'Blue Tortie', 'h': 'Chocolate Tortie', 'j': 'Lilac Tortie', 'n': 'Black' };
    const patterns: Record<string, string> = { '01': 'Van', '02': 'Harlequin', '03': 'Bicolor', '09': 'White Spotting', '11': 'Shaded', '12': 'Shell', '21': 'Tabby', '22': 'Classic Tabby', '23': 'Mackerel Tabby', '24': 'Spotted Tabby' };
    let result = [];
    let base = code[0].toLowerCase();
    if (baseColors[base]) result.push(baseColors[base]); else return code;
    if (code.toLowerCase().includes('s')) result.push('Silver');
    const patternMatch = code.match(/\d{2}/);
    if (patternMatch && patterns[patternMatch[0]]) result.push(patterns[patternMatch[0]]);
    return result.join(' ');
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return ''; 
    const [year, month, day] = dateString.split('-'); 
    return `${day}/${month}/${year}`;
  };

  const getCatProfileRoute = (cat: any) => {
    if (!cat) return '#';
    const breeder = allUsers.find(u => u.userid === cat.breeder_id);
    if (cat.breeder_id === 1 || breeder?.type_id === 1) return `/dashboard/cats/kinvie/${cat.id}`;
    return `/dashboard/cats/breeders/${cat.id}`;
  };

  return (
    <div className="animate-fade-in min-h-screen pb-24 relative overflow-hidden bg-stone-50/50">

      {/* HIỆU ỨNG NỀN */}
      <div className="fixed top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-400/20 mix-blend-multiply filter blur-[120px] animate-blob z-0"></div>
      <div className="fixed top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/20 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000 z-0"></div>
      <div className="fixed bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-rose-300/20 mix-blend-multiply filter blur-[150px] animate-blob animation-delay-4000 z-0"></div>

      <div className="max-w-[1400px] mx-auto px-6 pt-10">
        
        {/* 🎯 NÚT BACK VỀ TRUNG TÂM MÈO */}
        <Link 
              href="/dashboard/cats" 
              className="cursor-pointer group inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white text-rose-600 hover:bg-white hover:text-rose-700 px-5 py-2.5 rounded-full font-black text-sm mb-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(225,29,72,0.15)] hover:-translate-y-0.5 active:scale-95 w-fit"
            >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span> Quay lại Cattery
        </Link>

        {/* HEADER & THANH TÌM KIẾM */}
        <div className="flex flex-col items-center text-center mb-12 relative z-30">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-400 to-pink-600 text-white shadow-2xl shadow-rose-500/30 mb-6 transform -rotate-3">
             <span className="text-4xl">🏥</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-black text-stone-800 mb-4 tracking-tight">
            Trung Tâm Y Tế & Sinh Sản
          </h1>
          <p className="text-stone-500 text-lg max-w-2xl mb-10">
            Truy xuất lịch sử tiêm chủng và theo dõi kế hoạch sinh sản của toàn bộ đàn mèo trong hệ thống.
          </p>

          {/* Ô TÌM KIẾM RADAR */}
          <div className="relative w-full max-w-3xl group">
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-pink-500 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-60 transition duration-500"></div>
            <div className="relative flex items-center bg-white/90 backdrop-blur-xl border border-white rounded-[2rem] p-3 shadow-xl">
               <span className="text-3xl ml-4 mr-2">🩺</span>
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Tìm kiếm hồ sơ bệnh án bằng tên mèo, tên trại..."
                 className="flex-1 bg-transparent border-none text-xl font-bold text-stone-800 focus:outline-none focus:ring-0 placeholder:text-stone-400 py-3"
               />
               {searchQuery && (
                 <button onClick={() => {setSearchQuery(''); setSearchResults([])}} className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-rose-500 transition-colors mr-2 font-black">✕</button>
               )}
            </div>

            {/* BẢNG KẾT QUẢ TÌM KIẾM */}
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden z-50 animate-fade-in text-left">
                 {searchResults.length === 0 ? (
                   <div className="p-8 text-center text-stone-400 font-bold">Không tìm thấy bệnh án nào khớp với "{searchQuery}"</div>
                 ) : (
                   <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                     <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-4 mt-2">Kết quả tìm kiếm ({searchResults.length})</p>
                     {searchResults.map(cat => (
                       <div 
                         key={cat.id} 
                         onClick={() => { setSelectedCat(cat); setSearchQuery(''); setSearchResults([]); }}
                         className="flex items-center gap-4 p-3 rounded-2xl hover:bg-rose-50 cursor-pointer transition-colors group/item"
                       >
                          <img src={cat.images?.[0] || 'https://via.placeholder.com/100'} className="w-14 h-14 rounded-xl object-cover shadow-sm border border-stone-200 group-hover/item:border-rose-300" alt="avatar" />
                          <div className="flex-1">
                            <h4 className="text-lg font-black text-stone-800 group-hover/item:text-rose-600">{cat.name} <span className="text-sm">{cat.gender !== false ? '♂' : '♀'}</span></h4>
                            <div className="flex items-center gap-3 mt-1">
                               <span className="text-xs font-bold text-stone-500 flex items-center gap-1"><span className="text-rose-500">🏠</span> {getUserDisplayName(cat.breeder_id)}</span>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-rose-500 group-hover/item:bg-rose-500 group-hover/item:text-white transition-colors">➜</div>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* KHU VỰC HIỂN THỊ HỒ SƠ CHI TIẾT */}
        {/* ========================================================= */}
        
        {isLoading ? (
           <div className="text-center py-20 text-rose-500 animate-pulse"><span className="text-6xl">🗂️</span><p className="font-bold mt-4">Đang truy xuất tủ hồ sơ y tế...</p></div>
        ) : selectedCat ? (
          <div className="flex flex-col lg:flex-row gap-8 relative z-20 animate-fade-in">
            
            {/* CỘT TRÁI: CARD THÔNG TIN CƠ BẢN */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-6 border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.03)] sticky top-10">
                <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-6 shadow-inner border border-stone-100">
                  <img src={selectedCat.images?.[0] || 'https://via.placeholder.com/500'} className="w-full h-full object-cover" alt="cat" />
                  <div className="absolute top-4 right-4">
                    <Link href={getCatProfileRoute(selectedCat)} target="_blank" className="cursor-pointer px-4 py-2 bg-stone-900/80 backdrop-blur-md text-white text-xs font-bold rounded-xl hover:bg-rose-500 transition-colors">
                      ✏️ Cập nhật hồ sơ
                    </Link>
                  </div>
                </div>
                
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-black text-stone-800">{selectedCat.name} <span className="text-lg">{selectedCat.gender !== false ? '♂' : '♀'}</span></h2>
                  <p className="text-sm font-bold text-stone-500 mt-2 flex items-center justify-center gap-2">
                     <span className="bg-white px-3 py-1 rounded-lg shadow-sm border border-stone-100">🏠 {getUserDisplayName(selectedCat.breeder_id)}</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-stone-50/50 rounded-2xl border border-stone-100">
                    <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Giống</span>
                    <span className="text-sm font-bold text-stone-800">{selectedCat.breed}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-stone-50/50 rounded-2xl border border-stone-100">
                    <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Màu (EMS)</span>
                    <span className="text-sm font-bold text-stone-800">{formatEmsCode(selectedCat.color) || 'Chưa rõ'}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-stone-50/50 rounded-2xl border border-stone-100">
                    <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Ngày sinh</span>
                    <span className="text-sm font-bold text-stone-800">{formatDateDisplay(selectedCat.dob) || 'Chưa cập nhật'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: LỊCH SỬ BỆNH ÁN & SINH SẢN */}
            <div className="w-full lg:w-2/3 flex flex-col gap-8">
              
              {/* MODULE 1: Y TẾ & TIÊM CHỦNG */}
              <div className="bg-white/70 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 border border-white shadow-[0_20px_50px_rgba(16,185,129,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                
                <h3 className="text-2xl font-black text-stone-800 mb-8 flex items-center gap-3">
                  <span className="text-rose-500 text-3xl">💉</span> Sổ Tiêm Chủng & Sức Khỏe
                </h3>

                {(!selectedCat.medical_history || selectedCat.medical_history.length === 0) ? (
                  <div className="text-center py-16 bg-white/50 rounded-[2rem] border-2 border-dashed border-stone-200">
                    <span className="text-5xl opacity-30 mb-4 inline-block grayscale">🏥</span>
                    <p className="text-stone-400 font-bold">Chưa có lịch sử tiêm phòng hoặc khám bệnh nào được ghi nhận.</p>
                  </div>
                ) : (
                  <div className="relative pl-6 md:pl-8 border-l-2 border-rose-100 space-y-10 mt-4">
                    {selectedCat.medical_history.map((record: any, idx: number) => (
                      <div key={idx} className="relative">
                        {/* Chấm tròn Timeline */}
                        <div className="absolute -left-[35px] md:-left-[43px] w-5 h-5 rounded-full bg-rose-500 border-4 border-white shadow-sm"></div>
                        
                        <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgba(16,185,129,0.1)] transition-shadow">
                          <h4 className="text-lg font-black text-stone-800 mb-2">{record.vaccineName}</h4>
                          <div className="flex flex-wrap gap-4 mt-4">
                            <div className="flex items-center gap-2 bg-rose-50 text-rose-700 px-4 py-2 rounded-xl text-xs font-bold border border-rose-100">
                              <span>📅 Ngày tiêm:</span>
                              <span className="text-rose-900">{formatDateDisplay(record.dateGiven)}</span>
                            </div>
                            
                            {record.nextDueDate && (
                              <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold border border-amber-100">
                                <span>⏰ Hẹn nhắc lại:</span>
                                <span className="text-amber-900">{formatDateDisplay(record.nextDueDate)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ghi chú sức khỏe chung */}
                {selectedCat.notes && (
                  <div className="mt-10 p-6 bg-stone-50 rounded-[2rem] border border-stone-100">
                    <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3">Đặc điểm / Ghi chú thể trạng</p>
                    <p className="text-sm font-bold text-stone-700 whitespace-pre-line leading-relaxed">{selectedCat.notes}</p>
                  </div>
                )}
              </div>

              {/* MODULE 2: LỊCH SỬ SINH SẢN (PLACEHOLDER) */}
              <div className="bg-white/70 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 border border-white shadow-[0_20px_50px_rgba(244,63,94,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                
                <h3 className="text-2xl font-black text-stone-800 mb-8 flex items-center gap-3">
                  <span className="text-rose-500 text-3xl">🎀</span> Sổ Kế Hoạch Sinh Sản
                </h3>

                {selectedCat.gender !== false ? (
                  // MÀN HÌNH NẾU LÀ MÈO ĐỰC (Đực giống)
                  <div className="text-center py-16 bg-rose-50/50 rounded-[2rem] border border-rose-100">
                    <span className="text-6xl mb-6 inline-block drop-shadow-md">👑</span>
                    <h4 className="text-xl font-black text-rose-900 mb-2">Thống Kê Phối Giống</h4>
                    <p className="text-rose-500/70 font-bold text-sm max-w-md mx-auto">
                      Tính năng theo dõi các bầy con của mèo đực giống và lịch trình nhận phối đang được nâng cấp. Sẽ sớm ra mắt sếp nhé!
                    </p>
                    <button className="mt-6 px-6 py-2.5 bg-white text-rose-500 text-xs font-black rounded-xl shadow-sm border border-rose-100 cursor-not-allowed opacity-50">
                      Đang phát triển...
                    </button>
                  </div>
                ) : (
                  // MÀN HÌNH NẾU LÀ MÈO CÁI (Sinh sản)
                  <div className="text-center py-16 bg-rose-50/50 rounded-[2rem] border border-rose-100">
                    <span className="text-6xl mb-6 inline-block drop-shadow-md">🐈‍⬛</span>
                    <h4 className="text-xl font-black text-rose-900 mb-2">Nhật Ký Mang Thai & Sinh Nở</h4>
                    <p className="text-rose-500/70 font-bold text-sm max-w-md mx-auto">
                      Hệ thống quản lý chu kỳ Salo, dự kiến ngày đẻ, và danh sách đàn con đang được đội ngũ kỹ thuật xây dựng.
                    </p>
                    <button className="mt-6 px-6 py-2.5 bg-white text-rose-500 text-xs font-black rounded-xl shadow-sm border border-rose-100 cursor-not-allowed opacity-50">
                      Đang phát triển...
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div className="text-center py-24 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/60 shadow-sm border-dashed">
            <span className="text-7xl opacity-50 mb-6 inline-block grayscale">📂</span>
            <h3 className="text-2xl font-black text-stone-600 mb-2">Kho Lưu Trữ Trống</h3>
            <p className="text-stone-400 font-bold max-w-md mx-auto">Vui lòng sử dụng thanh tìm kiếm phía trên để mở hồ sơ bệnh án hoặc kế hoạch sinh sản của một bé mèo.</p>
          </div>
        )}

      </div>
    </div>
  );
}