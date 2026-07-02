"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// 🎯 DANH SÁCH ICON CHO SẾP CHỌN (Sếp có thể tự thêm emoji vào mảng này)
const AVAILABLE_ICONS = ['🐮', '🐔', '🐟', '🐷', '🦆', '🦐', '🦀', '🧀', '🥕', '🥚', '🥩', '🥦'];

export default function PateTypesManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [pateTypes, setPateTypes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    default_price: 0,
    image_url: '',
    selected_icons: [] as string[] // 🎯 Mảng chứa các icon đang được tick
  });

  useEffect(() => {
    fetchPateTypes();
  }, []);

  const fetchPateTypes = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('pate_types').select('*').order('created_at', { ascending: false });
    setPateTypes(data || []);
    setIsLoading(false);
  };

  const openModal = (type: any = null) => {
    if (type) {
      setForm({ 
        ...type, 
        selected_icons: type.icons ? type.icons.split(' ') : [] 
      });
    } else {
      setForm({ id: '', name: '', description: '', default_price: 0, image_url: '', selected_icons: [] });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fileName = `pate_type_${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('pet-images').upload(fileName, file);
    if (!error) {
      const { data } = supabase.storage.from('pet-images').getPublicUrl(fileName);
      setForm({ ...form, image_url: data.publicUrl });
    }
    setIsUploading(false);
  };

  // 🎯 Hàm Tick/Bỏ Tick Icon
  const toggleIcon = (icon: string) => {
    setForm(prev => {
      if (prev.selected_icons.includes(icon)) {
        return { ...prev, selected_icons: prev.selected_icons.filter(i => i !== icon) };
      } else {
        return { ...prev, selected_icons: [...prev.selected_icons, icon] };
      }
    });
  };

  const handleSave = async () => {
    if (!form.name) return alert("Nhập tên loại Pate!");
    setIsSaving(true);
    
    // Gộp mảng icon thành chuỗi (VD: "🐮 🐔") để lưu
    const iconsString = form.selected_icons.join(' ');
    
    if (form.id) {
      await supabase.from('pate_types').update({
        name: form.name, description: form.description, default_price: Number(form.default_price), image_url: form.image_url, icons: iconsString
      }).eq('id', form.id);
    } else {
      await supabase.from('pate_types').insert([{
        name: form.name, description: form.description, default_price: Number(form.default_price), image_url: form.image_url, icons: iconsString
      }]);
    }
    
    setIsSaving(false);
    setIsModalOpen(false);
    fetchPateTypes();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Xóa loại công thức [${name}] này?`)) return;
    await supabase.from('pate_types').delete().eq('id', id);
    fetchPateTypes();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-16 px-6 pt-12 relative animate-fade-in">
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="flex justify-between items-end mb-10">
          <div>
            <Link href="/dashboard/petshop/pate" className="cursor-pointer text-emerald-600 font-bold bg-white px-5 py-2.5 rounded-full shadow-sm hover:bg-emerald-50 transition-all inline-flex mb-4">
              ← Quay lại Kho Pate
            </Link>
            <h1 className="text-4xl font-black text-stone-800">Quản lý Danh mục Pate 🗂️</h1>
            <p className="text-stone-500 mt-2 font-medium">Tạo sẵn các loại Pate, chọn icon thành phần để tự động áp dụng.</p>
          </div>
          <button onClick={() => openModal()} className="cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-black shadow-lg transition-all active:scale-95">
            + Thêm Loại Pate Mới
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-stone-400 font-bold animate-pulse">Đang tải danh mục...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {pateTypes.map(pt => (
              <div key={pt.id} className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 hover:shadow-lg transition-all group">
                <div className="w-full h-40 bg-emerald-50/50 rounded-2xl mb-4 flex items-center justify-center overflow-hidden border border-emerald-100/50">
                  {pt.image_url ? <img src={pt.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <span className="text-4xl">🥫</span>}
                </div>
                
                {/* 🎯 HIỆN TÊN PATE & ICON ĐÃ CHỌN */}
                <h3 className="text-xl font-black text-stone-800 mb-1 flex items-center gap-2">
                  {pt.name} <span className="text-2xl drop-shadow-sm">{pt.icons}</span>
                </h3>
                
                <p className="text-emerald-600 font-black mb-4">{Number(pt.default_price).toLocaleString()}đ <span className="text-xs text-stone-400">/hộp</span></p>
                <div className="flex gap-2">
                  <button onClick={() => openModal(pt)} className="cursor-pointer flex-1 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-100 transition-all">Sửa</button>
                  <button onClick={() => handleDelete(pt.id, pt.name)} className="cursor-pointer px-4 py-2.5 bg-rose-50 text-rose-500 rounded-xl font-bold hover:bg-rose-100 transition-all">Xóa</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL THÊM/SỬA */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm fixed cursor-pointer" onClick={() => setIsModalOpen(false)}></div>
            
            <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md relative z-10 animate-fade-in shadow-2xl my-8">
              <h2 className="text-2xl font-black text-stone-800 mb-6 flex items-center gap-2">
                {form.id ? 'Sửa thông tin' : 'Thêm Loại Pate mới'} 
                <span className="text-3xl">{form.selected_icons.join('')}</span>
              </h2>
              
              <div className="space-y-5 mb-8">
                
                {/* KHU VỰC UPLOAD ẢNH */}
                <div className="mb-4">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2 block">Hình ảnh minh họa</label>
                  <div onClick={() => !isUploading && fileInputRef.current?.click()} className={`relative w-full h-40 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 group ${form.image_url ? 'border-emerald-400 shadow-[0_8px_30px_rgba(16,185,129,0.2)]' : 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-400'}`}>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                    {isUploading ? (
                      <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                    ) : form.image_url ? (
                      <div className="relative w-full h-full">
                        <img src={form.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><span className="bg-white text-emerald-600 px-4 py-2 rounded-xl font-black text-sm">Đổi ảnh</span></div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-emerald-500">
                        <span className="text-3xl mb-1">📸</span>
                        <p className="font-black text-sm">Tải ảnh lên</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase ml-1 block mb-1">Tên loại Pate</label>
                  <input type="text" placeholder="VD: Pate bò mix phô mai" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="cursor-text w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 font-bold outline-none focus:border-emerald-400 text-stone-800" />
                </div>

                {/* 🎯 KHAY CHỌN BIỂU TƯỢNG (MULTI-SELECT) */}
                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase ml-1 block mb-2">Thành phần (Chọn nhiều biểu tượng)</label>
                  <div className="flex flex-wrap gap-2 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                    {AVAILABLE_ICONS.map(icon => {
                      const isSelected = form.selected_icons.includes(icon);
                      return (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => toggleIcon(icon)}
                          className={`cursor-pointer w-[42px] h-[42px] rounded-xl text-2xl flex items-center justify-center transition-all duration-200 ${
                            isSelected 
                              ? 'bg-emerald-100 border-2 border-emerald-400 shadow-sm transform scale-110' 
                              : 'bg-white border border-stone-200 hover:bg-stone-100 grayscale opacity-40 hover:grayscale-0 hover:opacity-100'
                          }`}
                        >
                          {icon}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase ml-1 block mb-1">Giá bán mặc định (VNĐ)</label>
                  <input type="number" value={form.default_price} onChange={e => setForm({...form, default_price: Number(e.target.value)})} className="cursor-text w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3.5 font-black outline-none focus:border-emerald-400 text-emerald-600" />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="cursor-pointer flex-1 py-4 bg-stone-100 text-stone-600 font-bold rounded-xl hover:bg-stone-200">Hủy</button>
                <button onClick={handleSave} disabled={isSaving || isUploading} className="cursor-pointer flex-1 py-4 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 shadow-lg disabled:opacity-50">Lưu lại</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}} />
    </div>
  );
}