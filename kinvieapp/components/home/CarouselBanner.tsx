"use client";

import React, { useRef, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // 👈 Trỏ đúng link Supabase của sếp

export default function CarouselBanner({ groupId }: { groupId: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🎯 KÉO ẢNH TỪ DATABASE THEO GROUP ID
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from('page_banners')
          .select('*')
          .eq('group_id', groupId)
          .order('created_at', { ascending: true });

        if (data && data.length > 0) {
          setImages(data);
        } else {
          // Nếu bảng chưa có ảnh, hiện tạm 1 ảnh giữ chỗ để sếp test layout
          setImages([{ id: 'temp', image_url: `https://placehold.co/1200x800/ffccd5/db2777?text=Khu+Vuc+${groupId}+Chua+Up+Anh` }]);
        }
      } catch (error) {
        console.error("Lỗi kéo ảnh Banner:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [groupId]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.clientWidth;
      const index = Math.round(scrollLeft / width);
      setActiveIndex(index);
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    if (activeIndex < images.length - 1) scrollToIndex(activeIndex + 1);
    else scrollToIndex(0); 
  };

  const scrollPrev = () => {
    if (activeIndex > 0) scrollToIndex(activeIndex - 1);
    else scrollToIndex(images.length - 1);
  };

  // Khung xương chờ tải dữ liệu (Loading Skeleton)
  if (isLoading) {
    return <div className="w-full aspect-square md:aspect-[4/3] lg:aspect-[16/9] bg-stone-100 animate-pulse rounded-[2rem]"></div>;
  }

  return (
    // 🌟 SỬA LỖI LAYOUT Ở ĐÂY: w-full ép nó rộng 100% theo cột chứa nó.
    // aspect-square (điện thoại hình vuông), md:aspect-[4/3] (tablet), lg:aspect-[16/9] (máy tính ngang)
    <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-[16/9] rounded-[2rem] overflow-hidden shadow-xl bg-stone-50 group">
      
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="absolute inset-0 flex w-full h-full overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {images.map((img) => (
          <div key={img.id} className="w-full h-full shrink-0 snap-center relative">
            <img 
              src={img.image_url} 
              alt="Banner" 
              className="absolute inset-0 w-full h-full object-cover" 
            />
          </div>
        ))}
      </div>

      {/* 🌟 Nút điều hướng (Chỉ hiện khi có nhiều hơn 1 ảnh) */}
      {images.length > 1 && (
        <>
          <button 
            onClick={scrollPrev} 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur hover:bg-white rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex text-pink-500 shadow-md hover:scale-110 active:scale-95 z-10"
          >
            <svg className="w-5 h-5 pr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <button 
            onClick={scrollNext} 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur hover:bg-white rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex text-pink-500 shadow-md hover:scale-110 active:scale-95 z-10"
          >
            <svg className="w-5 h-5 pl-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm z-10">
            {images.map((_, i) => (
              <button 
                key={i} 
                onClick={() => scrollToIndex(i)} 
                className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-white w-6' : 'bg-white/50 w-2 hover:bg-white/80'}`} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}