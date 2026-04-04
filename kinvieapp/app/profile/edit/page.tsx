"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    age: '',
    specificAddress: '' 
  });

  // 🎯 STATE LƯU TRỮ DATA TỪ API QUỐC GIA
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  // State lưu giá trị khách đang chọn (cần cả mã code để gọi API con, và name để lưu Database)
  const [selectedProvince, setSelectedProvince] = useState({ code: '', name: '' });
  const [selectedDistrict, setSelectedDistrict] = useState({ code: '', name: '' });
  const [selectedWard, setSelectedWard] = useState({ code: '', name: '' });

  // 1. LOAD DATA KHÁCH HÀNG TỪ SUPABASE
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const { data: dbUser } = await supabase.from('users').select('*').eq('email', user.email).single();

      if (dbUser) {
        setFormData({
          fullname: dbUser.fullname || dbUser.name || user.user_metadata?.full_name || '',
          phone: dbUser.phone || '',
          age: dbUser.age || '',
          specificAddress: '' // Khách sẽ chọn lại địa chỉ chuẩn theo form mới
        });
        setPreviewUrl(dbUser.avatarurl || user.user_metadata?.avatar_url || '');
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, [router]);

  // 2. KÉO DANH SÁCH 63 TỈNH THÀNH (Ngay khi mở trang)
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/p/')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error("Lỗi kéo API Tỉnh:", err));
  }, []);

  // 3. KÉO QUẬN/HUYỆN (Khi khách chọn xong Tỉnh)
  useEffect(() => {
    if (selectedProvince.code) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`)
        .then(res => res.json())
        .then(data => setDistricts(data.districts || []));
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvince.code]);

  // 4. KÉO PHƯỜNG/XÃ (Khi khách chọn xong Quận)
  useEffect(() => {
    if (selectedDistrict.code) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards || []));
    } else {
      setWards([]);
    }
  }, [selectedDistrict.code]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Không tìm thấy phiên đăng nhập!");

      let finalAvatarUrl = previewUrl;

      // UP ẢNH LÊN STORAGE
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);

        if (uploadError) throw new Error('Không thể tải ảnh lên.');

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        finalAvatarUrl = publicUrl;
      }

      // GỘP ĐỊA CHỈ (Chỉ lấy Tên để lưu DB, không lưu mã Code)
      const fullAddress = [
        formData.specificAddress, 
        selectedWard.name, 
        selectedDistrict.name, 
        selectedProvince.name
      ].filter(Boolean).join(', ');

      const { error: updateError } = await supabase
        .from('users')
        .update({
          fullname: formData.fullname,
          phone: formData.phone,
          age: formData.age,
          address: fullAddress,
          avatarurl: finalAvatarUrl
        })
        .eq('email', user.email);

      if (updateError) throw updateError;

      localStorage.setItem('kinvie_user', JSON.stringify({ name: formData.fullname, type: 'Customer' }));
      setSuccess('Cập nhật thông tin thành công!');
      setTimeout(() => router.push('/profile'), 1500);

    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lưu dữ liệu.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-stone-50">Đang tải hồ sơ...</div>;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-700 font-sans">
      <Header />
      <main className="pt-32 pb-20 container mx-auto px-4 relative z-10 flex justify-center">
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-stone-100 w-full max-w-3xl">
          
          <div className="mb-8">
            <Link href="/profile" className="text-stone-400 hover:text-pink-500 text-sm font-bold flex items-center gap-2 mb-6 inline-block">
              <span>❮</span> Quay lại Hồ sơ
            </Link>
            <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">Cập nhật thông tin</h2>
            <p className="text-stone-500 text-sm">Điền đầy đủ thông tin để KinVie hỗ trợ Sen và Boss tốt nhất nhé!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* AVATAR UPLOAD */}
            <div className="flex flex-col items-center justify-center p-6 bg-pink-50/50 rounded-3xl border border-pink-100 border-dashed mb-8">
              <div className="relative group">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm border-4 border-white overflow-hidden">
                  {previewUrl ? <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" /> : <span>👤</span>}
                </div>
                <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <span className="text-white text-xs font-bold">Đổi ảnh</span>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <p className="text-xs text-stone-400 mt-3">Nhấp vào ảnh để thay đổi Avatar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Họ và tên <span className="text-rose-500">*</span></label>
                <input type="text" required name="fullname" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400" value={formData.fullname} onChange={(e) => setFormData({...formData, fullname: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Số điện thoại <span className="text-rose-500">*</span></label>
                <input type="tel" required name="phone" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Tuổi</label>
              <input type="number" name="age" className="w-full md:w-1/2 bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} />
            </div>

            {/* ĐỊA CHỈ API */}
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
              <h4 className="text-sm font-bold text-stone-700 mb-4 flex items-center gap-2"><span>📍</span> Địa chỉ nhận hàng</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                
                {/* Chọn Tỉnh */}
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Tỉnh / Thành phố</label>
                  <select 
                    className="w-full bg-white border border-stone-200 px-3 py-2.5 rounded-lg text-sm focus:border-pink-400 focus:outline-none"
                    value={selectedProvince.code}
                    onChange={(e) => {
                      setSelectedProvince({ code: e.target.value, name: e.target.options[e.target.selectedIndex].text });
                      setSelectedDistrict({ code: '', name: '' });
                      setSelectedWard({ code: '', name: '' });
                    }}
                  >
                    <option value="">Chọn Tỉnh/Thành</option>
                    {provinces.map(p => (
                      <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Chọn Quận */}
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Quận / Huyện</label>
                  <select 
                    className="w-full bg-white border border-stone-200 px-3 py-2.5 rounded-lg text-sm focus:border-pink-400 focus:outline-none disabled:bg-stone-100"
                    value={selectedDistrict.code}
                    onChange={(e) => {
                      setSelectedDistrict({ code: e.target.value, name: e.target.options[e.target.selectedIndex].text });
                      setSelectedWard({ code: '', name: '' });
                    }}
                    disabled={!selectedProvince.code}
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map(d => (
                      <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Chọn Phường */}
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Phường / Xã</label>
                  <select 
                    className="w-full bg-white border border-stone-200 px-3 py-2.5 rounded-lg text-sm focus:border-pink-400 focus:outline-none disabled:bg-stone-100"
                    value={selectedWard.code}
                    onChange={(e) => setSelectedWard({ code: e.target.value, name: e.target.options[e.target.selectedIndex].text })}
                    disabled={!selectedDistrict.code}
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map(w => (
                      <option key={w.code} value={w.code}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Số nhà, tên đường</label>
                <input type="text" placeholder="Ví dụ: Số 12, Ngõ 34..." className="w-full bg-white border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400" value={formData.specificAddress} onChange={(e) => setFormData({...formData, specificAddress: e.target.value})} />
              </div>
            </div>

            {error && <div className="text-rose-500 text-sm font-medium text-center bg-rose-50 p-3 rounded-xl">{error}</div>}
            {success && <div className="text-green-600 text-sm font-medium text-center bg-green-50 p-3 rounded-xl">{success}</div>}

            <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
              <Link href="/profile" className="px-6 py-3.5 rounded-xl font-bold text-stone-500 hover:bg-stone-100 transition-colors">Hủy bỏ</Link>
              <button type="submit" disabled={isSaving} className="px-8 py-3.5 rounded-xl font-bold text-white shadow-md bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 transition-all">
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>

        </div>
      </main>
      <Footer />
    </div>
  );
}