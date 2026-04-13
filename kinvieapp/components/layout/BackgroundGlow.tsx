"use client";
import React from 'react';
import { useLayoutStore } from '@/store/useLayoutStore';

export default function BackgroundGlow() {
  const themeColor = useLayoutStore((state) => state.themeColor);

  // 🎯 MAP CỨNG CLASS ĐỂ TAILWIND NHẬN DIỆN ĐƯỢC LÚC BUILD
  const colors = {
    red: { b1: 'bg-red-400/20', b2: 'bg-red-500/20', b3: 'bg-red-300/20' },
    orange: { b1: 'bg-orange-400/20', b2: 'bg-orange-500/20', b3: 'bg-orange-300/20' },
    teal: { b1: 'bg-teal-400/20', b2: 'bg-teal-500/20', b3: 'bg-teal-300/20' },
    pink: { b1: 'bg-pink-400/20', b2: 'bg-pink-500/20', b3: 'bg-pink-300/20' },
    blue: { b1: 'bg-blue-400/20', b2: 'bg-blue-500/20', b3: 'bg-blue-300/20' },
    emerald: { b1: 'bg-emerald-400/20', b2: 'bg-emerald-500/20', b3: 'bg-emerald-300/20' },
    purple: { b1: 'bg-purple-400/20', b2: 'bg-fuchsia-400/20', b3: 'bg-blue-300/20' },
    amber: { b1: 'bg-amber-400/20', b2: 'bg-amber-400/20', b3: 'bg-amber-300/20' }
  };

  const current = colors[themeColor] || colors.red;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Blob 1 */}
      <div className={`absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full ${current.b1} mix-blend-multiply filter blur-[120px] animate-blob z-0`}></div>
      {/* Blob 2 */}
      <div className={`absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full ${current.b2} mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000 z-0`}></div>
      {/* Blob 3 */}
      <div className={`absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full ${current.b3} mix-blend-multiply filter blur-[150px] animate-blob animation-delay-4000 z-0`}></div>
    </div>
  );
}