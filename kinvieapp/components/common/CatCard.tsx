"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCatStore } from '@/store/useCatStore';
import Image from 'next/image';

export default function CatCard({ cat }: { cat: any }) {
  const router = useRouter();
  const translateEMS = useCatStore((state) => state.translateEMS);

  // 🎯 QUẢN LÝ TRẠNG THÁI LIKE & SỐ LƯỢNG
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(cat.likes || 0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 🎯 KHỞI CHẠY LẦN ĐẦU: Kiểm tra xem khách này đã thả tim bé mèo này chưa
  useEffect(() => {
    const checkInitialLikeStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setCurrentUserId(session.user.id);

        // Soi trong bảng cat_likes xem có tên vị khách này không
        const { data } = await supabase
          .from('cat_likes')
          .select('id')
          .eq('cat_id', cat.id)
          .eq('user_id', session.user.id)
          .single();

        if (data) {
          setIsLiked(true); // Đã thả tim rồi thì tô hồng trái tim
        }
      }
    };

    checkInitialLikeStatus();
  }, [cat.id]);

  // 🎯 HÀNH ĐỘNG CLICK
  const handleAction = async (e: React.MouseEvent, actionType: 'view' | 'like') => {
    e.preventDefault();
    e.stopPropagation();

    if (actionType === 'view') {
      router.push(`/cattery/${cat.id}`);
      return;
    }

    if (actionType === 'like') {
      if (!currentUserId) {
        alert("Sen vui lòng đăng nhập để thả tim cho Boss nhé!");
        router.push('/login');
        return;
      }

      // 1. THỦ THUẬT OPTIMISTIC UI: Đổi giao diện NGAY LẬP TỨC cho khách sướng
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikeCount((prev: number) => newLikedState ? prev + 1 : prev - 1);

      // 2. CHẠY NGẦM ĐẰNG SAU: Bắn dữ liệu lên Database
      try {
        if (newLikedState) {
          // NẾU THẢ TIM: Lưu vào sổ cat_likes và cộng 1 ở bảng cats
          await supabase.from('cat_likes').insert({ cat_id: cat.id, user_id: currentUserId });
          await supabase.from('cats').update({ likes: likeCount + 1 }).eq('id', cat.id);
        } else {
          // NẾU RÚT TIM LẠI: Xóa khỏi sổ cat_likes và trừ 1 ở bảng cats
          await supabase.from('cat_likes').delete().match({ cat_id: cat.id, user_id: currentUserId });
          await supabase.from('cats').update({ likes: likeCount - 1 }).eq('id', cat.id);
        }
      } catch (error) {
        console.error("Lỗi khi lưu tim:", error);
      }
    }
  };

  const formattedDOB = cat.dob ? new Date(cat.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật';
  const colorName = translateEMS(cat.color);
  const imageUrl = (cat.images && cat.images[0] && cat.images[0].trim() !== "")
    ? cat.images[0]
    : 'https://placehold.co/400x500/ffccd5/db2777?text=KinVie+Cattery';

  return (
    <div
      onClick={(e) => handleAction(e, 'view')}
      className="group bg-white rounded-[2rem] overflow-hidden cursor-pointer border border-pink-50 relative transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(236,72,153,0.25)] hover:border-pink-200"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        <Image
          src={imageUrl}
          alt={cat.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x500/ffccd5/db2777?text=Anh+Dang+Tai';
          }}
        />

        {/* NÚT THẢ TIM (Có đếm số lượng) */}
        <button
          onClick={(e) => handleAction(e, 'like')}
          className={`absolute top-4 right-4 z-10 h-11 px-3 backdrop-blur-md rounded-full flex items-center justify-center gap-1.5 transition-all duration-300 shadow-lg active:scale-90
            ${isLiked
              ? 'bg-pink-500 text-white scale-105'
              : 'bg-white/40 text-white/90 hover:bg-pink-500 hover:text-white opacity-90 group-hover:opacity-100'
            }`}
        >
          <svg
            className={`w-6 h-6 transition-transform duration-300 ${isLiked ? 'scale-110' : 'scale-100'}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          {/* Hiện số Like ngay cạnh trái tim nếu có người thả tim */}
          {likeCount > 0 && (
            <span className="text-sm font-bold">{likeCount}</span>
          )}
        </button>

        <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-rose-400 px-4 py-1.5 rounded-full text-[11px] font-black text-white shadow-md uppercase tracking-wider">
          {cat.status || 'Sẵn sàng'}
        </div>
      </div>

      <div className="p-6 bg-gradient-to-b from-white to-pink-50/30">
        <div className="flex items-start justify-between gap-2 mb-4">
          <h3 className="text-2xl font-black text-stone-800 tracking-tight line-clamp-1">{cat.name}</h3>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full shadow-sm shrink-0 ${cat.gender === 'Male' ? 'bg-blue-100 text-blue-500' : 'bg-pink-100 text-pink-500'}`}>
            {cat.gender === 'Male' ? '♂' : '♀'}
          </div>
        </div>

        <div className="space-y-2.5 text-sm text-stone-600 font-medium">
          <p className="flex items-center gap-3">
            <span className="text-lg bg-pink-100 w-7 h-7 rounded-full flex items-center justify-center text-pink-500">🐈</span>
            <span className="font-bold text-stone-700">{cat.breed || 'Chưa cập nhật'}</span>
          </p>
          <p className="flex items-center gap-3">
            <span className="text-lg bg-pink-100 w-7 h-7 rounded-full flex items-center justify-center text-pink-500">🎨</span>
            <span className="line-clamp-1">{colorName}</span>
          </p>
          <p className="flex items-center gap-3">
            <span className="text-lg bg-pink-100 w-7 h-7 rounded-full flex items-center justify-center text-pink-500">🎂</span>
            {formattedDOB}
          </p>
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