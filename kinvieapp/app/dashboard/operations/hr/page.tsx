"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-gradient-to-br from-purple-500 to-indigo-500', 
    'bg-gradient-to-br from-fuchsia-500 to-pink-500', 
    'bg-gradient-to-br from-blue-500 to-cyan-500', 
    'bg-gradient-to-br from-emerald-500 to-teal-500',
    'bg-gradient-to-br from-rose-500 to-orange-500'
  ];
  const charCode = (name || 'A').charCodeAt(0);
  return colors[charCode % colors.length];
};

export default function HRManagementPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .in('type_id', [1, 2, 3]) 
      .order('fullname', { ascending: true });
      
    if (!error && data) setEmployees(data);
    setIsLoading(false);
  };

  const handleApprove = async (userId: string) => {
    const { error } = await supabase.from('users').update({ type_id: 2 }).eq('userid', userId);
    if (!error) {
      setEmployees(prev => prev.map(emp => emp.userid === userId ? { ...emp, type_id: 2 } : emp));
    }
  };

  const handleDowngrade = async (userId: string, empName: string) => {
    if (!window.confirm(`Sếp muốn thu hồi quyền Staff của [${empName}]?`)) return;
    const { error } = await supabase.from('users').update({ type_id: 3 }).eq('userid', userId);
    if (!error) {
      setEmployees(prev => prev.map(emp => emp.userid === userId ? { ...emp, type_id: 3 } : emp));
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const isPending = emp.type_id === 3;
    const isActive = emp.type_id === 1 || emp.type_id === 2;
    const matchesTab = activeTab === 'pending' ? isPending : isActive;
    const searchStr = searchQuery.toLowerCase();
    return matchesTab && ((emp.fullname || '').toLowerCase().includes(searchStr) || (emp.phone || '').includes(searchStr));
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 relative overflow-hidden selection:bg-purple-200">
      {/* 🎨 BACKGROUND ORBS - HIỆU ỨNG ÁNH SÁNG NỀN CAO CẤP */}
      <div className="fixed top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 mix-blend-multiply filter blur-[120px] animate-blob z-0"></div>
      <div className="fixed top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-400/20 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000 z-0"></div>
      <div className="fixed bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-300/20 mix-blend-multiply filter blur-[150px] animate-blob animation-delay-4000 z-0"></div>

      <div className="max-w-[1400px] mx-auto px-6 pt-12 relative z-10 animate-fade-in-up">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
          <div>
            {/* 🎯 NÚT QUAY LẠI - CÓ HÌNH BÀN TAY (cursor-pointer) */}
            <Link 
              href="/dashboard/operations" 
              className="cursor-pointer group inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white text-purple-600 hover:bg-white hover:text-purple-700 px-5 py-2.5 rounded-full font-black text-sm mb-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(147,51,234,0.15)] hover:-translate-y-0.5 active:scale-95 w-fit"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span> Quay lại Kinh doanh & Vận hành
            </Link>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-purple-900 to-stone-800 tracking-tight drop-shadow-sm">
              Quản lý Nhân sự
            </h1>
            <p className="font-bold text-stone-500 mt-3 text-lg">Hệ thống phân quyền và kiểm soát đội ngũ</p>
          </div>
          
          {/* 🎯 THANH TÌM KIẾM */}
          <div className="relative w-full lg:w-[400px] group">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-purple-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input 
              type="text" 
              placeholder="Nhập tên hoặc SĐT..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-14 pr-5 py-4 bg-white/70 backdrop-blur-xl border-2 border-white/80 rounded-2xl focus:border-purple-400 focus:bg-white outline-none font-bold text-stone-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all placeholder:font-medium placeholder:text-stone-400" 
            />
          </div>
        </div>

        {/* 🎯 TABS (CÓ HÌNH BÀN TAY) */}
        <div className="flex flex-wrap gap-4 mb-10">
          <button 
            onClick={() => setActiveTab('active')} 
            className={`cursor-pointer px-8 py-3.5 rounded-2xl font-black text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'active' 
                ? 'bg-stone-900 text-white shadow-[0_10px_40px_rgb(0,0,0,0.2)] transform -translate-y-1 scale-105' 
                : 'bg-white/60 backdrop-blur-md text-stone-500 border border-white hover:bg-white hover:text-stone-800 hover:shadow-md'
            }`}
          >
            <span className={activeTab === 'active' ? 'text-purple-400' : ''}>✦</span> Nhân sự chính thức
          </button>
          
          <button 
            onClick={() => setActiveTab('pending')} 
            className={`cursor-pointer relative px-8 py-3.5 rounded-2xl font-black text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'pending' 
                ? 'bg-amber-500 text-white shadow-[0_10px_40px_rgba(245,158,11,0.3)] transform -translate-y-1 scale-105' 
                : 'bg-white/60 backdrop-blur-md text-stone-500 border border-white hover:bg-white hover:text-amber-600 hover:shadow-md'
            }`}
          >
            ⏳ Chờ phê duyệt
            {activeTab !== 'pending' && employees.some(e => e.type_id === 3) && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white"></span>
              </span>
            )}
          </button>
        </div>

        {/* 🎯 DANH SÁCH (GRID THẺ) */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="font-black text-stone-400 tracking-widest text-sm uppercase animate-pulse">Đang đồng bộ dữ liệu...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-32 bg-white/40 backdrop-blur-2xl rounded-[3rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
             <div className="w-24 h-24 bg-stone-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 transform rotate-12">👻</div>
             <h3 className="text-2xl font-black text-stone-800 mb-2">Trống trơn!</h3>
             <p className="text-stone-500 font-medium">Không tìm thấy tài khoản nào khớp với yêu cầu của sếp.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEmployees.map((emp, index) => (
              <div 
                key={emp.userid} 
                className="bg-white/60 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-7 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(147,51,234,0.1)] hover:-translate-y-2 hover:bg-white group flex flex-col h-full relative overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* 🎯 Badge Trùm Cuối */}
                {emp.type_id === 1 && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-black px-5 py-2 rounded-bl-2xl shadow-md z-10 uppercase tracking-widest flex items-center gap-1">
                    Trùm Cuối <span className="text-sm">👑</span>
                  </div>
                )}

                {/* Avatar & Name */}
                <div className="flex items-center gap-5 mb-7">
                  <div className={`w-[72px] h-[72px] shrink-0 rounded-full flex items-center justify-center text-white font-black text-3xl shadow-lg border-4 border-white overflow-hidden ${getAvatarColor(emp.fullname)} group-hover:scale-105 transition-transform duration-500`}>
                    {emp.avatarurl ? <img src={emp.avatarurl} className="w-full h-full object-cover" /> : (emp.fullname || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black text-stone-800 truncate group-hover:text-purple-600 transition-colors">
                      {emp.fullname || 'Ẩn danh'}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeTab === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${activeTab === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      </span>
                      <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest bg-stone-100/80 px-2 py-0.5 rounded-md">
                        {emp.type_id === 3 ? 'Khách/Breeder' : emp.type_id === 1 ? 'Quản trị viên' : 'Nhân viên'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thông tin liên hệ */}
                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-center gap-4 bg-stone-50/80 p-3.5 rounded-2xl border border-stone-100 group-hover:bg-purple-50/50 group-hover:border-purple-100/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-stone-400 group-hover:text-purple-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    </div>
                    <span className="font-bold text-stone-700 text-sm">{emp.phone || 'Chưa có số điện thoại'}</span>
                  </div>
                  <div className="flex items-start gap-4 bg-stone-50/80 p-3.5 rounded-2xl border border-stone-100 group-hover:bg-purple-50/50 group-hover:border-purple-100/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-stone-400 group-hover:text-purple-500 transition-colors shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </div>
                    <span className="font-bold text-stone-600 text-sm leading-relaxed line-clamp-2 mt-1">{emp.address || 'Chưa cập nhật địa chỉ'}</span>
                  </div>
                </div>

                {/* 🎯 NÚT TƯƠNG TÁC (CÓ HÌNH BÀN TAY CHUẨN) */}
                <div className="mt-auto">
                  {activeTab === 'pending' ? (
                    <button 
                      onClick={() => handleApprove(emp.userid)} 
                      className="cursor-pointer w-full py-4 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white rounded-2xl font-black text-sm shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      Phê duyệt làm Staff
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Link 
                        href={`/dashboard/operations/hr/${emp.userid}`}
                        className="cursor-pointer py-4 bg-purple-50 text-purple-600 rounded-2xl font-black text-sm hover:bg-purple-100 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center"
                      >
                        Hồ sơ
                      </Link>
                      {emp.type_id !== 1 && (
                        <button 
                          onClick={() => handleDowngrade(emp.userid, emp.fullname)} 
                          className="cursor-pointer py-4 bg-white border-2 border-stone-100 text-stone-400 rounded-2xl font-black text-sm hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-1.5 group/btn"
                        >
                          <svg className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          Xóa
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CSS CHO CÁC HIỆU ỨNG CHUYỂN ĐỘNG NGẦU */}
      <style dangerouslySetInnerHTML={{__html: `
        .animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeInUp { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-blob { animation: blob 10s infinite alternate; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}} />
    </div>
  );
}