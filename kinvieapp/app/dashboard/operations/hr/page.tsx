"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const getAvatarColor = (name: string) => {
  const colors = ['bg-purple-500', 'bg-fuchsia-500', 'bg-violet-500', 'bg-indigo-500', 'bg-pink-500', 'bg-rose-500', 'bg-blue-500', 'bg-emerald-500'];
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

  // 🎯 PHÊ DUYỆT: Chuyển 3 -> 2
  const handleApprove = async (userId: string) => {
    const { error } = await supabase.from('users').update({ type_id: 2 }).eq('userid', userId);
    if (!error) {
      // ✅ CẬP NHẬT STATE NGAY LẬP TỨC
      setEmployees(prev => prev.map(emp => emp.userid === userId ? { ...emp, type_id: 2 } : emp));
      alert("✅ Đã phê duyệt nhân sự!");
    }
  };

  // 🎯 GIÁNG CHỨC/XÓA KHỎI STAFF: Chuyển 2 -> 3
  const handleDowngrade = async (userId: string, empName: string) => {
    if (!window.confirm(`Sếp muốn thu hồi quyền Staff của [${empName}]?`)) return;
    const { error } = await supabase.from('users').update({ type_id: 3 }).eq('userid', userId);
    if (!error) {
      // ✅ CẬP NHẬT STATE NGAY LẬP TỨC
      setEmployees(prev => prev.map(emp => emp.userid === userId ? { ...emp, type_id: 3 } : emp));
      alert("🗑 Đã chuyển nhân sự về nhóm chờ duyệt/khách hàng.");
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
    <div className="min-h-screen bg-stone-50 pb-24 relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-purple-400/20 to-fuchsia-400/20 blur-[100px] pointer-events-none z-0"></div>

      <div className="max-w-[1400px] mx-auto px-6 pt-12 relative z-10 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <Link href="/dashboard/operations" className="group inline-flex items-center gap-2 bg-purple-50 text-purple-600 hover:bg-purple-100 px-5 py-2.5 rounded-full font-bold text-sm mb-4 transition-all duration-300 hover:shadow-md hover:-translate-x-1 active:scale-95 w-fit shadow-sm">
              <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span> Quay lại Beam Petshop
            </Link>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-800 to-stone-500 tracking-tight">Quản lý Nhân sự 👥</h1>
          </div>
          
          <div className="relative w-full md:w-96 group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-purple-500 transition-colors">🔍</span>
            <input type="text" placeholder="Tìm theo tên hoặc SĐT..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-white border border-stone-200/80 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none font-medium text-stone-700 shadow-sm transition-all" />
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <button onClick={() => setActiveTab('active')} className={`px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 shadow-sm ${activeTab === 'active' ? 'bg-purple-600 text-white shadow-[0_4px_20px_rgba(147,51,234,0.3)] transform -translate-y-0.5' : 'bg-white text-stone-500 border border-stone-200 hover:bg-purple-50'}`}>✓ Nhân sự chính thức</button>
          <button onClick={() => setActiveTab('pending')} className={`relative px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 shadow-sm ${activeTab === 'pending' ? 'bg-amber-500 text-white shadow-[0_4px_20px_rgba(245,158,11,0.3)] transform -translate-y-0.5' : 'bg-white text-stone-500 border border-stone-200 hover:bg-amber-50'}`}>
            ⏳ Chờ phê duyệt
            {activeTab !== 'pending' && employees.some(e => e.type_id === 3) && <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping"></span>}
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-32 opacity-60"><div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div><p className="font-bold text-stone-500 tracking-widest text-sm uppercase">Đang tải...</p></div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-32 bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-stone-200/50 shadow-sm"><h3 className="text-xl font-black text-stone-700 mb-2">Trống trơn sếp ạ! 📭</h3></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((emp) => (
              <div key={emp.userid} className="bg-white/80 backdrop-blur-xl border border-stone-200/60 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
                {emp.type_id === 1 && <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl shadow-sm z-10 uppercase tracking-widest">Trùm Cuối 👑</div>}
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-inner border-2 border-white overflow-hidden ${getAvatarColor(emp.fullname)}`}>
                    {emp.avatarurl ? <img src={emp.avatarurl} className="w-full h-full object-cover" /> : (emp.fullname || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="text-lg font-black text-stone-800 truncate group-hover:text-purple-600 transition-colors">{emp.fullname || 'Ẩn danh'}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`w-2 h-2 rounded-full ${activeTab === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{emp.type_id === 3 ? 'Khách/Breeder' : emp.type_id === 1 ? 'Quản trị viên' : 'Nhân viên'}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 mb-6 bg-stone-50/50 rounded-2xl p-4 border border-stone-100 flex-1 text-sm font-bold text-stone-700">
                  <div className="flex items-center gap-3"><span>📞</span> {emp.phone || 'Chưa có SĐT'}</div>
                  <div className="flex items-start gap-3"><span>📍</span> <span className="font-medium text-stone-500 line-clamp-2">{emp.address || 'Chưa cập nhật địa chỉ'}</span></div>
                </div>
                <div className="mt-auto">
                  {activeTab === 'pending' ? (
                    <button onClick={() => handleApprove(emp.userid)} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">✓ Phê duyệt làm Staff</button>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button className="py-3.5 bg-purple-50 text-purple-600 rounded-xl font-bold hover:bg-purple-100 transition-all">Hồ sơ</button>
                      {emp.type_id !== 1 && <button onClick={() => handleDowngrade(emp.userid, emp.fullname)} className="py-3.5 bg-white border border-stone-100 text-stone-400 rounded-xl font-bold hover:text-rose-600 hover:border-rose-100 transition-all flex items-center justify-center gap-1">🗑 Xóa</button>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}