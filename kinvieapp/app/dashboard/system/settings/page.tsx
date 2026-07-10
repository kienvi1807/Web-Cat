"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import BackgroundGlow from '@/components/layout/BackgroundGlow';
import { useLayoutStore } from '@/store/useLayoutStore';
import BannerManager from '@/components/dashboard/BannerManager';

export default function SystemSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State lưu trữ toàn bộ cấu hình
  const [settings, setSettings] = useState({
    theme_mode: 'light',
    hotline: '',
    zalo: '',
    email: '',
    facebook_url: '',
    facebook_cattery_url: '',
    tiktok_url: '',
    instagram_url: ''
  });

  const setThemeColor = useLayoutStore(state => state.setThemeColor);

  useEffect(() => {
    setThemeColor('teal'); // Tone màu Xám/Đen chuyên nghiệp cho trang Cài đặt
    fetchSettings();
  }, [setThemeColor]);

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (!error && data) {
      setSettings(data);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1)
        .select(); // 🎯 thêm .select() để biết chính xác có dòng nào được update không

      if (error) throw error;

      if (!data || data.length === 0) {
        alert("⚠️ Không tìm thấy dòng cấu hình id=1 trong bảng system_settings. Cần insert dòng đầu tiên trước (xem hướng dẫn SQL).");
        return;
      }

      alert("✅ Đã lưu cấu hình hệ thống thành công!");
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi lưu cấu hình!");
    }
    setIsSaving(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 relative overflow-hidden selection:bg-slate-200">
      <BackgroundGlow />

      <div className="max-w-5xl mx-auto px-6 pt-12 relative z-10 animate-fade-in-up">

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <Link href="/dashboard/system" className="cursor-pointer group inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white text-slate-600 hover:bg-white px-5 py-2.5 rounded-full font-black text-sm mb-6 transition-all hover:shadow-md w-fit">
              <span className="transition-transform group-hover:-translate-x-1">←</span> Quay lại Hệ thống
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-slate-700 to-stone-800 tracking-tight flex items-center gap-3">
              Cài đặt Giao diện <span className="text-slate-700">⚙️</span>
            </h1>
            <p className="font-bold text-stone-500 mt-3 text-lg">Tùy chỉnh thông tin liên hệ, mạng xã hội và chế độ hiển thị.</p>
          </div>

          {/* NÚT LƯU TRÊN HEADER */}
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="cursor-pointer px-10 py-4 bg-slate-800 text-white rounded-2xl font-black text-sm shadow-[0_8px_20px_rgba(30,41,59,0.3)] hover:bg-slate-900 hover:shadow-[0_8px_25px_rgba(30,41,59,0.4)] hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <><span className="animate-spin text-lg">⚙️</span> ĐANG LƯU...</>
            ) : (
              <>💾 LƯU THAY ĐỔI</>
            )}
          </button>
        </div>

        {isLoading ? (
          <div className="py-40 text-center"><div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div><p className="font-black text-slate-600 animate-pulse uppercase">Đang tải cấu hình...</p></div>
        ) : (
          <div className="space-y-8">

            {/* 🎯 SECTION 1: CHẾ ĐỘ HIỂN THỊ (THEME) */}
            <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-sm rounded-[2.5rem] p-8 md:p-10 transition-all hover:shadow-md">
              <div className="flex items-center gap-4 mb-8 border-b border-stone-100 pb-6">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">🎨</div>
                <div>
                  <h2 className="text-xl font-black text-stone-800">Chế độ hiển thị (Theme)</h2>
                  <p className="text-sm font-bold text-stone-500 mt-1">Cài đặt giao diện mặc định cho khách hàng khi truy cập website.</p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-stone-50 border border-stone-200 p-6 rounded-3xl">
                <div>
                  <h4 className="font-black text-stone-800">Giao diện Sáng / Tối</h4>
                  <p className="text-xs font-bold text-stone-400 mt-1">Hiện tại đang ở chế độ: <span className="uppercase text-slate-600">{settings.theme_mode}</span></p>
                </div>

                {/* Công tắc Toggle UI/UX chuẩn Apple */}
                <button
                  onClick={() => setSettings({ ...settings, theme_mode: settings.theme_mode === 'light' ? 'dark' : 'light' })}
                  className={`cursor-pointer relative w-20 h-10 rounded-full transition-colors duration-300 ${settings.theme_mode === 'dark' ? 'bg-slate-800' : 'bg-stone-300'}`}
                >
                  <div className={`absolute top-1 left-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 ${settings.theme_mode === 'dark' ? 'translate-x-10' : 'translate-x-0'}`}>
                    {settings.theme_mode === 'dark' ? '🌙' : '☀️'}
                  </div>
                </button>
              </div>
            </div>

            {/* 🎯 SECTION 2: THÔNG TIN LIÊN HỆ */}
            <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-sm rounded-[2.5rem] p-8 md:p-10 transition-all hover:shadow-md">
              <div className="flex items-center gap-4 mb-8 border-b border-stone-100 pb-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-2xl">📞</div>
                <div>
                  <h2 className="text-xl font-black text-stone-800">Thông tin Liên hệ</h2>
                  <p className="text-sm font-bold text-stone-500 mt-1">Hiển thị ở Header, Footer và trang Liên hệ.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest block mb-2">Đường dây nóng (Hotline)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">📱</span>
                    <input type="text" name="hotline" value={settings.hotline} onChange={handleChange} placeholder="VD: 0901234567" className="w-full bg-white/50 border border-stone-200 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:ring-2 focus:ring-slate-400 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest block mb-2">Số Zalo chăm sóc khách hàng</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">💬</span>
                    <input type="text" name="zalo" value={settings.zalo} onChange={handleChange} placeholder="VD: 0901234567" className="w-full bg-white/50 border border-stone-200 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:ring-2 focus:ring-slate-400 outline-none transition-all" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest block mb-2">Email hỗ trợ</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">✉️</span>
                    <input type="email" name="email" value={settings.email} onChange={handleChange} placeholder="VD: support@kinvie.com" className="w-full bg-white/50 border border-stone-200 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:ring-2 focus:ring-slate-400 outline-none transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* 🎯 SECTION 3: LIÊN KẾT MẠNG XÃ HỘI */}
            <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-sm rounded-[2.5rem] p-8 md:p-10 transition-all hover:shadow-md">
              <div className="flex items-center gap-4 mb-8 border-b border-stone-100 pb-6">
                <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center text-2xl">🌐</div>
                <div>
                  <h2 className="text-xl font-black text-stone-800">Mạng xã hội</h2>
                  <p className="text-sm font-bold text-stone-500 mt-1">Đường dẫn tới các kênh truyền thông chính thức của Cattery.</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-2">Facebook Fanpage - KinVie Cattery (Mèo)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🐾</span>
                    <input type="text" name="facebook_cattery_url" value={settings.facebook_cattery_url} onChange={handleChange} placeholder="https://facebook.com/kinviecattery" className="w-full bg-white/50 border border-stone-200 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-2">Facebook Fanpage - Beam Petshop (Đồ ăn)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">📘</span>
                    <input type="text" name="facebook_url" value={settings.facebook_url} onChange={handleChange} placeholder="https://facebook.com/..." className="w-full bg-white/50 border border-stone-200 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-stone-800 uppercase tracking-widest block mb-2">TikTok Channel</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🎵</span>
                    <input type="text" name="tiktok_url" value={settings.tiktok_url} onChange={handleChange} placeholder="https://tiktok.com/@..." className="w-full bg-white/50 border border-stone-200 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:border-stone-800 focus:ring-2 focus:ring-stone-200 outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-pink-500 uppercase tracking-widest block mb-2">Instagram Profile</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">📸</span>
                    <input type="text" name="instagram_url" value={settings.instagram_url} onChange={handleChange} placeholder="https://instagram.com/..." className="w-full bg-white/50 border border-stone-200 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* 🎯 SECTION 4: ẢNH BANNER TRANG CHỦ */}
            <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-sm rounded-[2.5rem] p-8 md:p-10 transition-all hover:shadow-md">
              <div className="flex items-center gap-4 mb-8 border-b border-stone-100 pb-6">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-2xl">🖼️</div>
                <div>
                  <h2 className="text-xl font-black text-stone-800">Ảnh Banner Trang Chủ</h2>
                  <p className="text-sm font-bold text-stone-500 mt-1">Quản lý ảnh carousel cho 4 khu vực ở trang chủ.</p>
                </div>
              </div>

              <div className="space-y-6">
                <BannerManager groupId={1} title="Khu vực KinVie Cattery" colorClass="pink" />
                <BannerManager groupId={2} title="Khu vực Beam Petshop" colorClass="orange" />
                <BannerManager groupId={3} title="Khu vực Cộng Đồng KinVie" colorClass="blue" />
                <BannerManager groupId={4} title="Khu vực Kho Báu Ký Ức" colorClass="emerald" />
              </div>
            </div>

          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}