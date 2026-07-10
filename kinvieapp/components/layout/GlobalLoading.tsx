"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLoadingStore } from '@/store/useLoadingStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function GlobalLoading() {
  // Lấy trạng thái từ Store của sếp
  const { isLoading, loadingText } = useLoadingStore();

  // isVisible dùng để quyết định có render thẻ div ra DOM hay không
  const [isVisible, setIsVisible] = useState(isLoading);
  // isTearing dùng để kích hoạt animation xé giấy (chạy class CSS)
  const [isTearing, setIsTearing] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
      setIsTearing(false);
    } else {
      // Khi store báo load xong -> Kích hoạt xé giấy
      setIsTearing(true);
      // Chờ 1.2s cho hiệu ứng xé giấy trượt hết ra ngoài màn hình rồi mới gỡ DOM
      const timer = setTimeout(() => setIsVisible(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Chỉ return null khi đã xé giấy xong
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[999999] pointer-events-none flex overflow-hidden">

      {/* KHU VỰC ĐỊNH NGHĨA VIỀN RÁCH SVG CHÂN THỰC */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Rìa rách bên phải của tờ giấy TRÁI */
        .jagged-right {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='32'%3E%3Cpath d='M0,0 L16,16 L0,32' fill='none' stroke='%23FFF8FA' stroke-width='1'/%3E%3Cpolygon points='0,0 16,16 0,32' fill='%23FFF8FA'/%3E%3C/svg%3E");
          background-repeat: repeat-y;
          background-position: left center;
        }
        /* Rìa rách bên trái của tờ giấy PHẢI */
        .jagged-left {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='32'%3E%3Cpolygon points='16,0 0,16 16,32' fill='%23FFF8FA'/%3E%3C/svg%3E");
          background-repeat: repeat-y;
          background-position: right center;
        }
      `}} />

      {/* ================= NỬA TỜ GIẤY BÊN TRÁI ================= */}
      <div
        className={`relative w-1/2 h-full bg-[#FFF8FA] z-20 flex justify-end transition-transform duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${isTearing ? '-translate-x-[110%]' : 'translate-x-0'}`}
      >
        <div className="absolute inset-0 opacity-[0.04] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 -right-[15px] w-[16px] jagged-right drop-shadow-[5px_0_15px_rgba(0,0,0,0.1)] z-10" />
      </div>


      {/* ================= NỬA TỜ GIẤY BÊN PHẢI ================= */}
      <div
        className={`relative w-1/2 h-full bg-[#FFF8FA] z-20 flex justify-start transition-transform duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${isTearing ? 'translate-x-[110%]' : 'translate-x-0'}`}
      >
        <div className="absolute inset-0 opacity-[0.04] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 -left-[15px] w-[16px] jagged-left drop-shadow-[-5px_0_15px_rgba(0,0,0,0.1)] z-10" />
      </div>


      {/* ================= TRUNG TÂM: GIF MÈO CHẠY & TEXT ================= */}
      <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center transition-all duration-700 ease-out ${isTearing ? 'opacity-0 scale-125' : 'opacity-100 scale-100'}`}>

        <LoadingSpinner text={loadingText || 'Đang rước Boss...'} />

      </div>

    </div>
  );
}