"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import BackgroundGlow from '@/components/layout/BackgroundGlow';
import { useLayoutStore } from '@/store/useLayoutStore';

// 🎯 CẤU HÌNH ID THEO ĐÚNG DATABASE CỦA SẾP
const BREEDER_TYPE_ID = 3;  // Cứ là Đối tác thì type_id = 3
const CUSTOMER_TYPE_ID = 4; // 👈 SẾP SỬA SỐ NÀY: ID của Khách hàng (dùng khi Từ chối hồ sơ)

// Hàm lấy màu nền Avatar ngẫu nhiên
const getAvatarColor = (name: string) => {
  const colors = [
    'bg-gradient-to-br from-amber-400 to-orange-500', 
    'bg-gradient-to-br from-orange-400 to-rose-500', 
    'bg-gradient-to-br from-yellow-400 to-amber-600', 
  ];
  const charCode = (name || 'A').charCodeAt(0);
  return colors[charCode % colors.length];
};

export default function BreederApprovalPage() {
  const [breeders, setBreeders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('pending'); 
  
  const setThemeColor = useLayoutStore(state => state.setThemeColor);

  useEffect(() => {
    setThemeColor('amber'); // Tone màu Vàng/Cam đặc trưng của mục Đối tác
  }, [setThemeColor]);

  useEffect(() => {
    fetchBreeders();
  }, []);

  const fetchBreeders = async () => {
    setIsLoading(true);
    // 🎯 Chỉ kéo những tài khoản có type_id = 3 (BREEDER)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('type_id', BREEDER_TYPE_ID) 
      .order('createdat', { ascending: false });
      
    if (!error && data) setBreeders(data);
    else console.error("Lỗi tải dữ liệu:", error);
    
    setIsLoading(false);
  };

  // 🎯 PHÊ DUYỆT LÊN ACTIVE BREEDER
  const handleApprove = async (userId: string, userName: string) => {
    if (!window.confirm(`Sếp có chắc chắn cấp quyền Đối Tác (Breeder) cho [${userName}]?`)) return;
    
    // Cập nhật cột status thành 'active_breeder'
    const { error } = await supabase
      .from('users')
      .update({ status: 'active_breeder' })
      .eq('userid', userId);

    if (!error) {
      setBreeders(prev => prev.map(user => user.userid === userId ? { ...user, status: 'active_breeder' } : user));
    } else {
      alert('Lỗi khi phê duyệt!');
      console.error(error);
    }
  };

  // 🎯 TỪ CHỐI -> HẠ XUỐNG KHÁCH HÀNG
  const handleReject = async (userId: string, userName: string) => {
    if (!window.confirm(`Sếp muốn TỪ CHỐI yêu cầu của [${userName}] và chuyển về tài khoản Khách hàng?`)) return;
    
    // Cập nhật type_id về Khách Hàng, đồng thời xóa luôn status cho sạch
    const { error } = await supabase
      .from('users')
      .update({ type_id: CUSTOMER_TYPE_ID, status: null })
      .eq('userid', userId);

    if (!error) {
      // Xóa khỏi danh sách hiển thị trên màn hình hiện tại
      setBreeders(prev => prev.filter(user => user.userid !== userId));
    } else {
      alert('Lỗi khi từ chối!');
      console.error(error);
    }
  };

  // 🎯 LOGIC LỌC TÌM KIẾM VÀ TABS
  const filteredBreeders = breeders.filter(user => {
    // pending: status bị null, undefined hoặc chuỗi rỗng
    const isPending = !user.status || user.status.trim() === '';
    // active: status chính xác là 'active_breeder'
    const isActive = user.status === 'active_breeder';
    
    const matchesTab = activeTab === 'pending' ? isPending : isActive;
    const searchStr = searchQuery.toLowerCase();
    
    return matchesTab && (
      (user.fullname || '').toLowerCase().includes(searchStr) || 
      (user.phone || '').includes(searchStr) ||
      (user.cattery_name || '').toLowerCase().includes(searchStr)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 relative overflow-hidden selection:bg-amber-200">
      <BackgroundGlow />

      <div className="max-w-[1400px] mx-auto px-6 pt-12 relative z-10 animate-fade-in-up">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
          <div>
            <Link 
              href="/dashboard/users" 
              className="cursor-pointer group inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white text-amber-600 hover:bg-white hover:text-amber-700 px-5 py-2.5 rounded-full font-black text-sm mb-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)] hover:-translate-y-0.5 active:scale-95 w-fit"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span> Quay lại Tài khoản & Đối tác
            </Link>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-amber-700 to-stone-800 tracking-tight drop-shadow-sm flex items-center gap-3">
              Duyệt Đối Tác <span className="text-amber-500">🛡️</span>
            </h1>
            <p className="font-bold text-stone-500 mt-3 text-lg">Kiểm tra hồ sơ trại giống và phê duyệt quyền đăng bán.</p>
          </div>
          
          {/* THANH TÌM KIẾM */}
          <div className="relative w-full lg:w-[400px] group">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input 
              type="text" 
              placeholder="Nhập tên, SĐT hoặc tên Trại..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-14 pr-5 py-4 bg-white/70 backdrop-blur-xl border-2 border-white/80 rounded-2xl focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 focus:bg-white outline-none font-bold text-stone-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all placeholder:font-medium placeholder:text-stone-400" 
            />
          </div>
        </div>

        {/* 🎯 TABS */}
        <div className="flex flex-wrap gap-4 mb-10">
          <button 
            onClick={() => setActiveTab('pending')} 
            className={`cursor-pointer relative px-8 py-3.5 rounded-2xl font-black text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'pending' 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_10px_40px_rgba(245,158,11,0.3)] transform -translate-y-1 scale-105' 
                : 'bg-white/60 backdrop-blur-md text-stone-500 border border-white hover:bg-white hover:text-amber-600 hover:shadow-md'
            }`}
          >
            ⏳ Yêu cầu mới
            {activeTab !== 'pending' && breeders.some(e => !e.status || e.status.trim() === '') && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white"></span>
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('active')} 
            className={`cursor-pointer px-8 py-3.5 rounded-2xl font-black text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'active' 
                ? 'bg-stone-900 text-white shadow-[0_10px_40px_rgb(0,0,0,0.2)] transform -translate-y-1 scale-105' 
                : 'bg-white/60 backdrop-blur-md text-stone-500 border border-white hover:bg-white hover:text-stone-800 hover:shadow-md'
            }`}
          >
            <span className={activeTab === 'active' ? 'text-amber-400' : ''}>🐾</span> Đối tác hoạt động
          </button>
        </div>

        {/* 🎯 DANH SÁCH (GRID THẺ) */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
            <p className="font-black text-amber-600 tracking-widest text-sm uppercase animate-pulse">Đang tải hồ sơ...</p>
          </div>
        ) : filteredBreeders.length === 0 ? (
          <div className="text-center py-32 bg-white/40 backdrop-blur-2xl rounded-[3rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
             <div className="w-24 h-24 bg-stone-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 transform rotate-12 opacity-80">🐱</div>
             <h3 className="text-2xl font-black text-stone-800 mb-2">Trống trơn!</h3>
             <p className="text-stone-500 font-medium">Không có hồ sơ nào trong mục này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBreeders.map((user, index) => {
              const isPending = !user.status || user.status.trim() === '';
              
              return (
                <div 
                  key={user.userid} 
                  className="bg-white/60 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-7 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(245,158,11,0.15)] hover:-translate-y-2 hover:bg-white group flex flex-col h-full relative overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Badge Xác Minh */}
                  {!isPending && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-[10px] font-black px-5 py-2 rounded-bl-2xl shadow-md z-10 uppercase tracking-widest flex items-center gap-1">
                      Đã Xác Minh <span className="text-sm">✅</span>
                    </div>
                  )}

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-5 mb-7">
                    <div className={`w-[72px] h-[72px] shrink-0 rounded-full flex items-center justify-center text-white font-black text-3xl shadow-lg border-4 border-white overflow-hidden ${getAvatarColor(user.fullname)} group-hover:scale-105 transition-transform duration-500`}>
                      {user.avatarurl ? <img src={user.avatarurl} className="w-full h-full object-cover" /> : (user.fullname || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-black text-stone-800 truncate group-hover:text-amber-600 transition-colors">
                        {user.fullname || 'Ẩn danh'}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeTab === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${activeTab === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        </span>
                        <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest bg-stone-100/80 px-2 py-0.5 rounded-md">
                          {isPending ? 'Chờ duyệt' : 'Đối tác chính thức'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin liên hệ & Trại */}
                  <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-center gap-4 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100 group-hover:bg-amber-100/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-amber-500">🐾</div>
                      <div>
                         <p className="text-[10px] font-black uppercase text-amber-600/70 tracking-widest">Tên Trại Giống</p>
                         <span className="font-black text-stone-800 text-sm">{user.cattery_name || 'Chưa cập nhật tên trại'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-stone-50/80 p-3.5 rounded-2xl border border-stone-100 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-stone-400">📞</div>
                      <span className="font-bold text-stone-700 text-sm">{user.phone || 'Chưa có số điện thoại'}</span>
                    </div>
                  </div>

                  {/* NÚT TƯƠNG TÁC */}
                  <div className="mt-auto">
                    {activeTab === 'pending' ? (
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => handleReject(user.userid, user.fullname)} className="cursor-pointer py-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-sm hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/30 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center">
                          Từ chối
                        </button>
                        <button onClick={() => handleApprove(user.userid, user.fullname)} className="cursor-pointer py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl font-black text-sm shadow-[0_8px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                          Phê Duyệt
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <Link href={`/dashboard/users/${user.userid}`} className="cursor-pointer py-4 bg-amber-50 text-amber-600 rounded-2xl font-black text-sm hover:bg-amber-100 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center">
                          Xem chi tiết
                        </Link>
                        <button onClick={() => handleReject(user.userid, user.fullname)} className="cursor-pointer py-4 bg-white border-2 border-stone-100 text-stone-400 rounded-2xl font-black text-sm hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-1.5 group/btn">
                          Hủy quyền
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}