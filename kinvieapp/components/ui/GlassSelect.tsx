"use client";

import React, { useRef, useEffect } from 'react';
import { useDropdownStore } from '@/store/useDropdownStore';

export interface SelectOption {
  value: string | number;
  label: string;
  subLabel?: string; 
  iconOrImage?: string; 
}

interface GlassSelectProps {
  id: string; 
  label?: string; 
  options: SelectOption[];
  selectedValue: any;
  onChange: (value: any) => void;
  themeColor?: 'cyan' | 'rose' | 'amber' | 'stone' | 'purple'; 
  placeholder?: string;
}

export default function GlassSelect({ 
  id, label, options, selectedValue, onChange, 
  themeColor = 'stone', placeholder = '-- Vui lòng chọn --'
}: GlassSelectProps) {
  
  const { activeDropdownId, setActiveDropdownId } = useDropdownStore();
  const isOpen = activeDropdownId === id;
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🎯 Bộ từ điển màu sắc (Tự đổi theo trang)
  const themeMap = {
    cyan: { text: 'text-cyan-600', border: 'border-cyan-200 focus:ring-cyan-400', hover: 'hover:bg-cyan-50 hover:border-cyan-200', activeBg: 'bg-cyan-500 text-white' },
    rose: { text: 'text-rose-600', border: 'border-rose-200 focus:ring-rose-400', hover: 'hover:bg-rose-50 hover:border-rose-200', activeBg: 'bg-rose-500 text-white' },
    amber: { text: 'text-amber-600', border: 'border-amber-200 focus:ring-amber-400', hover: 'hover:bg-amber-50 hover:border-amber-200', activeBg: 'bg-amber-500 text-white' },
    stone: { text: 'text-stone-600', border: 'border-stone-200 focus:ring-stone-400', hover: 'hover:bg-stone-50 hover:border-stone-200', activeBg: 'bg-stone-800 text-white' },
    purple: { text: 'text-purple-600', border: 'border-purple-200 focus:ring-purple-400', hover: 'hover:bg-purple-50 hover:border-purple-200', activeBg: 'bg-purple-500 text-white' },
  };

  const colors = themeMap[themeColor];
  const selectedOption = options.find(opt => opt.value === selectedValue);

  // Click ra ngoài tự đóng
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        if (isOpen) setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setActiveDropdownId]);

  const handleSelect = (val: any) => {
    onChange(val);
    setActiveDropdownId(null);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${colors.text}`}>
          {label}
        </label>
      )}

      {/* 🎯 NÚT BẤM KÍNH MỜ */}
      <button
        type="button"
        onClick={() => setActiveDropdownId(isOpen ? null : id)}
        className={`w-full flex items-center justify-between bg-white/80 backdrop-blur-xl border ${isOpen ? colors.border + ' ring-2' : 'border-stone-200'} p-3.5 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.02)] transition-all duration-300`}
      >
        {selectedOption ? (
          <div className="flex items-center gap-3">
            {selectedOption.iconOrImage && (
              selectedOption.iconOrImage.includes('http') || selectedOption.iconOrImage.includes('/') 
                ? <img src={selectedOption.iconOrImage} alt="" className="w-8 h-8 rounded-full object-cover border border-stone-100" />
                : <span className="text-xl">{selectedOption.iconOrImage}</span>
            )}
            <div className="text-left">
              <p className="text-sm font-black text-stone-800 leading-none">{selectedOption.label}</p>
              {selectedOption.subLabel && <p className="text-[10px] text-stone-400 font-bold mt-1 leading-none">{selectedOption.subLabel}</p>}
            </div>
          </div>
        ) : (
          <span className="text-stone-400 font-bold text-sm">{placeholder}</span>
        )}
        
        <svg className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${isOpen ? 'rotate-180 ' + colors.text : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 🎯 DANH SÁCH SỔ XUỐNG */}
      <div 
        className={`absolute top-[calc(100%+8px)] left-0 w-full z-50 transition-all duration-300 origin-top
          ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
        `}
      >
        <div className="bg-white/90 backdrop-blur-2xl border border-white p-2 rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] max-h-64 overflow-y-auto">
          
          <div onClick={() => handleSelect(null)} className="p-3 rounded-xl cursor-pointer text-stone-400 hover:bg-stone-100 text-sm font-bold mb-1">
            -- Bỏ chọn --
          </div>

          {options.map((item) => (
            <div
              key={item.value}
              onClick={() => handleSelect(item.value)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent 
                ${selectedValue === item.value ? colors.activeBg : colors.hover + ' text-stone-700'}
              `}
            >
              {item.iconOrImage && (
                item.iconOrImage.includes('http') || item.iconOrImage.includes('/')
                  ? <img src={item.iconOrImage} alt="" className="w-8 h-8 rounded-full object-cover bg-white" />
                  : <span className="text-xl">{item.iconOrImage}</span>
              )}
              <div>
                <p className={`text-sm font-black leading-tight ${selectedValue === item.value ? 'text-white' : ''}`}>{item.label}</p>
                {item.subLabel && <p className={`text-[11px] font-bold mt-0.5 ${selectedValue === item.value ? 'text-white/70' : 'text-stone-400'}`}>{item.subLabel}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}