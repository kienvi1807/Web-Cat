"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; 
import BackgroundGlow from '@/components/layout/BackgroundGlow';
import { useLayoutStore } from '@/store/useLayoutStore';
import { formatEmsCode } from '@/lib/utils';

export default function PedigreeExplorerPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [allCats, setAllCats] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const setThemeColor = useLayoutStore(state => state.setThemeColor);

  useEffect(() => {
    setThemeColor('teal'); // 👈 Chuyển tone Xanh Ngọc
  }, [setThemeColor]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);

  // 🎯 FETCH TOÀN BỘ DATA ĐỂ LÀM TỪ ĐIỂN PHẢ HỆ
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Lấy toàn bộ mèo
      const { data: cats } = await supabase.from('cats').select('*');
      // Lấy toàn bộ user (Gồm Boss, Đối tác, Khách hàng)
      const { data: users } = await supabase.from('users').select('*');
      
      if (cats) setAllCats(cats);
      if (users) setAllUsers(users);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // 🎯 HÀM LẤY TÊN HIỂN THỊ CỦA USER (TRẠI HOẶC KHÁCH)
  const getUserDisplayName = (userId: number | null) => {
    if (!userId) return 'Chưa rõ';
    const u = allUsers.find(user => user.userid === userId);
    if (!u) return 'Chưa rõ';
    
    // 🎯 QUAN TRỌNG: Check type_id = 1 (Quyền Boss) thay vì fix cứng ID = 1
    if (u.type_id === 1) return 'KinVie Cattery';
    
    // Fallback thông minh: Tên Trại -> Tên Thật -> Username -> Email -> SĐT
    return u.cattery_name || u.fullname || u.full_name || u.name || u.username || u.email || u.phone || `Đối tác #${u.userid}`;
  };

  // 🎯 HÀM TÌM KIẾM THEO REAL-TIME
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
    setSearchResults(results.slice(0, 10)); // Lấy top 10 kết quả
  }, [searchQuery, allCats, allUsers]);

  // 🎯 HÀM ĐIỀU HƯỚNG THÔNG MINH
  const getCatProfileRoute = (cat: any) => {
    if (!cat) return '#';
    const breeder = allUsers.find(u => u.userid === cat.breeder_id);
    // Nếu là của Boss thì về /kinvie, nếu của đối tác thì về /breeders
    if (cat.breeder_id === 1 || breeder?.type_id === 1) return `/dashboard/cats/kinvie/${cat.id}`;
    return `/dashboard/cats/breeders/${cat.id}`;
  };

  // ============================================================================
  // 🌳 COMPONENT ĐỆ QUY VẼ CÂY PHẢ HỆ NGANG (HORIZONTAL TREE) 5 ĐỜI
  // ============================================================================
  const FamilyTreeNode = ({ catId, level, label, visitedIds = [] }: { catId: number | null, level: number, label: string, visitedIds?: number[] }) => {
    if (level > 5) return null;
    
    // BỌC THÉP
    if (catId && visitedIds.includes(catId)) {
      return (
        <div className="flex items-center group/tree relative">
          {level > 1 && <div className="w-12 h-[2px] bg-stone-300"></div>}
          <div className="w-64 p-3 rounded-2xl border border-rose-400 bg-rose-50/90 backdrop-blur-xl flex items-center gap-3 relative z-10 shadow-lg">
            <div className="text-2xl ml-2">⚠️</div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest mb-0.5 text-rose-500">{label}</p>
               <p className="text-sm font-bold text-rose-600">Lặp vòng phả hệ!</p>
            </div>
          </div>
        </div>
      );
    }

    const cat = allCats.find(c => c.id === catId);
    
    if (!cat) {
      return (
        <div className="flex items-center group/node relative">
          {level > 1 && <div className="w-12 h-[2px] bg-stone-200/50"></div>}
          <div className="w-64 p-3 rounded-2xl border border-stone-200/50 bg-white/30 backdrop-blur-sm flex items-center gap-3 relative z-10 opacity-60 grayscale">
            <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-300 shrink-0">❓</div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest mb-0.5 text-stone-400">{label}</p>
               <p className="text-sm font-bold text-stone-400">Chưa xác định</p>
            </div>
          </div>
        </div>
      );
    }

    const newVisited = [...visitedIds, cat.id];
    const hasFather = level < 5 && (cat.father_id || true); 
    const hasMother = level < 5 && (cat.mother_id || true);

    const isRoot = level === 1;
    const borderClass = isRoot ? 'border-teal-400 ring-4 ring-teal-50 shadow-[0_0_20px_rgba(251,191,36,0.3)]' : cat.gender ? 'border-blue-200 hover:border-blue-400' : 'border-rose-200 hover:border-rose-400';
    const textThemeClass = isRoot ? 'text-teal-600' : cat.gender ? 'text-blue-500' : 'text-rose-500';

    return (
      <div className="flex items-center relative group/tree">
        {level > 1 && <div className="w-12 h-[2px] bg-stone-300 transition-colors group-hover/tree:bg-teal-300"></div>}
        
        <Link 
          href={getCatProfileRoute(cat)}
          target="_blank" 
          className={`w-64 p-3 rounded-2xl border bg-white/90 backdrop-blur-xl flex items-center gap-3 relative z-10 transition-all duration-300 hover:-translate-y-1 cursor-pointer hover:shadow-xl ${borderClass}`}
        >
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 relative">
             <img src={cat.images?.[0] || 'https://via.placeholder.com/100?text=No+Img'} className="w-full h-full object-cover" alt="cat" />
             <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-xl"></div>
             {!isRoot && (
               <div className={`absolute bottom-0 right-0 w-4 h-4 flex items-center justify-center text-[10px] text-white rounded-tl-md ${cat.gender ? 'bg-blue-500' : 'bg-rose-500'}`}>
                 {cat.gender ? '♂' : '♀'}
               </div>
             )}
          </div>
          <div className="overflow-hidden flex-1">
             <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${textThemeClass}`}>{label}</p>
             <p className="text-sm font-black text-stone-800 truncate">{cat.name}</p>
             <p className="text-[10px] text-stone-500 truncate flex items-center gap-1 mt-0.5">
               <span title="Màu/EMS">🎨 {formatEmsCode(cat.color) || 'Chưa rõ'}</span>
             </p>
             <p className="text-[9px] text-stone-400 truncate mt-0.5">🏠 {getUserDisplayName(cat.breeder_id)}</p>
          </div>
        </Link>

        {level < 5 && (
          <div className="flex items-center relative">
            <div className="w-8 h-[2px] bg-stone-300 transition-colors group-hover/tree:bg-teal-300"></div>
            <div className="flex flex-col justify-center border-l-2 border-stone-300 py-6 my-2 relative transition-colors group-hover/tree:border-teal-300">
               <div className="flex items-center relative -left-[2px] mb-8">
                  <div className="absolute w-4 h-[2px] bg-stone-300 -left-4 transition-colors group-hover/tree:bg-teal-300"></div>
                  <FamilyTreeNode catId={cat.father_id} level={level+1} label={`Đời ${level+1} (Bố)`} visitedIds={newVisited} />
               </div>
               <div className="flex items-center relative -left-[2px]">
                  <div className="absolute w-4 h-[2px] bg-stone-300 -left-4 transition-colors group-hover/tree:bg-teal-300"></div>
                  <FamilyTreeNode catId={cat.mother_id} level={level+1} label={`Đời ${level+1} (Mẹ)`} visitedIds={newVisited} />
               </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in min-h-screen pb-24 relative overflow-hidden bg-stone-50/50">
      {/* 🎯 GỌI COMPONENT NỀN THÔNG MINH */}
      <BackgroundGlow />

      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-teal-500/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>

      <div className="max-w-[1600px] mx-auto px-6 pt-10">
        
        {/* 🎯 NÚT BACK VỀ TRUNG TÂM MÈO */}
        <Link 
              href="/dashboard/cats" 
              className="cursor-pointer group inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white text-teal-600 hover:bg-white hover:text-teal-700 px-5 py-2.5 rounded-full font-black text-sm mb-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(20,184,166,0.15)] hover:-translate-y-0.5 active:scale-95 w-fit"
            >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span> Quay lại Cattery
        </Link>

        {/* HEADER & THANH TÌM KIẾM RADAR */}
        <div className="flex flex-col items-center text-center mb-16 relative z-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-2xl shadow-teal-500/30 mb-6 transform -rotate-3">
             <span className="text-4xl">🧬</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-black text-stone-800 mb-4 tracking-tight">
            Tàng Kinh Các Phả Hệ
          </h1>
          <p className="text-stone-500 text-lg max-w-2xl mb-10">
            Trung tâm dữ liệu huyết thống Cattery. Quét tìm 5 thế hệ tổ tiên thông qua tên gọi, mã bầy, tên trại hoặc khách hàng.
          </p>

          <div className="relative w-full max-w-3xl group">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-teal-500 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-60 transition duration-500"></div>
            <div className="relative flex items-center bg-white/90 backdrop-blur-xl border border-white rounded-[2rem] p-3 shadow-xl">
               <span className="text-3xl ml-4 mr-2">🔍</span>
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Gõ tên bé mèo, trại giống hoặc khách hàng..."
                 className="flex-1 bg-transparent border-none text-xl font-bold text-stone-800 focus:outline-none focus:ring-0 placeholder:text-stone-400 py-3"
               />
               {searchQuery && (
                 <button onClick={() => {setSearchQuery(''); setSearchResults([])}} className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-rose-500 transition-colors mr-2 font-black cursor-pointer">✕</button>
               )}
            </div>

            {/* BẢNG KẾT QUẢ TÌM KIẾM DROPDOWN */}
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden z-50 animate-fade-in text-left">
                 {searchResults.length === 0 ? (
                   <div className="p-8 text-center text-stone-400 font-bold">Không tìm thấy hồ sơ nào khớp với "{searchQuery}"</div>
                 ) : (
                   <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                     <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-4 mt-2">Kết quả tìm kiếm ({searchResults.length})</p>
                     {searchResults.map(cat => (
                       <div 
                         key={cat.id} 
                         onClick={() => { setSelectedCatId(cat.id); setSearchQuery(''); setSearchResults([]); }}
                         className="flex items-center gap-4 p-3 rounded-2xl hover:bg-teal-50 cursor-pointer transition-colors group/item"
                       >
                          <img src={cat.images?.[0] || 'https://via.placeholder.com/100'} className="w-14 h-14 rounded-xl object-cover shadow-sm border border-stone-200 group-hover/item:border-teal-300" />
                          <div className="flex-1">
                            <h4 className="text-lg font-black text-stone-800 group-hover/item:text-teal-600">{cat.name} <span className="text-sm">{cat.gender !== false ? '♂' : '♀'}</span></h4>
                            <div className="flex items-center gap-3 mt-1">
                               <span className="text-xs font-bold text-stone-500 flex items-center gap-1"><span className="text-teal-500">🏠</span> {getUserDisplayName(cat.breeder_id)}</span>
                               <span className="text-xs font-bold text-stone-500 flex items-center gap-1"><span className="text-blue-500">🧬</span> {cat.breed}</span>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-teal-500 group-hover/item:bg-teal-500 group-hover/item:text-white transition-colors">➜</div>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* KHU VỰC HIỂN THỊ CÂY PHẢ HỆ */}
        {/* ========================================================= */}
        
        {isLoading ? (
           <div className="text-center py-20 text-teal-500 animate-pulse"><span className="text-6xl">📖</span><p className="font-bold mt-4">Đang tra cứu kho lưu trữ...</p></div>
        ) : selectedCatId ? (
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-black text-stone-800 flex items-center gap-3">
                  Cây Gia Tộc Phả Hệ (5 Đời) <span className="text-teal-500">⚜️</span>
               </h2>
               <div className="flex gap-4">
                 <span className="text-xs font-bold text-stone-500 flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-400"></div> Đực</span>
                 <span className="text-xs font-bold text-stone-500 flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-400"></div> Cái</span>
               </div>
            </div>

            {/* VÙNG CHỨA CÂY CÓ THỂ CUỘN NGANG VÀ DỌC */}
            <div className="w-full bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-white shadow-[0_20px_80px_rgba(0,0,0,0.05)] overflow-hidden relative">
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f59e0b 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>
               
               <div className="overflow-auto custom-scrollbar p-12 min-h-[600px] relative z-10 flex items-center">
                  <div className="min-w-max pr-20 py-10">
                     <FamilyTreeNode catId={selectedCatId} level={1} label="Mèo Khởi Điểm" />
                  </div>
               </div>
            </div>
            <p className="text-center text-sm font-bold text-stone-400 mt-6 italic flex items-center justify-center gap-2">
              <span>🖱️</span> Nhấn vào bất kỳ thẻ mèo nào để mở trang hồ sơ chi tiết ở Tab mới.
            </p>
          </div>
        ) : (
          <div className="text-center py-24 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/60 shadow-sm border-dashed">
            <span className="text-7xl opacity-50 mb-6 inline-block grayscale">🌳</span>
            <h3 className="text-2xl font-black text-stone-600 mb-2">Bảng Phả Hệ Trống</h3>
            <p className="text-stone-400 font-bold max-w-md mx-auto">Vui lòng sử dụng thanh tìm kiếm phía trên để chọn một bé mèo làm gốc. Hệ thống sẽ tự động vẽ cây phả hệ 5 đời liên kết.</p>
          </div>
        )}

      </div>
    </div>
  );
}