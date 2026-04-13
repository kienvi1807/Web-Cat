"use client";
import React from 'react';
import { useLoadingStore } from '@/store/useLoadingStore';

export default function GlobalLoading() {
  const { isLoading, loadingText } = useLoadingStore();

  // Nếu đang không loading thì tàng hình luôn
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/70 backdrop-blur-md animate-fade-in">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes run-front { 0% { transform: rotate(30deg); } 100% { transform: rotate(-40deg); } }
        @keyframes run-back { 0% { transform: rotate(-40deg); } 100% { transform: rotate(30deg); } }
        @keyframes tail-wag { 0% { transform: rotate(10deg); } 100% { transform: rotate(-20deg); } }
        @keyframes cat-bounce { 0% { transform: translateY(0px); } 100% { transform: translateY(-3px); } }
        
        .cat-leg-f { transform-origin: 65px 50px; animation: run-front 0.2s infinite alternate ease-in-out; }
        .cat-leg-b { transform-origin: 35px 50px; animation: run-back 0.2s infinite alternate ease-in-out; }
        .cat-tail { transform-origin: 25px 45px; animation: tail-wag 0.25s infinite alternate ease-in-out; }
        .cat-body-group { animation: cat-bounce 0.2s infinite alternate ease-in-out; }
      `}} />
      
      {/* Icon mèo chạy bằng 2 chân */}
      <div className="w-32 h-32 text-pink-500 drop-shadow-md mb-6">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-current stroke-current overflow-visible">
          <g className="cat-body-group">
             <path className="cat-tail" d="M25,45 Q10,25 15,10" fill="none" strokeWidth="5" strokeLinecap="round"/>
             <line className="cat-leg-b" x1="35" y1="50" x2="25" y2="75" strokeWidth="6" strokeLinecap="round"/>
             <line className="cat-leg-f" x1="65" y1="50" x2="70" y2="75" strokeWidth="6" strokeLinecap="round"/>
             <ellipse cx="50" cy="45" rx="25" ry="15" className="stroke-none" />
             <circle cx="75" cy="35" r="14" className="stroke-none" />
             <polygon points="68,25 65,10 78,25" className="stroke-none" />
             <polygon points="82,25 85,10 72,25" className="stroke-none" />
          </g>
        </svg>
      </div>
    </div>
  );
}