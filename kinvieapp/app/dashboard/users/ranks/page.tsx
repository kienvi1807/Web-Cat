"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import BackgroundGlow from '@/components/layout/BackgroundGlow';
import { useLayoutStore } from '@/store/useLayoutStore';
import GlassSelect from '@/components/ui/GlassSelect';

// 🎯 MAP HẠNG VỚI TYPE_ID (ID từ 4 -> 9 là Khách hàng)
const RANK_TYPE_MAP = {
  'Đồng': 4,
  'Bạc': 5,
  'Vàng': 6,
  'Bạch Kim': 7,
  'Lục Bảo': 8,
  'Kim Cương': 9,
};

const getRankBadge = (rank: string) => {
  switch(rank) {
    case 'Kim Cương': return 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] border-none';
    case 'Lục Bảo': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 'Bạch Kim': return 'bg-slate-200 text-slate-800 border-slate-400 shadow-sm';
    case 'Vàng': return 'bg-yellow-100 text-yellow-700 border-yellow-400';
    case 'Bạc': return 'bg-stone-200 text-stone-700 border-stone-300';
    default: return 'bg-white text-stone-500 border-stone-200';
  }
};

export default function RankManagementPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRank, setFilterRank] = useState('All');
  
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [selectedRankId, setSelectedRankId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const setThemeColor = useLayoutStore(state => state.setThemeColor);

  useEffect(() => {
    setThemeColor('blue'); 
  }, [setThemeColor]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    
    // 🎯 FIX: Lấy mảng ID của Khách hàng [4, 5, 6, 7, 8, 9] để lọc trực tiếp
    const customerTypeIds = Object.values(RANK_TYPE_MAP);

    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        type_users:type_id (role, rank_name)
      `)
      .in('type_id', customerTypeIds); // Lọc trực tiếp bằng ID không qua Join
      // Đã bỏ .order('points') ở API để tránh sập nếu chưa có cột
      
    if (!error && data) {
      setCustomers(data);
    } else {
      console.error("Lỗi tải dữ liệu khách hàng:", error);
    }
    setIsLoading(false);
  };

  // 🎯 FIX: Đưa logic sắp xếp điểm về cho Client (An toàn tuyệt đối)
  const filteredCustomers = useMemo(() => {
    let result = customers.filter(user => {
      const rank = user.type_users?.rank_name || 'Đồng';
      const matchesRank = filterRank === 'All' ? true : rank === filterRank;
      const searchStr = searchQuery.toLowerCase();
      const matchesSearch = (user.fullname || '').toLowerCase().includes(searchStr) || (user.phone || '').includes(searchStr);
      return matchesRank && matchesSearch;
    });

    // Sắp xếp theo điểm giảm dần (Không có điểm thì mặc định là 0)
    result.sort((a, b) => (b.points || 0) - (a.points || 0));

    return result;
  }, [customers, searchQuery, filterRank]);

  const availableRanks = Object.keys(RANK_TYPE_MAP);

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setSelectedRankId(user.type_id);
  };

  const handleSaveRank = async () => {
    if (!editingUser || !selectedRankId) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({ type_id: selectedRankId })
        .eq('userid', editingUser.userid);

      if (error) throw error;

      const newRankName = Object.keys(RANK_TYPE_MAP).find(key => RANK_TYPE_MAP[key as keyof typeof RANK_TYPE_MAP] === selectedRankId);
      
      setCustomers(prev => prev.map(u => {
        if (u.userid === editingUser.userid) {
          return {
            ...u,
            type_id: selectedRankId,
            type_users: { ...u.type_users, rank_name: newRankName }
          };
        }
        return u;
      }));

      setEditingUser(null);
    } catch (err) {
      console.error("Lỗi cập nhật hạng:", err);
      alert("❌ Cập nhật thất bại!");
    }
    setIsSaving(false);
  };

  const rankOptions = [
    { value: 'All', label: 'Tất cả các hạng', iconOrImage: '🌟' },
    ...availableRanks.map(rank => ({ value: rank, label: rank, iconOrImage: '💎' }))
  ];

  const editRankOptions = availableRanks.map(rank => ({
    value: RANK_TYPE_MAP[rank as keyof typeof RANK_TYPE_MAP],
    label: rank,
    iconOrImage: '💎'
  }));

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 relative overflow-hidden selection:bg-blue-200">
      <BackgroundGlow />

      <div className="max-w-[1400px] mx-auto px-6 pt-12 relative z-10 animate-fade-in-up">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-8">
          <div>
            <Link 
              href="/dashboard/users" 
              className="cursor-pointer group inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white text-blue-600 hover:bg-white hover:text-blue-700 px-5 py-2.5 rounded-full font-black text-sm mb-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:-translate-y-0.5 active:scale-95 w-fit"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span> Quay lại Tài khoản & Đối tác
            </Link>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-blue-600 to-stone-800 tracking-tight drop-shadow-sm flex items-center gap-3">
              Hạng & Tích Điểm <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">💎</span>
            </h1>
            <p className="font-bold text-stone-500 mt-3 text-lg">Quản lý điểm số và chính sách nâng hạng cho khách hàng.</p>
          </div>
        </div>

        {/* THÔNG TIN POLICY */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-3xl p-6 mb-10 shadow-inner flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl text-blue-500">📈</div>
            <div>
              <h3 className="font-black text-blue-800">Quy tắc tích điểm hệ thống</h3>
              <p className="text-sm font-bold text-blue-600/70 mt-1">Pate: 100k = 10đ | Petshop: 100k = 1đ | <span className="text-rose-500">Mua Mèo KinVie: Auto Kim Cương</span></p>
            </div>
          </div>
        </div>

        {/* THANH LỌC */}
        <div className="bg-white/60 backdrop-blur-2xl p-4 md:p-6 rounded-[2rem] border border-blue-100 shadow-[0_8px_30px_rgba(59,130,246,0.05)] mb-8 flex flex-col lg:flex-row gap-4 items-center relative z-20">
          <div className="relative flex-1 w-full group">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-blue-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input 
              type="text" 
              placeholder="Nhập tên hoặc SĐT khách hàng..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-14 pr-5 py-4 bg-white/70 backdrop-blur-xl border border-stone-200 rounded-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 outline-none font-bold text-stone-800 transition-all placeholder:text-stone-400" 
            />
          </div>
          
          <div className="w-full lg:w-64">
            <GlassSelect 
              id="rank-filter" 
              options={rankOptions} 
              selectedValue={filterRank} 
              onChange={setFilterRank} 
              themeColor="cyan" 
            />
          </div>
        </div>

        {/* DANH SÁCH */}
        <div className="relative z-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="font-black text-blue-600 tracking-widest text-sm uppercase animate-pulse">Đang quét dữ liệu điểm...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-32 bg-white/40 backdrop-blur-2xl rounded-[3rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
               <div className="w-24 h-24 bg-stone-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 opacity-80">🕵️</div>
               <h3 className="text-2xl font-black text-stone-800 mb-2">Chưa có khách hàng!</h3>
               <p className="text-stone-500 font-medium">Không tìm thấy khách hàng nào khớp với điều kiện lọc.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredCustomers.map((user, index) => {
                const rankName = user.type_users?.rank_name || 'Đồng';
                const points = user.points || 0; 

                return (
                  <div 
                    key={user.userid} 
                    className="group relative bg-white/70 backdrop-blur-xl rounded-[1.5rem] p-4 md:p-5 border border-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(59,130,246,0.1)] hover:border-blue-200 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-8 overflow-hidden"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="relative z-10 shrink-0">
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-cyan-50 border-2 border-white shadow-sm z-10 flex items-center justify-center font-black text-2xl text-blue-600 group-hover:scale-105 transition-transform duration-300">
                        {user.avatarurl ? <img src={user.avatarurl} className="w-full h-full rounded-full object-cover" /> : (user.fullname || '?').charAt(0).toUpperCase()}
                      </div>
                    </div>

                    <div className="relative z-10 flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                        <h3 className="font-black text-stone-800 text-xl truncate group-hover:text-blue-600 transition-colors">
                          {user.fullname || 'Ẩn danh'}
                        </h3>
                        <span className={`border px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${getRankBadge(rankName)}`}>
                          {rankName === 'Kim Cương' ? '💎' : '⭐'} {rankName}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-stone-500">
                        <span className="font-bold text-stone-400">KV-{user.userid}</span>
                        <span className="flex items-center gap-1.5"><span className="text-blue-400">📞</span> {user.phone || 'Trống'}</span>
                      </div>
                    </div>

                    <div className="relative z-10 shrink-0 w-full md:w-auto flex items-center gap-4 bg-blue-50/50 p-3 pr-6 rounded-2xl border border-blue-100/50">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl">🪙</div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Điểm tích lũy</span>
                        <span className="font-black text-2xl text-blue-700 leading-none mt-0.5">
                          {new Intl.NumberFormat('vi-VN').format(points)} <span className="text-sm font-bold text-blue-400">pts</span>
                        </span>
                      </div>
                    </div>

                    <div className="relative z-10 shrink-0 mt-4 md:mt-0 w-full md:w-auto flex justify-end">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="cursor-pointer px-6 py-3.5 bg-white border-2 border-stone-100 text-stone-600 rounded-2xl font-black text-sm hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2 w-full md:w-auto justify-center"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        Điều chỉnh Hạng
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL ÉP HẠNG */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm cursor-pointer transition-opacity cursor-pointer" onClick={() => setEditingUser(null)}></div>
          
          <div className="relative bg-white/90 backdrop-blur-2xl border border-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-md animate-fade-in-up">
            
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-blue-600">Điều chỉnh Hạng VIP</h3>
                <p className="text-sm font-bold text-stone-400 mt-1">Khách: {editingUser.fullname}</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-stone-400 hover:text-rose-500 transition-colors cursor-pointer w-8 h-8 flex justify-end">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex justify-between items-center">
                 <span className="text-sm font-black text-stone-500">Điểm hiện tại:</span>
                 <span className="text-xl font-black text-blue-600">{new Intl.NumberFormat('vi-VN').format(editingUser.points || 0)}</span>
              </div>

              <div className="relative z-[110]">
                <GlassSelect 
                  id="edit-rank-modal"
                  label="Chọn hạng muốn cấp (Ép hạng)"
                  options={editRankOptions}
                  selectedValue={selectedRankId}
                  onChange={setSelectedRankId}
                  themeColor="cyan"
                />
              </div>
              
              <p className="text-[11px] font-bold text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 leading-relaxed">
                ⚠️ Lưu ý: Việc thay đổi hạng bằng tay sẽ ghi đè lên hệ thống tính điểm tự động. Đặc quyền Kim Cương chỉ nên ép cho khách mua Mèo KinVie.
              </p>
            </div>

            <div className="mt-10 flex gap-4">
              <button onClick={() => setEditingUser(null)} className="cursor-pointer flex-1 py-4 rounded-2xl font-black text-stone-500 bg-stone-100 hover:bg-stone-200 transition-colors">
                HỦY
              </button>
              <button 
                onClick={handleSaveRank}
                disabled={isSaving}
                className="cursor-pointer flex-1 py-4 rounded-2xl font-black text-white bg-blue-500 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isSaving ? <span className="animate-pulse">ĐANG LƯU...</span> : 'LƯU HẠNG MỚI'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}