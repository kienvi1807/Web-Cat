"use client";

import React, { useState, useEffect, useMemo } from 'react';
// 🎯 IMPORT CHUẨN THEO FILE CỦA SẾP
import { supabase } from '@/lib/supabase'; 

const getRoleColor = (role: string, rank: string) => {
  if (role === 'Boss') return 'bg-rose-50 text-rose-600 border-rose-200';
  if (role === 'Staff') return 'bg-purple-50 text-purple-600 border-purple-200';
  if (role === 'Breeder') return 'bg-amber-50 text-amber-600 border-amber-200';
  
  switch(rank) {
    case 'Kim Cương': return 'bg-cyan-50 text-cyan-600 border-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.3)]';
    case 'Lục Bảo': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'Bạch Kim': return 'bg-slate-100 text-slate-700 border-slate-300';
    case 'Vàng': return 'bg-yellow-50 text-yellow-600 border-yellow-300';
    case 'Bạc': return 'bg-stone-100 text-stone-600 border-stone-200';
    default: return 'bg-orange-50 text-orange-600 border-orange-200';
  }
};

export default function AccountListPage() {
  // Dùng <any[]> giống sếp để không bị TypeScript báo lỗi lặt vặt
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterRank, setFilterRank] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // 🎯 FETCH DATA SUPABASE DÙNG IMPORT CỦA SẾP
  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const fetchUsersAndRoles = async () => {
    setIsLoading(true);
    
    try {
      // Dùng cú pháp JOIN của Supabase để lấy luôn role và rank_name từ bảng type_users
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          type_users:type_id (
            role,
            rank_name
          )
        `)
        .order('createdat', { ascending: false });

      if (error) {
        console.error("Lỗi lấy dữ liệu người dùng:", error);
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      console.error("Lỗi hệ thống:", err);
    }
    
    setIsLoading(false);
  };

  // Lấy ra danh sách các Hạng khách hàng có trong DB để làm Dropdown
  const availableRanks = useMemo(() => {
    const ranks = users.filter(u => u.type_users?.role === 'Customer' && u.type_users?.rank_name).map(u => u.type_users.rank_name);
    return [...new Set(ranks)];
  }, [users]);

  // 🎯 XỬ LÝ LỌC VÀ SẮP XẾP DATA (Siêu mượt)
  const processedUsers = useMemo(() => {
    let result = [...users];

    // 1. Lọc Tìm kiếm
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(u => 
        (u.fullname?.toLowerCase().includes(lowerSearch)) ||
        (u.email?.toLowerCase().includes(lowerSearch)) ||
        (u.phone?.includes(searchTerm))
      );
    }

    // 2. Lọc Vai trò
    if (filterRole !== 'All') {
      result = result.filter(u => u.type_users?.role === filterRole);
    }

    // 3. Lọc Hạng (Chỉ cho Customer)
    if (filterRank !== 'All' && (filterRole === 'All' || filterRole === 'Customer')) {
      result = result.filter(u => u.type_users?.rank_name === filterRank);
    }

    // 4. Sắp xếp
    result.sort((a, b) => {
      const dateA = new Date(a.createdat).getTime();
      const dateB = new Date(b.createdat).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [users, searchTerm, filterRole, filterRank, sortBy]);

  return (
    // Dùng max-w-7xl để chứa đủ cái bảng, nhưng layout giữ nguyên Petshop
    <div className="space-y-10 animate-fade-in max-w-7xl mx-auto pb-16 px-4">
      
      {/* HEADER ĐỒNG BỘ PETSHOP */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-black text-stone-800 flex items-center justify-center gap-3">
          Hệ thống Tài khoản <span className="text-4xl animate-bounce">🥷</span>
        </h1>
        <p className="text-stone-500 mt-3 text-lg">Quản lý phân quyền, kiểm duyệt đối tác và thông tin người dùng.</p>
      </div>

      {/* 🎯 KHỐI CONTAINER CHÍNH CÓ HIỆU ỨNG GLASSMORPHISM & LASER (CHUẨN PETSHOP) */}
      <div className="relative group/section z-10">
        
        {/* Lớp Hào Quang Tỏa Ra Phía Sau (Tone Cyan) */}
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/0 via-cyan-400/10 to-blue-500/0 rounded-[3.5rem] blur-2xl opacity-0 group-hover/section:opacity-100 transition-opacity duration-1000 -z-10"></div>

        {/* Khối Container Kính Mờ */}
        <div className="relative bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-500 hover:border-slate-200/80 hover:shadow-[0_8px_50px_rgba(34,211,238,0.1)]">

          {/* Họa tiết Lưới Chấm Bi Mờ */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          {/* Vệt Laser quét ngang viền trên khi hover (Đổi sang màu Cyan) */}
          <div className="absolute top-0 left-0 w-full h-[3px] opacity-0 group-hover/section:opacity-100 transition-opacity duration-500 overflow-hidden pointer-events-none">
             <div className="w-[100%] h-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent -translate-x-full group-hover/section:translate-x-full transition-transform duration-[1500ms] ease-in-out"></div>
          </div>

          {/* NỘI DUNG Z-10 NẰM TRONG CONTAINER */}
          <div className="relative z-10 space-y-6">
            
            {/* Thanh Search & Filter */}
            <div className="flex flex-col lg:flex-row gap-4 items-center mb-6">
              <div className="relative flex-1 w-full">
                  <input 
                      type="text" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm ID, Tên, Email hoặc SĐT..." 
                      className="w-full bg-white/80 border border-cyan-100 rounded-2xl px-12 py-4 text-sm font-bold focus:ring-2 focus:ring-cyan-400 outline-none transition-all shadow-inner"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50">🔍</span>
              </div>
              
              <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setFilterRank('All'); }} className="w-full lg:w-48 bg-stone-50 border border-stone-200 text-stone-700 text-xs font-black uppercase tracking-wider rounded-2xl px-4 py-4 outline-none focus:border-cyan-400 cursor-pointer">
                <option value="All">Tất cả vai trò</option>
                <option value="Customer">Khách Hàng</option>
                <option value="Breeder">Đối Tác</option>
                <option value="Staff">Nhân Viên</option>
                <option value="Boss">Quản Trị</option>
              </select>

              {(filterRole === 'All' || filterRole === 'Customer') && (
                <select value={filterRank} onChange={(e) => setFilterRank(e.target.value)} className="w-full lg:w-48 bg-stone-50 border border-stone-200 text-stone-700 text-xs font-black uppercase tracking-wider rounded-2xl px-4 py-4 outline-none focus:border-cyan-400 cursor-pointer">
                  <option value="All">Mọi Hạng VIP</option>
                  {availableRanks.map(rank => (
                    <option key={rank} value={rank}>{rank}</option>
                  ))}
                </select>
              )}

              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full lg:w-40 bg-cyan-500 text-white border border-cyan-400 text-xs font-black uppercase tracking-wider rounded-2xl px-4 py-4 outline-none hover:bg-cyan-600 transition-colors cursor-pointer text-center">
                <option value="newest">Mới nhất ↓</option>
                <option value="oldest">Cũ nhất ↑</option>
              </select>
            </div>

            {/* BẢNG DATA TRONG SUỐT NẰM TRONG CONTAINER */}
            <div className="bg-white/40 rounded-[2rem] border border-white shadow-inner overflow-hidden overflow-x-auto">
              {isLoading ? (
                <div className="p-20 text-center text-stone-400 font-bold animate-pulse">Đang đồng bộ dữ liệu từ hệ thống...</div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-stone-100/50 bg-white/50">
                      <th className="p-6 text-[11px] font-black text-stone-400 uppercase tracking-widest">ID & Thông tin</th>
                      <th className="p-6 text-[11px] font-black text-stone-400 uppercase tracking-widest">Vai trò & Hạng</th>
                      <th className="p-6 text-[11px] font-black text-stone-400 uppercase tracking-widest">Trạng thái</th>
                      <th className="p-6 text-[11px] font-black text-stone-400 uppercase tracking-widest text-right">Ngày tham gia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50/50">
                    {processedUsers.length === 0 && (
                      <tr><td colSpan={4} className="p-10 text-center text-stone-400 font-bold">Không tìm thấy tài khoản.</td></tr>
                    )}
                    {processedUsers.map((user) => {
                      const role = user.type_users?.role || 'Unknown';
                      const rank = user.type_users?.rank_name || 'Unknown';
                      
                      return (
                        <tr key={user.userid} className="hover:bg-cyan-50/40 transition-colors">
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-50 border-2 border-white shadow-sm flex items-center justify-center font-black text-cyan-600 shrink-0">
                                {user.fullname?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="font-black text-stone-800 text-sm tracking-tight">{user.fullname}</p>
                                <p className="text-[11px] text-stone-500 mt-0.5">KV-{user.userid} • {user.phone}</p>
                                <p className="text-[11px] text-cyan-600 font-bold">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex flex-col items-start gap-1.5">
                              <span className={`border px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getRoleColor(role, rank)}`}>
                                {role}
                              </span>
                              <span className="text-xs font-bold text-stone-600">
                                {role === 'Breeder' && user.cattery_name ? `🐾 ${user.cattery_name}` : rank}
                              </span>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                              <span className="text-[10px] font-black uppercase text-stone-600">{user.status}</span>
                            </div>
                          </td>
                          <td className="p-6 text-right text-xs font-bold text-stone-400">
                            {new Date(user.createdat).toLocaleDateString('vi-VN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}