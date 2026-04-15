"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCatStore } from '@/store/useCatStore'; 

export default function CatCard({ cat }: { cat: any }) {
  const router = useRouter();
  const translateEMS = useCatStore((state) => state.translateEMS);

  const handleAction = async (e: React.MouseEvent, actionType: 'view' | 'like') => {
    e.preventDefault();
    e.stopPropagation(); 

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      alert("Sen vui lòng đăng nhập hoặc tạo tài khoản để xem chi tiết Boss nhé!");
      router.push('/login');
      return;
    }

    if (actionType === 'view') {
      router.push(`/cattery/${cat.id}`); 
    } else if (actionType === 'like') {
      alert(`Đã thả tim cho bé ${cat.name}!`);
    }
  };

  const formattedDOB = cat.dob 
    ? new Date(cat.dob).toLocaleDateString('vi-VN') 
    : 'Chưa cập nhật';

  // Sửa đúng tên cột 'color' trong DB của sếp
  const colorName = translateEMS(cat.color);

  // Đổi thẻ <Image> thành <img> để không bị Next.js chặn link Supabase
  // Quét các cột ảnh có thể có trong DB (sếp đang dùng cột nào thì nó lấy cột đó)
  const imageUrl = (cat.images && cat.images[0] && cat.images[0].trim() !== "")
    ? cat.images[0] 
    : 'https://placehold.co/400x500/ffccd5/db2777?text=KinVie+Cattery';

  return (
    <div 
      onClick={(e) => handleAction(e, 'view')} 
      className="group bg-white rounded-[2rem] overflow-hidden cursor-pointer border border-pink-50 relative transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(236,72,153,0.25)] hover:border-pink-200"
    >
      {/* KHỐI ẢNH */}
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        <img 
          src={imageUrl} 
          alt={cat.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          // Dự phòng cuối cùng nếu link ảnh trong DB bị chết (404)
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x500/ffccd5/db2777?text=Anh+Dang+Tai';
          }}
        />
        
        {/* Nút Like (thả tim) ẩn hiện mượt mà */}
        <button 
          onClick={(e) => handleAction(e, 'like')}
          className="absolute top-4 right-4 z-10 w-11 h-11 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/90 hover:bg-pink-500 hover:text-white transition-all duration-300 shadow-lg opacity-80 group-hover:opacity-100"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
        
        {/* Tag trạng thái mèo */}
        <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-rose-400 px-4 py-1.5 rounded-full text-[11px] font-black text-white shadow-md uppercase tracking-wider">
          {cat.status || 'Sẵn sàng'}
        </div>
      </div>

      {/* KHỐI THÔNG TIN BÊN DƯỚI */}
      <div className="p-6 bg-gradient-to-b from-white to-pink-50/30">
        <div className="flex items-start justify-between gap-2 mb-4">
            <h3 className="text-2xl font-black text-stone-800 tracking-tight line-clamp-1">{cat.name}</h3>
            {/* Tag Giới tính Đực/Cái */}
            <div className={`flex items-center justify-center w-8 h-8 rounded-full shadow-sm shrink-0 ${cat.gender === 'Male' ? 'bg-blue-100 text-blue-500' : 'bg-pink-100 text-pink-500'}`}>
                {cat.gender === 'Male' ? '♂' : '♀'}
            </div>
        </div>
        
        <div className="space-y-2.5 text-sm text-stone-600 font-medium">
          {/* Giống mèo */}
          <p className="flex items-center gap-3">
             <span className="text-lg bg-pink-100 w-7 h-7 rounded-full flex items-center justify-center text-pink-500">🐈</span> 
             <span className="font-bold text-stone-700">{cat.breed || 'Chưa cập nhật'}</span>
          </p>

          {/* Màu lông (Đã dịch từ EMS) */}
          <p className="flex items-center gap-3">
             <span className="text-lg bg-pink-100 w-7 h-7 rounded-full flex items-center justify-center text-pink-500">🎨</span> 
             <span className="line-clamp-1">{colorName}</span>
          </p>

          {/* Ngày sinh */}
          <p className="flex items-center gap-3">
             <span className="text-lg bg-pink-100 w-7 h-7 rounded-full flex items-center justify-center text-pink-500">🎂</span> 
             {formattedDOB}
          </p>

          {/* Trại nuôi (Đã lấy linh động từ Database) */}
          <div className="pt-2 mt-2 border-t border-pink-100 border-dashed">
            <p className="flex items-center gap-3 text-xs text-stone-500 uppercase tracking-wider font-bold">
              <span className="text-lg">🏠</span> 
              Trại: {cat.users?.cattery_name || 'Đang cập nhật'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}