"use client";

import React, { useState, useEffect, useRef } from 'react';

// 🎯 Dropdown chọn giống mèo có ô tìm kiếm, style đồng bộ pink-rounded với phần còn lại của trang
export default function BreedSearchSelect({ value, onChange, breeds, disabled = false }: { value: string; onChange: (v: string) => void; breeds: string[]; disabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = breeds.filter(b => b.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="relative w-full" ref={wrapRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full border px-2.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-between
          ${disabled ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
            : isOpen ? 'bg-white border-pink-300 ring-2 ring-pink-100 cursor-pointer'
              : 'bg-white border-stone-200 hover:border-pink-300 cursor-pointer'}`}
      >
        <span className="truncate">{value}</span>
        <span className={`text-[9px] ml-1 transition-transform ${disabled ? 'text-stone-300' : isOpen ? 'rotate-180 text-pink-400' : 'text-stone-400'}`}>▼</span>
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 w-56 bg-white border border-pink-200 rounded-xl shadow-xl z-50 p-2">
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Tìm giống mèo..."
            className="w-full mb-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-medium focus:outline-none focus:border-pink-400"
          />
          <div className="max-h-40 overflow-y-auto">
            {filtered.length > 0 ? filtered.map(b => (
              <div
                key={b}
                onClick={() => { onChange(b); setIsOpen(false); setSearch(''); }}
                className={`px-2.5 py-2 rounded-lg cursor-pointer text-xs font-bold transition-colors
                  ${b === value ? 'bg-pink-100 text-pink-600' : 'text-stone-600 hover:bg-pink-50 hover:text-pink-600'}`}
              >
                {b}
              </div>
            )) : (
              <p className="text-center text-[11px] text-stone-400 py-2">Không tìm thấy giống nào</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}