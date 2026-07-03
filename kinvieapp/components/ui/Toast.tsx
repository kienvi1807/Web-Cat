"use client";

import React, { useState, useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error'; onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className={`px-6 py-3.5 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-2 border whitespace-nowrap ${type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'}`}>
        <span>{type === 'success' ? '✅' : '⚠️'}</span>
        {message}
      </div>
    </div>
  );
}