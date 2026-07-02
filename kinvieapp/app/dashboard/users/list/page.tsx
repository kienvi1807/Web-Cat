"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase'; 
import GlassSelect from '@/components/ui/GlassSelect'; 

const getRoleColor = (role: string, rank: string) => {
  if (role === 'Boss') return 'bg-stone-900 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]';
  if (role === 'Staff') return 'bg-cyan-50 text-cyan-600 border-cyan-200';
  if (role === 'Breeder') return 'bg-amber-50 text-amber-600 border-amber-200';
  
  switch(rank) {
    case 'Kim Cương': return 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 border-cyan-300 shadow-sm';
    case 'Lục Bảo': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'Bạch Kim': return 'bg-slate-100 text-slate-700 border-slate-300';
    case 'Vàng': return 'bg-yellow-50 text-yellow-600 border-yellow-300';
    case 'Bạc': return 'bg-stone-100 text-stone-600 border-stone-200';
    default: return 'bg-white text-stone-500 border-stone-200';
  }
};

export default function AccountListPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterRank, setFilterRank] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // 🎯 STATES CHO MODAL CHỈNH SỬA
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ fullname: '', phone: '', age: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const fetchUsersAndRoles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`*, type_users:type_id (role, rank_name)`)
        .order('createdat', { ascending: false });

      if (error) console.error("Lỗi:", error);
      else setUsers(data || []);
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  const availableRanks = useMemo(() => {
    const ranks = users.filter(u => u.type_users?.role === 'Customer' && u.type_users?.rank_name).map(u => u.type_users.rank_name);
    return [...new Set(ranks)];
  }, [users]);

  const processedUsers = useMemo(() => {
    let result = [...users];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(u => (u.fullname?.toLowerCase().includes(lowerSearch)) || (u.email?.toLowerCase().includes(lowerSearch)) || (u.phone?.includes(searchTerm)));
    }
    if (filterRole !== 'All') result = result.filter(u => u.type_users?.role === filterRole);
    if (filterRank !== 'All' && (filterRole === 'All' || filterRole === 'Customer')) {
      result = result.filter(u => u.type_users?.rank_name === filterRank);
    }
    result.sort((a, b) => {
      const dateA = new Date(a.createdat).getTime();
      const dateB = new Date(b.createdat).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return result;
  }, [users, searchTerm, filterRole, filterRank, sortBy]);

  // 🎯 LOGIC XÓA (ĐÃ NÂNG CẤP BẮT LỖI CHI TIẾT)
  const handleDeleteUser = async (userId: string, userName: string) => {
    const isConfirm = window.confirm(`⚠️ CẢNH BÁO: Bạn muốn xóa tài khoản "${userName}"?\nHành động này không thể hoàn tác!`);
    if (!isConfirm) return;

    try {
      const { error } = await supabase.from('users').delete().eq('userid', userId);
      
      // Nếu Supabase trả về lỗi (Ví dụ: dính khóa ngoại)
      if (error) {
        console.error("LỖI SUPABASE:", error);
        alert(`❌ Xóa thất bại!\nLỗi hệ thống: ${error.message}\n\nGợi ý: Tài khoản này có thể đang chứa dữ liệu (Mèo, Đơn hàng...). Bạn cần xóa dữ liệu liên quan trước khi xóa tài khoản này.`);
        return;
      }

      // Xóa thành công
      setUsers(users.filter(u => u.userid !== userId));
      alert(`✅ Đã xóa tài khoản "${userName}" thành công!`);
    } catch (err) {
      console.error("Lỗi JS:", err);
      alert("❌ Lỗi không xác định! Vui lòng kiểm tra console.");
    }
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setEditForm({
      fullname: user.fullname || '',
      phone: user.phone || '',
      age: user.age || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          fullname: editForm.fullname,
          phone: editForm.phone,
          age: editForm.age ? parseInt(editForm.age) : null
        })
        .eq('userid', editingUser.userid);

      if (error) throw error;

      setUsers(users.map(u => u.userid === editingUser.userid ? { ...u, ...editForm } : u));
      setEditingUser(null);
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      alert("Lỗi khi lưu thông tin!");
    }
    setIsSaving(false);
  };

  const roleOptions = [
    { value: 'All', label: 'Tất cả vai trò', iconOrImage: '👥' },
    { value: 'Customer', label: 'Khách Hàng', iconOrImage: '🛍️' },
    { value: 'Breeder', label: 'Đối Tác', iconOrImage: '🐾' },
    { value: 'Staff', label: 'Nhân Viên', iconOrImage: '👔' },
    { value: 'Boss', label: 'Quản Trị', iconOrImage: '👑' },
  ];

  const rankOptions = [
    { value: 'All', label: 'Mọi Hạng VIP', iconOrImage: '🌟' },
    ...availableRanks.map(rank => ({ value: rank, label: rank, iconOrImage: '💎' }))
  ];

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất', subLabel: 'Giảm dần', iconOrImage: '⬇️' },
    { value: 'oldest', label: 'Cũ nhất', subLabel: 'Tăng dần', iconOrImage: '⬆️' },
  ];

  return (
    <div className="space-y-10 animate-fade-in max-w-[1400px] mx-auto pb-24 px-4 relative">
      
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-400/10 mix-blend-multiply filter blur-[120px] animate-blob pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 mix-blend-multiply filter blur-[150px] animate-blob animation-delay-2000 pointer-events-none z-0"></div>

      <div className="text-center mb-12 relative z-10">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-800 via-cyan-800 to-stone-800 tracking-tight drop-shadow-sm flex items-center justify-center gap-4">
          Hệ thống Tài khoản <span className="animate-pulse text-cyan-500">🥷</span>
        </h1>
        <p className="text-stone-500 mt-4 text-lg font-medium">Quản lý phân quyền, hồ sơ và thông tin liên lạc của toàn bộ hệ thống.</p>
      </div>

      <div className="relative z-10 flex flex-col gap-8">
        
        {/* THANH LỌC */}
        <div className="bg-white/60 backdrop-blur-2xl p-4 md:p-6 rounded-[2rem] border border-cyan-100 shadow-[0_8px_30px_rgba(34,211,238,0.05)] flex flex-col lg:flex-row gap-4 items-center relative z-20">
          <div className="relative flex-1 w-full">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm ID, Tên, Email hoặc SĐT..." className="w-full bg-white/80 border border-stone-200 rounded-2xl px-12 py-3.5 text-sm font-bold focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all shadow-inner"/>
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl opacity-40">🔍</span>
          </div>
          <div className="w-full lg:w-48"><GlassSelect id="role-filter" options={roleOptions} selectedValue={filterRole} onChange={(val) => { setFilterRole(val); setFilterRank('All'); }} themeColor="cyan" /></div>
          {(filterRole === 'All' || filterRole === 'Customer') && (
            <div className="w-full lg:w-48 animate-fade-in"><GlassSelect id="rank-filter" options={rankOptions} selectedValue={filterRank} onChange={setFilterRank} themeColor="cyan" /></div>
          )}
          <div className="w-full lg:w-48"><GlassSelect id="sort-filter" options={sortOptions} selectedValue={sortBy} onChange={setSortBy} themeColor="cyan" /></div>
        </div>

        {/* 🎯 GIAO DIỆN LIST NGANG (HORIZONTAL LIST) */}
        <div className="relative z-10">
          {isLoading ? (
            <div className="py-20 text-center"><div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div><p className="text-cyan-600 font-bold animate-pulse">Đang tải hồ sơ...</p></div>
          ) : processedUsers.length === 0 ? (
            <div className="text-center py-20 bg-white/50 backdrop-blur-md rounded-[2rem] border border-cyan-50 shadow-sm"><span className="text-5xl inline-block mb-4 opacity-30">📭</span><p className="text-stone-400 font-bold text-lg">Không tìm thấy tài khoản.</p></div>
          ) : (
            <div className="flex flex-col gap-4"> {/* Bỏ Grid, Dùng Flex Col */}
              {processedUsers.map((user) => {
                const role = user.type_users?.role || 'Unknown';
                const rank = user.type_users?.rank_name || 'Unknown';
                
                return (
                  <div 
                    key={user.userid} 
                    className="group relative bg-white/70 backdrop-blur-xl rounded-[1.5rem] p-4 md:p-5 border border-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(34,211,238,0.1)] hover:border-cyan-200 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-8 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none"></div>
                    
                    {/* 1. KHỐI AVATAR */}
                    <div className="relative z-10 shrink-0">
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
                      <img src={user.avatarurl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname || 'User')}&background=cffafe&color=0891b2&bold=true`} alt="Avatar" className="relative w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm z-10" />
                    </div>

                    {/* 2. KHỐI THÔNG TIN CÁ NHÂN (Cho phép full width không cắt chữ) */}
                    <div className="relative z-10 flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                        <h3 className="font-black text-stone-800 text-xl group-hover:text-cyan-600 transition-colors">
                          {user.fullname}
                        </h3>
                        {/* Badges nằm ngang cạnh tên trên Desktop */}
                        <div className="flex flex-wrap gap-2">
                          <span className={`border px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${getRoleColor(role, rank)}`}>{role}</span>
                          {role === 'Customer' && <span className="border border-stone-200 bg-white/80 px-2 py-1 rounded-xl text-[10px] font-bold text-stone-600 flex items-center gap-1">💎 {rank}</span>}
                          {role === 'Breeder' && user.cattery_name && <span className="border border-amber-200 bg-amber-50 px-2 py-1 rounded-xl text-[10px] font-bold text-amber-700">🐾 {user.cattery_name}</span>}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-stone-500">
                        <span className="font-bold text-stone-400">ID: KV-{user.userid}</span>
                        <span>🎂 {user.age ? `${user.age} tuổi` : 'Chưa rõ tuổi'}</span>
                        <span>Tham gia: <strong className="text-stone-700">{new Date(user.createdat).toLocaleDateString('vi-VN')}</strong></span>
                      </div>
                    </div>

                    {/* 3. KHỐI LIÊN HỆ */}
                    <div className="relative z-10 shrink-0 w-full md:w-48 space-y-1.5 bg-stone-50/50 p-3 rounded-xl border border-stone-100">
                      <div className="flex items-center gap-3 text-sm"><span className="text-cyan-500">✉️</span><span className="text-stone-600 font-medium truncate" title={user.email}>{user.email || 'Trống'}</span></div>
                      <div className="flex items-center gap-3 text-sm"><span className="text-cyan-500">📞</span><span className="text-stone-600 font-medium">{user.phone || 'Trống'}</span></div>
                    </div>

                    {/* 4. KHỐI NÚT ACTION */}
                    <div className="relative z-10 shrink-0 flex gap-2 w-full md:w-auto justify-end">
                      <button onClick={() => openEditModal(user)} className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center cursor-pointer hover:bg-cyan-500 hover:text-white hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300" title="Chỉnh sửa tài khoản">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                      </button>
                      <button onClick={() => handleDeleteUser(user.userid, user.fullname)} className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center cursor-pointer hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/30 transition-all duration-300" title="Xóa tài khoản">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL SỬA */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm cursor-pointer cursor-pointer" onClick={() => setEditingUser(null)}></div>
          <div className="relative bg-white/90 backdrop-blur-2xl border border-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-md animate-fade-in-up">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-cyan-600">Sửa Thông Tin</h3>
              <button onClick={() => setEditingUser(null)} className="text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="space-y-5">
              <div><label className="text-[10px] font-black text-stone-500 uppercase tracking-widest block mb-2">Họ và Tên</label><input type="text" value={editForm.fullname} onChange={(e) => setEditForm({...editForm, fullname: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-cyan-400 outline-none" /></div>
              <div><label className="text-[10px] font-black text-stone-500 uppercase tracking-widest block mb-2">Số Điện Thoại</label><input type="text" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-cyan-400 outline-none" /></div>
              <div><label className="text-[10px] font-black text-stone-500 uppercase tracking-widest block mb-2">Tuổi (Tùy chọn)</label><input type="number" value={editForm.age} onChange={(e) => setEditForm({...editForm, age: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-cyan-400 outline-none" /></div>
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={() => setEditingUser(null)} className="flex-1 py-4 rounded-2xl font-black text-stone-500 bg-stone-100 hover:bg-stone-200 cursor-pointer">HỦY</button>
              <button onClick={handleSaveEdit} disabled={isSaving} className="flex-1 py-4 rounded-2xl font-black text-white bg-cyan-500 hover:bg-cyan-600 hover:shadow-lg cursor-pointer disabled:opacity-50">{isSaving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}