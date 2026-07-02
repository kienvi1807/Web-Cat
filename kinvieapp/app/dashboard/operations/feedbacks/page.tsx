"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import BackgroundGlow from '@/components/layout/BackgroundGlow';
import { useLayoutStore } from '@/store/useLayoutStore';
import GlassSelect from '@/components/ui/GlassSelect';

export default function FeedbackManagementPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  
  // State cho Modal phản hồi
  const [replyTarget, setReplyTarget] = useState<any | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const setThemeColor = useLayoutStore(state => state.setThemeColor);

  useEffect(() => {
    setThemeColor('purple'); // Tone màu Tím cho phần CSKH
    fetchFeedbacks();
  }, [setThemeColor]);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('feedbacks')
      .select(`*, users(fullname, avatarurl, phone)`)
      .order('created_at', { ascending: false });

    if (!error && data) setFeedbacks(data);
    setIsLoading(false);
  };

  const handleSendReply = async () => {
    if (!replyContent.trim()) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('feedbacks')
      .update({ admin_reply: replyContent, status: 'replied' })
      .eq('id', replyTarget.id);

    if (!error) {
      setFeedbacks(prev => prev.map(f => f.id === replyTarget.id ? { ...f, admin_reply: replyContent, status: 'replied' } : f));
      setReplyTarget(null);
      setReplyContent('');
    }
    setIsSaving(false);
  };

  const filteredData = useMemo(() => {
    return feedbacks.filter(f => {
      const matchType = filterType === 'All' || f.type === filterType;
      const matchSearch = f.users?.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) || f.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [feedbacks, filterType, searchQuery]);

  const typeOptions = [
    { value: 'All', label: 'Tất cả loại', iconOrImage: '📁' },
    { value: 'like', label: 'Hài lòng (Like)', iconOrImage: '👍' },
    { value: 'dislike', label: 'Không hài lòng', iconOrImage: '👎' },
    { value: 'complaint', label: 'Khiếu nại', iconOrImage: '⚠️' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 relative overflow-hidden selection:bg-purple-200">
      <BackgroundGlow />

      <div className="max-w-[1200px] mx-auto px-6 pt-12 relative z-10 animate-fade-in-up">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <Link href="/dashboard" className="cursor-pointer group inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white text-purple-600 hover:bg-white px-5 py-2.5 rounded-full font-black text-sm mb-6 transition-all w-fit">
              <span className="transition-transform group-hover:-translate-x-1">←</span> Quay lại Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-purple-700 to-indigo-800 tracking-tight flex items-center gap-3">
              Đánh giá & Khiếu nại <span className="text-purple-500">📣</span>
            </h1>
            <p className="font-bold text-stone-500 mt-3 text-lg">Lắng nghe ý kiến khách hàng và phản hồi khiếu nại.</p>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="bg-white/60 backdrop-blur-2xl p-4 md:p-6 rounded-[2rem] border border-purple-100 shadow-sm mb-8 flex flex-col lg:flex-row gap-4 items-center relative z-20">
          <div className="relative flex-1 w-full group">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-purple-500 transition-colors">🔍</span>
            <input type="text" placeholder="Tìm tên khách hoặc nội dung..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-14 pr-5 py-4 bg-white/70 border border-stone-200 rounded-2xl outline-none font-bold text-stone-800" />
          </div>
          <div className="w-full lg:w-64">
            <GlassSelect id="feedback-filter" options={typeOptions} selectedValue={filterType} onChange={setFilterType} themeColor="purple" />
          </div>
        </div>

        {/* LIST FEEDBACKS */}
        <div className="space-y-6 relative z-10">
          {isLoading ? (
             <div className="py-20 text-center animate-pulse font-black text-purple-400">ĐANG TẢI HỘP THƯ...</div>
          ) : filteredData.map((item) => (
            <div key={item.id} className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-6 md:p-8 shadow-sm hover:shadow-md transition-all group">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Cột 1: Thông tin người gửi */}
                <div className="md:w-48 shrink-0 flex md:flex-col items-center md:items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-stone-100 border-2 border-white shadow-sm overflow-hidden">
                    <img src={item.users?.avatarurl || `https://ui-avatars.com/api/?name=${item.users?.fullname}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-stone-800 truncate">{item.users?.fullname || 'Khách vãng lai'}</p>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>

                {/* Cột 2: Nội dung feedback */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    {item.type === 'like' && <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase border border-emerald-100">👍 Hài lòng</span>}
                    {item.type === 'dislike' && <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase border border-amber-100">👎 Góp ý</span>}
                    {item.type === 'complaint' && <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase border border-rose-100 animate-pulse">⚠️ Khiếu nại</span>}
                    
                    {item.status === 'replied' ? (
                      <span className="text-[10px] font-bold text-stone-400">✅ Đã phản hồi</span>
                    ) : (
                      <span className="text-[10px] font-bold text-purple-500">⏳ Chờ xử lý</span>
                    )}
                  </div>

                  <p className="text-stone-700 font-medium leading-relaxed text-lg italic">"{item.content}"</p>

                  {/* Phần hiển thị phản hồi của sếp nếu có */}
                  {item.admin_reply && (
                    <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-2xl mt-4 relative">
                      <div className="absolute -top-3 left-4 bg-purple-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md">PHẢN HỒI TỪ KINVIE</div>
                      <p className="text-purple-800 font-bold text-sm leading-relaxed">{item.admin_reply}</p>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button 
                      onClick={() => { setReplyTarget(item); setReplyContent(item.admin_reply || ''); }}
                      className="cursor-pointer text-xs font-black text-purple-600 hover:text-purple-800 underline underline-offset-4"
                    >
                      {item.admin_reply ? 'Sửa phản hồi' : 'Viết phản hồi ngay'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🎯 MODAL VIẾT PHẢN HỒI */}
      {replyTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm cursor-pointer cursor-pointer" onClick={() => setReplyTarget(null)}></div>
          <div className="relative bg-white border rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-fade-in-up">
            <h3 className="text-2xl font-black text-purple-600 mb-2">Phản hồi khách hàng</h3>
            <p className="text-stone-400 text-sm font-bold mb-6 truncate">Gửi tới: {replyTarget.users?.fullname}</p>
            
            <textarea 
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Nhập lời nhắn gửi tới khách hàng..."
              className="w-full h-40 bg-stone-50 border border-stone-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-purple-400 font-medium text-stone-700"
            />

            <div className="mt-8 flex gap-4">
              <button onClick={() => setReplyTarget(null)} className="flex-1 py-4 font-black text-stone-400 hover:text-stone-600 transition-colors">HỦY</button>
              <button 
                onClick={handleSendReply}
                disabled={isSaving}
                className="flex-[2] py-4 bg-purple-600 text-white rounded-2xl font-black shadow-lg hover:bg-purple-700 transition-all disabled:opacity-50"
              >
                {isSaving ? 'ĐANG GỬI...' : 'XÁC NHẬN GỬI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}