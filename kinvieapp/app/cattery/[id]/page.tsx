"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatEmsCode } from '@/lib/utils';

export default function PublicCatProfilePage() {
  const params = useParams();
  const catId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [catData, setCatData] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string>('');
  
  // Dữ liệu dùng cho phả hệ
  const [allCatsList, setAllCatsList] = useState<any[]>([]);
  const [breedersList, setBreedersList] = useState<any[]>([]);

  // 🎯 LẤY DỮ LIỆU TỪ SUPABASE
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      
      // Lấy danh sách trại & tất cả mèo để vẽ phả hệ
      const { data: breeders } = await supabase.from('users').select('userid, fullname, cattery_name, phone').in('type_id', [1, 3]);
      if (breeders) setBreedersList(breeders);

      const { data: allCats } = await supabase.from('cats').select('id, name, gender, images, color, breeder_id, father_id, mother_id');
      if (allCats) setAllCatsList(allCats);

      // Lấy data bé mèo hiện tại
      if (catId) {
        const { data } = await supabase.from('cats').select('*').eq('id', catId).maybeSingle();
        if (data) {
          setCatData({ ...data, images: data.images || [], medical_history: data.medical_history || [] });
          if (data.images && data.images.length > 0) {
            setMainImage(data.images[0]); // Đặt ảnh đầu tiên làm ảnh bìa
          }
        }
      }
      setIsLoading(false);
    };
    initData();
  }, [catId]);

  // Format Helper
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return 'Chưa cập nhật'; 
    const [year, month, day] = dateString.split('-'); 
    return `${day}/${month}/${year}`;
  };

  const getBreederName = (breederId: number) => {
    if (!breederId) return 'KinVie Cattery';
    if (breederId === 1) return 'KinVie Cattery';
    const b = breedersList.find(x => x.userid === breederId);
    return b ? b.cattery_name || b.fullname : 'Trại đối tác';
  };

  // 🎯 COMPONENT ĐỆ QUY VẼ CÂY PHẢ HỆ (READ-ONLY)
  const PedigreeNode = ({ catIdNode, level, label, visitedIds = [] }: { catIdNode: number | null, level: number, label: string, visitedIds?: number[] }) => {
    if (!catIdNode || level > 5) return null;
    
    const currentId = parseInt(catIdNode.toString());
    // BỌC THÉP: Chống lặp vòng phả hệ
    if (visitedIds.includes(currentId)) {
      return (
        <div className="flex items-center group/node transition-all">
          {level > 1 && <div className="w-10 h-[2px] bg-rose-200 rounded-full"></div>}
          <div className="w-64 p-3 rounded-2xl border border-rose-400 bg-rose-50 flex items-center gap-3 relative z-10 opacity-70">
            <span className="text-xl">⚠️</span>
            <p className="text-xs font-bold text-rose-600">Lỗi lặp vòng phả hệ!</p>
          </div>
        </div>
      );
    }
    
    const newVisited = [...visitedIds, currentId];
    const cat = allCatsList.find(c => c.id === currentId);
    if (!cat) return null;

    const hasFather = !!cat.father_id;
    const hasMother = !!cat.mother_id;
    const hasParents = level < 5 && (hasFather || hasMother);

    const isCurrent = level === 1;
    let borderClass = isCurrent ? 'border-pink-500 ring-4 ring-pink-100' : cat.gender ? 'border-blue-200 hover:border-blue-400' : 'border-rose-200 hover:border-rose-400';
    let textThemeClass = isCurrent ? 'text-pink-600' : cat.gender ? 'text-blue-500' : 'text-rose-500';
    let glowClass = isCurrent ? 'shadow-[0_0_15px_rgba(236,72,153,0.2)]' : cat.gender ? 'hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]';

    return (
      <div className="flex items-center group/node transition-all">
        {level > 1 && <div className="w-10 h-[2px] bg-pink-100 rounded-full transition-colors group-hover/node:bg-pink-300"></div>}
        
        <Link href={`/cattery/${cat.id}`} className={`w-64 p-3 rounded-2xl border bg-white flex items-center gap-3 relative z-10 transition-all duration-300 hover:-translate-y-1 ${borderClass} ${glowClass}`}>
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-50 shrink-0 border border-stone-100">
             <img src={cat.images?.[0] || 'https://images.unsplash.com/photo-1589883661923-6476cb0ae9f2?q=80&w=100&auto=format&fit=crop'} className="w-full h-full object-cover" alt={cat.name} />
          </div>
          <div className="overflow-hidden flex-1">
             <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${textThemeClass}`}>{label}</p>
             <p className="text-sm font-bold text-stone-800 truncate group-hover/node:text-pink-600 transition-colors">{cat.name}</p>
             <p className="text-[10px] text-stone-500 truncate">{formatEmsCode(cat.color)}</p>
          </div>
        </Link>

        {hasParents && (
          <div className="flex items-center">
            <div className="w-8 h-[2px] bg-pink-100 rounded-full transition-colors group-hover/node:bg-pink-300"></div>
            <div className="flex flex-col justify-center gap-6 border-l-2 border-pink-100 py-4 my-2 transition-colors group-hover/node:border-pink-300 relative">
               {hasFather && <div className="flex items-center relative -left-[2px]"><PedigreeNode catIdNode={cat.father_id} level={level+1} label={`Đời ${level+1} (Bố)`} visitedIds={newVisited} /></div>}
               {hasMother && <div className="flex items-center relative -left-[2px]"><PedigreeNode catIdNode={cat.mother_id} level={level+1} label={`Đời ${level+1} (Mẹ)`} visitedIds={newVisited} /></div>}
            </div>
          </div>
        )}
      </div>
    );
  };

  // LOADING STATE
  if (isLoading) return (
    <div className="min-h-screen bg-[#FFF8FA] flex flex-col items-center justify-center text-pink-400">
      <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-black uppercase tracking-widest animate-pulse">Đang tìm hồ sơ Boss...</h2>
    </div>
  );

  if (!catData) return (
    <div className="min-h-screen bg-[#FFF8FA] flex flex-col items-center justify-center text-stone-500">
      <span className="text-6xl mb-4">😿</span>
      <h2 className="text-2xl font-black">Hồ sơ không tồn tại hoặc đã bị xóa.</h2>
      <Link href="/cattery" className="mt-6 px-6 py-3 bg-pink-500 text-white rounded-full font-bold hover:bg-pink-600 transition-colors">Quay lại danh sách</Link>
    </div>
  );

  const isReady = catData.status === 'Sẵn sàng';

  return (
    <div className="min-h-screen bg-[#FFF8FA] text-stone-700 font-sans selection:bg-pink-200 pb-24 pt-20">
      
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Nút Quay Lại */}
        <div className="mb-8">
          <Link href="/cattery" className="inline-flex items-center gap-2 text-sm font-bold text-stone-400 hover:text-pink-500 transition-colors">
            ← Trở về danh sách
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* ========================================
              CỘT TRÁI: THƯ VIỆN ẢNH (READ-ONLY)
              ======================================== */}
          <div className="w-full lg:w-5/12 flex flex-col gap-4">
            {/* Ảnh chính lớn */}
            <div className="relative aspect-[4/5] bg-white rounded-[3rem] p-3 border border-pink-50 shadow-[0_10px_40px_-10px_rgba(236,72,153,0.1)] overflow-hidden">
              <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-pink-50/50">
                 <img 
                   src={mainImage || 'https://images.unsplash.com/photo-1589883661923-6476cb0ae9f2?q=80&w=1000&auto=format&fit=crop'} 
                   alt={catData.name} 
                   className="w-full h-full object-cover" 
                 />
              </div>
              
              {/* Badge Trạng Thái Nổi */}
              <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg border border-white flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isReady ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isReady ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                </span>
                <span className={isReady ? 'text-emerald-600' : 'text-amber-600'}>{catData.status || 'Đang cập nhật'}</span>
              </div>
            </div>
            
            {/* Ảnh thu nhỏ (Thumbnails) */}
            {catData.images && catData.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {catData.images.map((imgUrl: string, idx: number) => {
                  if (!imgUrl) return null;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setMainImage(imgUrl)}
                      className={`cursor-pointer relative aspect-square rounded-2xl overflow-hidden border-4 transition-all duration-300 ${mainImage === imgUrl ? 'border-pink-400 shadow-md scale-105' : 'border-white shadow-sm hover:border-pink-200 opacity-70 hover:opacity-100'}`}
                    >
                      <img src={imgUrl} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ========================================
              CỘT PHẢI: THÔNG TIN CHI TIẾT & LIÊN HỆ
              ======================================== */}
          <div className="w-full lg:w-7/12 flex flex-col">
            
            <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 border border-pink-50 shadow-[0_20px_50px_-10px_rgba(236,72,153,0.05)] flex-grow">
               
               {/* Tên & Trại */}
               <div className="mb-6">
                 <p className="text-[11px] font-black text-pink-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <span>👑</span> {getBreederName(catData.breeder_id)}
                 </p>
                 <h1 className="text-4xl md:text-5xl font-black text-stone-800 tracking-tight leading-none mb-4">
                   {catData.name}
                 </h1>
               </div>

               {/* Bảng Thông Tin Nhanh (Grid) */}
               <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100/50">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Giống mèo</p>
                    <p className="text-sm font-bold text-stone-800">{catData.breed}</p>
                  </div>
                  <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100/50">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Giới tính</p>
                    <p className={`text-sm font-bold ${catData.gender ? 'text-blue-600' : 'text-rose-500'}`}>
                      {catData.gender ? '♂ Đực (Male)' : '♀ Cái (Female)'}
                    </p>
                  </div>
                  <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100/50">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Màu lông</p>
                    <p className="text-sm font-bold text-pink-600">{formatEmsCode(catData.color)}</p>
                  </div>
                  <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100/50">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Ngày sinh</p>
                    <p className="text-sm font-bold text-stone-800">{formatDateDisplay(catData.dob)}</p>
                  </div>
               </div>

               {/* Giá & Nút Liên Hệ */}
               <div className="bg-gradient-to-br from-pink-50 to-white p-6 md:p-8 rounded-[2rem] border border-pink-100 relative overflow-hidden mb-8">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/40 blur-3xl rounded-full pointer-events-none"></div>
                 
                 <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Giá chuyển nhượng</p>
                 <div className="flex items-end gap-2 mb-6">
                   <h2 className="text-4xl md:text-5xl font-black text-rose-500">
                     {catData.price ? catData.price.toLocaleString('vi-VN') : 'Liên hệ'}
                   </h2>
                   {catData.price > 0 && <span className="text-xl font-bold text-rose-300 mb-1">VNĐ</span>}
                 </div>

                 {/* 🎯 NÚT LIÊN HỆ ĐÓN BÉ (CALL TO ACTION) */}
                 <button 
                   onClick={() => alert('Sẽ mở Modal Form điền thông tin Zalo/SĐT để gửi cho Trại nhé sếp!')}
                   className="w-full group px-8 py-5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-black text-lg hover:from-pink-600 hover:to-rose-600 shadow-[0_10px_30px_rgba(236,72,153,0.3)] transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-1"
                 >
                   <span>💌</span> Gửi Yêu Cầu Đón Bé
                   <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                 </button>
                 <p className="text-center text-xs font-medium text-stone-400 mt-4">
                   *Breeder sẽ liên hệ lại với bạn qua Zalo/SĐT trong vòng 2h.
                 </p>
               </div>

               {/* Lịch Sử Tiêm Phòng & Ghi chú */}
               <div className="space-y-6">
                 <div>
                   <h3 className="text-sm font-black text-stone-800 uppercase flex items-center gap-2 mb-4"><span>🏥</span> Sức khỏe & Tiêm phòng</h3>
                   {catData.medical_history && catData.medical_history.length > 0 ? (
                     <div className="space-y-3">
                       {catData.medical_history.map((record: any, index: number) => (
                         <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                           <p className="font-bold text-stone-700 text-sm">{record.vaccineName}</p>
                           <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg mt-2 sm:mt-0 w-fit">
                             Đã tiêm: {formatDateDisplay(record.dateGiven)}
                           </p>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-sm text-stone-400 italic">Bé chưa đến tuổi tiêm phòng hoặc chưa cập nhật lịch.</p>
                   )}
                 </div>

                 {catData.notes && (
                   <div>
                     <h3 className="text-sm font-black text-stone-800 uppercase flex items-center gap-2 mb-3 mt-8"><span>📝</span> Đặc điểm tính cách</h3>
                     <div className="bg-pink-50/30 p-5 rounded-2xl border border-pink-100/50">
                       <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{catData.notes}</p>
                     </div>
                   </div>
                 )}
               </div>

            </div>
          </div>
        </div>

        {/* ========================================
            BOTTOM: GIA PHẢ CÂY THẦN BÍ (READ-ONLY)
            ======================================== */}
        {(catData.father_id || catData.mother_id) && (
          <div className="mt-10 bg-white/80 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 border border-pink-50 shadow-[0_20px_50px_-10px_rgba(236,72,153,0.05)] overflow-hidden">
            <h2 className="text-2xl font-black text-stone-800 mb-2 flex items-center gap-3">
              Gia Phả Thuần Chủng <span className="text-3xl">📜</span>
            </h2>
            <p className="text-sm text-stone-500 mb-8">Nguồn gen quý tộc qua 5 thế hệ từ các nhà vô địch.</p>
            
            <div className="overflow-x-auto custom-scrollbar pb-8 pt-4">
               <div className="min-w-max pr-16">
                  {/* Bắt đầu vẽ từ con mèo hiện tại (Level 1) */}
                  <PedigreeNode catIdNode={parseInt(catId as string)} level={1} label="Bé Mèo Hiện Tại" />
               </div>
            </div>
          </div>
        )}

      </div>
      
      {/* CSS Nhẹ nhàng cho thanh cuộn ngang */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #fdf2f8; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #fbcfe8; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #f472b6; }
      `}} />
    </div>
  );
}