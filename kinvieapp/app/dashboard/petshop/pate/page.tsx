"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; 

// 🎯 HÀM QUÉT ICON TỰ ĐỘNG THEO TÊN (Để hiện ra danh sách bên ngoài)
const getPateIcons = (name: string) => {
  const n = (name || '').toLowerCase();
  let icons = [];
  if (n.includes('bò')) icons.push('🐮');
  if (n.includes('gà')) icons.push('🐔');
  if (n.includes('cá')) icons.push('🐟');
  if (n.includes('heo') || n.includes('lợn')) icons.push('🐷');
  if (n.includes('vịt')) icons.push('🦆');
  if (n.includes('tôm')) icons.push('🦐');
  if (n.includes('phô mai')) icons.push('🧀');
  if (n.includes('rau') || n.includes('bí') || n.includes('cà rốt')) icons.push('🥕');
  
  return icons.join(' ');
};

export default function PateFreshPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [pateProducts, setPateProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 🎯 State cho Modal Sửa/Xóa Mẻ Pate
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeEditPate, setActiveEditPate] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    stock: 0,
    expiry_date: ''
  });

  useEffect(() => {
    fetchPateData();
  }, []);

  const fetchPateData = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', 'Pate tươi (Thủ công)')
      .order('created_at', { ascending: false }); // Xếp mới nhất lên đầu

    if (error) {
      console.error("Lỗi tải data Pate:", error);
    } else {
      setPateProducts(data || []);
    }
    setIsLoading(false);
  };

  // Tính trạng thái Hạn sử dụng
  const getExpiryStatus = (expiryDate: string) => {
    if (!expiryDate) return { label: 'Chưa có date', color: 'bg-stone-100 text-stone-500' };
    
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset giờ về 0 để tính ngày chuẩn xác
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Hết hạn', color: 'bg-rose-500 text-white animate-pulse' };
    if (diffDays === 0) return { label: 'Hết hạn hôm nay', color: 'bg-rose-500 text-white animate-pulse' };
    if (diffDays <= 2) return { label: `Còn ${diffDays} ngày`, color: 'bg-amber-500 text-white' };
    return { label: `Còn ${diffDays} ngày`, color: 'bg-pink-500 text-white' };
  };

  // 🎯 Mở Modal và nạp dữ liệu
  const openEditModal = (pate: any) => {
    setActiveEditPate(pate);
    setEditForm({
      name: pate.name || '',
      stock: pate.stock || 0,
      expiry_date: pate.expiry_date ? new Date(pate.expiry_date).toISOString().split('T')[0] : '' // Format ra YYYY-MM-DD cho input date
    });
    setIsEditModalOpen(true);
  };

  // 🎯 Lưu thay đổi
  const handleUpdatePate = async () => {
    if (!editForm.name) return alert("Không được để trống tên Pate!");
    
    setIsSaving(true);
    const { error } = await supabase
      .from('products')
      .update({
        name: editForm.name,
        stock: Number(editForm.stock),
        expiry_date: editForm.expiry_date || null
      })
      .eq('id', activeEditPate.id);

    setIsSaving(false);

    if (!error) {
      // Cập nhật mảng ảo trên giao diện cho mượt
      setPateProducts(pateProducts.map(p => p.id === activeEditPate.id ? { ...p, ...editForm } : p));
      setIsEditModalOpen(false);
      alert("✅ Đã cập nhật thành công!");
    } else {
      alert("Lỗi khi lưu: " + error.message);
    }
  };

  // 🎯 Xóa mẻ Pate
  const handleDeletePate = async () => {
    if (!window.confirm(`Sếp có chắc chắn muốn XÓA vĩnh viễn mẻ [${editForm.name}] này không? Thao tác này không thể hoàn tác.`)) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', activeEditPate.id);

    setIsSaving(false);

    if (!error) {
      setPateProducts(pateProducts.filter(p => p.id !== activeEditPate.id));
      setIsEditModalOpen(false);
      alert("🗑 Đã xóa mẻ Pate thành công!");
    } else {
      alert("Lỗi khi xóa: " + error.message);
    }
  };

  const filteredPate = pateProducts.filter(p => 
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in min-h-screen bg-[#F8F9FA] pb-16 relative overflow-hidden selection:bg-pink-200">
      {/* HIỆU ỨNG NỀN */}
      <div className="fixed top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-pink-400/20 mix-blend-multiply filter blur-[120px] animate-blob z-0"></div>
      <div className="fixed top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-500/20 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000 z-0"></div>
      <div className="fixed bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-pink-300/20 mix-blend-multiply filter blur-[150px] animate-blob animation-delay-4000 z-0"></div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10 animate-fade-in-up pt-12">
        
        {/* HEADER SECTION */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <Link 
              href="/dashboard/petshop" 
              className="cursor-pointer group inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white text-pink-600 hover:bg-white hover:text-pink-700 px-5 py-2.5 rounded-full font-black text-sm mb-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(236,72,153,0.15)] hover:-translate-y-0.5 active:scale-95 w-fit"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span> Quay lại Beam Petshop
            </Link>
            
            <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-pink-800 to-teal-700 tracking-tight drop-shadow-sm flex items-center gap-3">
              Quản lý Pate Tươi <span className="text-3xl drop-shadow-md transform -rotate-12">🥫</span>
            </h1>
            <p className="font-bold text-stone-500 mt-2">Kiểm soát chất lượng, số lượng và vòng đời các mẻ pate thủ công.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* THANH TÌM KIẾM */}
            <div className="relative flex-1 md:w-80 group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-pink-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </span>
              <input 
                type="text" 
                placeholder="Tìm mẻ Pate theo tên..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="cursor-text w-full pl-14 pr-5 py-4 bg-white/70 backdrop-blur-xl border-2 border-white/80 rounded-2xl focus:border-pink-400 focus:bg-white outline-none font-bold text-stone-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all placeholder:font-medium placeholder:text-stone-400"
              />
            </div>
            
            {/* NÚT THÊM MỚI */}
            <div className="flex gap-3">
              {/* 🎯 NÚT QUẢN LÝ LOẠI PATE (MỚI) */}
              <Link href="/dashboard/petshop/pate-types" className="cursor-pointer bg-white border-2 border-pink-500 text-pink-600 hover:bg-pink-50 font-black px-6 py-4 rounded-2xl shadow-[0_8px_20px_rgba(16,185,129,0.1)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)] hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                ⚙️ Danh mục
              </Link>
              
              {/* NÚT NẤU MẺ MỚI */}
              <Link href="/dashboard/petshop/pate/add" className="cursor-pointer bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black px-8 py-4 rounded-2xl shadow-[0_10px_30px_rgba(236,72,153,0.3)] hover:shadow-[0_10px_40px_rgba(236,72,153,0.4)] hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                <span>+</span> Nấu mẻ mới
              </Link>
            </div>
          </div>
        </div>

        {/* GRID HIỂN THỊ */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mb-4"></div>
            <p className="font-black text-stone-400 tracking-widest text-sm uppercase animate-pulse">Đang quét kho lạnh...</p>
          </div>
        ) : filteredPate.length === 0 ? (
          <div className="text-center py-32 bg-white/40 backdrop-blur-2xl rounded-[3rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
             <div className="w-24 h-24 bg-stone-100 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 transform -rotate-12 filter grayscale opacity-50">🥫</div>
             <h3 className="text-2xl font-black text-stone-800 mb-2">Kho đang trống!</h3>
             <p className="text-stone-500 font-medium">Hiện không có mẻ Pate nào hoặc không tìm thấy kết quả phù hợp.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPate.map((p, index) => {
              const status = getExpiryStatus(p.expiry_date);
              return (
                <div 
                  key={p.id} 
                  className="bg-white/60 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-6 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] hover:-translate-y-2 hover:bg-white group relative overflow-hidden flex flex-col h-full"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Badge Hạn Sử Dụng */}
                  <div className={`absolute top-0 right-0 px-5 py-2 rounded-bl-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-sm z-10 transition-colors duration-300 ${status.color}`}>
                    {status.label}
                  </div>

                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-pink-50 to-teal-50 rounded-[1.5rem] flex items-center justify-center text-5xl mb-6 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-white">
                    {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-contain rounded-[1.5rem] drop-shadow-sm" /> : '🥫'}
                  </div>

                  <div className="text-center flex-1">
                    <h3 className="text-xl font-black text-stone-800 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors flex items-center justify-center gap-2">
                      {p.name} 
                      <span className="text-2xl drop-shadow-sm">{getPateIcons(p.name)}</span>
                    </h3>
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Sản xuất:</span>
                      <span className="text-xs font-black text-stone-600 bg-stone-100/80 px-2 py-0.5 rounded-md">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString('vi-VN') : '---'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-5 border-t border-dashed border-stone-200 mt-auto">
                    <div>
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-0.5">Còn lại</p>
                      <p className="text-2xl font-black text-pink-600 drop-shadow-sm">{p.stock}<span className="text-xs ml-1 font-bold text-pink-400 uppercase">hộp</span></p>
                    </div>
                    {/* 🎯 Sửa Link thành Button Mở Modal */}
                    <button 
                      onClick={() => openEditModal(p)}
                      className="cursor-pointer w-12 h-12 rounded-2xl bg-white border border-stone-100 shadow-sm flex items-center justify-center text-stone-400 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 transition-all group/btn"
                    >
                      <svg className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 🎯 MODAL CHỈNH SỬA / XÓA MẺ PATE (Layer Xịn Xò) */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
            {/* Lớp nền làm mờ đen */}
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md transition-opacity cursor-pointer" onClick={() => setIsEditModalOpen(false)}></div>
            
            {/* Khung Modal nảy lên */}
            <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] p-8 md:p-10 max-w-lg w-full shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative z-10 border border-white animate-scale-up">
              
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-stone-100">
                <h3 className="text-2xl font-black text-stone-800 tracking-tight flex items-center gap-3">
                  <span className="p-2.5 bg-pink-100 text-pink-600 rounded-2xl text-xl">⚙️</span>
                  Sửa mẻ Pate
                </h3>
                <button onClick={() => setIsEditModalOpen(false)} className="cursor-pointer w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                  ✕
                </button>
              </div>

              <div className="space-y-6 mb-10">
                {/* Tên Pate */}
                <div>
                  <label className="text-[11px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2 block">Tên hiển thị</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="cursor-text w-full bg-white border-2 border-stone-100 rounded-2xl px-5 py-4 font-bold text-stone-800 outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-400/10 transition-all shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Số lượng */}
                  <div>
                    <label className="text-[11px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2 block">Tồn kho (Hộp)</label>
                    <input 
                      type="number" 
                      value={editForm.stock}
                      onChange={(e) => setEditForm({...editForm, stock: Number(e.target.value)})}
                      className="cursor-text w-full bg-pink-50/50 border-2 border-pink-100 text-pink-700 rounded-2xl px-5 py-4 font-black text-xl outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-400/10 transition-all shadow-sm"
                    />
                  </div>
                  
                  {/* Hạn sử dụng */}
                  <div>
                    <label className="text-[11px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2 block">Hạn sử dụng</label>
                    <input 
                      type="date" 
                      value={editForm.expiry_date}
                      onChange={(e) => setEditForm({...editForm, expiry_date: e.target.value})}
                      className="cursor-pointer w-full bg-white border-2 border-stone-100 rounded-2xl px-5 py-4 font-bold text-stone-700 outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-400/10 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* NÚT THAO TÁC */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleDeletePate}
                  disabled={isSaving}
                  className="cursor-pointer px-6 py-4 bg-white border-2 border-rose-100 text-rose-500 rounded-2xl font-black text-sm hover:bg-rose-50 hover:border-rose-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                  title="Xóa vĩnh viễn mẻ Pate này"
                >
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
                
                <button 
                  onClick={handleUpdatePate}
                  disabled={isSaving}
                  className="cursor-pointer flex-1 py-4 bg-gradient-to-r from-pink-500 to-teal-500 text-white rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_40px_rgba(16,185,129,0.4)] hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSaving ? (
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
              
            </div>
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        
        .animate-scale-up { animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .animate-blob { animation: blob 10s infinite alternate; }
        .animation-delay-2000 { animation-delay: 2s; }
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
      `}} />
    </div>
  );
}