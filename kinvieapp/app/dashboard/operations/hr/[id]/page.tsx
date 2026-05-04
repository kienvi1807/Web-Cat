"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getAvatarColor } from '@/lib/utils';

const ROLE_OPTIONS = [
  { id: 1, name: 'Quản trị viên (Trùm Cuối 👑)' },
  { id: 2, name: 'Nhân viên (Staff)' },
  { id: 3, name: 'Đối tác / Chờ duyệt (Breeder)' },
  { id: 4, name: 'Khách hàng (Đồng)' },
  { id: 5, name: 'Khách hàng (Bạc)' },
  { id: 6, name: 'Khách hàng (Vàng)' },
  { id: 7, name: 'Khách VIP (Bạch Kim)' }
];

export default function EmployeeProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState({
    fullname: '',
    phone: '',
    address: '',
    avatarurl: '', 
    type_id: 2,
    email: ''
  });

  useEffect(() => {
    if (userId) fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('userid', userId)
      .maybeSingle();

    if (data && !error) {
      setProfile({
        fullname: data.fullname || '',
        phone: data.phone || '',
        address: data.address || '',
        avatarurl: data.avatarurl || '',
        type_id: data.type_id || 2,
        email: data.email || '' 
      });
    } else {
      alert("Không tìm thấy dữ liệu nhân sự này!");
      router.push('/dashboard/operations/hr');
    }
    setIsLoading(false);
  };

  const handleSaveChanges = async () => {
    if (!profile.fullname) {
      alert("Tên nhân sự không được để trống!");
      return;
    }
    setIsSaving(true);

    const { error } = await supabase
      .from('users')
      .update({
        fullname: profile.fullname,
        phone: profile.phone,
        address: profile.address,
        email: profile.email, // Cập nhật email luôn
        type_id: Number(profile.type_id)
      })
      .eq('userid', userId);

    setIsSaving(false);

    if (!error) {
      alert("✅ Đã cập nhật hồ sơ nhân sự thành công!");
      router.push('/dashboard/operations/hr');
    } else {
      alert("Lỗi khi lưu: " + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
        <p className="font-black text-stone-400 tracking-widest text-sm uppercase animate-pulse">Đang trích xuất hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 relative overflow-hidden selection:bg-purple-200">
      <div className="fixed top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 mix-blend-multiply filter blur-[120px] animate-blob z-0"></div>
      <div className="fixed top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-400/20 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000 z-0"></div>
      
      <div className="max-w-[1200px] mx-auto px-6 pt-12 relative z-10 animate-fade-in-up">
        
        {/* HEADER SECTION */}
        <div className="mb-10">
          <Link 
            href="/dashboard/operations/hr" 
            className="cursor-pointer group inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white text-purple-600 hover:bg-white hover:text-purple-700 px-5 py-2.5 rounded-full font-black text-sm mb-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(147,51,234,0.15)] hover:-translate-y-0.5 active:scale-95 w-fit"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span> Quay lại Quản lý Nhân sự
          </Link>
          <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-purple-900 to-stone-800 tracking-tight drop-shadow-sm">
            Hồ sơ Chi tiết 📇
          </h1>
          <p className="font-bold text-stone-500 mt-2">Chỉnh sửa thông tin cá nhân và phân quyền hệ thống</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI: THẺ PROFILE NGẮN GỌN (Đã dọn dẹp ID và Email) */}
          <div className="lg:col-span-4">
            <div className="bg-white/60 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8 flex flex-col items-center text-center sticky top-10">
              
              <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white font-black text-5xl shadow-xl border-4 border-white overflow-hidden mb-6 ${getAvatarColor(profile.fullname)} transition-transform hover:scale-105 duration-500`}>
                {profile.avatarurl ? (
                  <img src={profile.avatarurl} className="w-full h-full object-cover" alt="avatar" />
                ) : (
                  (profile.fullname || '?').charAt(0).toUpperCase()
                )}
              </div>
              
              <h2 className="text-2xl font-black text-stone-800 mb-2">{profile.fullname || 'Chưa cập nhật tên'}</h2>
              
              <div className="bg-purple-100 text-purple-700 font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-xl shadow-sm border border-purple-200">
                {ROLE_OPTIONS.find(r => r.id === Number(profile.type_id))?.name || 'Không xác định'}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: FORM CHỈNH SỬA */}
          <div className="lg:col-span-8">
            <div className="bg-white/60 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8 md:p-10">
              <h3 className="text-xl font-black text-stone-800 mb-8 flex items-center gap-3">
                <span className="p-2.5 bg-purple-100 text-purple-600 rounded-2xl">⚙️</span> Thông tin thiết lập
              </h3>

              <div className="space-y-6">
                {/* 1. Họ và tên: cursor-text (Chữ I) */}
                <div>
                  <label className="text-[11px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2 block">Họ và tên đầy đủ</label>
                  <input 
                    type="text" 
                    value={profile.fullname} 
                    onChange={e => setProfile({...profile, fullname: e.target.value})} 
                    className="cursor-text w-full bg-white/70 border-2 border-white rounded-2xl px-5 py-4 font-bold text-base text-stone-800 outline-none focus:border-purple-400 focus:bg-white shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-md transition-all" 
                  />
                </div>

                {/* 2. Email: Đã được chuyển sang đây - cursor-text */}
                <div>
                  <label className="text-[11px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2 block">Địa chỉ Email</label>
                  <input 
                    type="email" 
                    value={profile.email} 
                    onChange={e => setProfile({...profile, email: e.target.value})} 
                    className="cursor-text w-full bg-white/70 border-2 border-white rounded-2xl px-5 py-4 font-bold text-base text-stone-800 outline-none focus:border-purple-400 focus:bg-white shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-md transition-all" 
                  />
                </div>

                {/* 3. Điện thoại & Phân quyền (Chia 2 cột) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2 block">Số điện thoại</label>
                    <input 
                      type="text" 
                      value={profile.phone} 
                      onChange={e => setProfile({...profile, phone: e.target.value})} 
                      className="cursor-text w-full bg-white/70 border-2 border-white rounded-2xl px-5 py-4 font-bold text-base text-stone-800 outline-none focus:border-purple-400 focus:bg-white shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-md transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2 block">Vai trò / Phân quyền (Type_ID)</label>
                    <div className="relative">
                      <select 
                        value={profile.type_id} 
                        onChange={e => setProfile({...profile, type_id: Number(e.target.value)})} 
                        className="cursor-pointer w-full bg-purple-50/50 border-2 border-purple-100 rounded-2xl px-5 py-4 font-black text-sm text-purple-700 outline-none focus:border-purple-400 focus:bg-purple-50 shadow-sm transition-all appearance-none"
                      >
                        {ROLE_OPTIONS.map(role => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-purple-400 font-bold">▼</div>
                    </div>
                  </div>
                </div>

                {/* 4. Địa chỉ: cursor-text */}
                <div>
                  <label className="text-[11px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2 block">Địa chỉ liên hệ</label>
                  <input 
                    type="text" 
                    value={profile.address} 
                    onChange={e => setProfile({...profile, address: e.target.value})} 
                    className="cursor-text w-full bg-white/70 border-2 border-white rounded-2xl px-5 py-4 font-bold text-base text-stone-800 outline-none focus:border-purple-400 focus:bg-white shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-md transition-all" 
                  />
                </div>
              </div>

              {/* NÚT LƯU: cursor-pointer (Bàn tay) */}
              <div className="mt-10 pt-8 border-t border-stone-100 flex justify-end">
                <button 
                  onClick={handleSaveChanges} 
                  disabled={isSaving}
                  className="cursor-pointer w-full md:w-auto px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(147,51,234,0.3)] hover:shadow-[0_10px_40px_rgba(147,51,234,0.5)] hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-3"
                >
                  {isSaving ? (
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                      Lưu Hồ Sơ Nhân Sự
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-blob { animation: blob 10s infinite alternate; }
        .animation-delay-2000 { animation-delay: 2s; }
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
      `}} />
    </div>
  );
}