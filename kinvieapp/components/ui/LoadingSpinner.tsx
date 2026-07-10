"use client";

import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
  fullScreen?: boolean; // true = phủ kín toàn màn hình, false = chỉ chiếm khu vực chứa nó
}

export default function LoadingSpinner({ text, fullScreen = false }: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-5">
      <div className="relative w-20 h-20 md:w-24 md:h-24">
        {/* Vòng nền mờ */}
        <div className="absolute inset-0 rounded-full border-[6px] border-pink-100"></div>
        {/* Vòng quay chính */}
        <div className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-pink-400 border-r-pink-300 animate-spin"></div>
        {/* Mèo ở giữa, tự xoay ngược chiều nhẹ cho sinh động */}
        <div
          className="absolute inset-0 flex items-center justify-center text-3xl md:text-4xl"
          style={{ animation: 'spin-reverse-slow 2.4s linear infinite' }}
        >
          🐾
        </div>
      </div>

      {text && (
        <p className="text-xs md:text-sm font-black text-stone-400 uppercase tracking-[0.2em] animate-pulse text-center px-4">
          {text}
        </p>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin-reverse-slow {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
        `
      }} />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[999998] bg-white flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="py-16 flex items-center justify-center w-full">{content}</div>;
}