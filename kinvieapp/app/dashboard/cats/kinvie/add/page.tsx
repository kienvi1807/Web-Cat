"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; 

const ALL_BREEDS = ['Maine Coon', 'Anh lông ngắn (ALN)', 'Anh lông dài (ALD)', 'Ba Tư', 'Sphynx', 'Mèo Ta', 'Giống lai khác', 'Chưa rõ'];
const SIMPLE_COLORS = [
  { id: 'Vàng cam', name: 'Vàng cam (Ginger)' },
  { id: 'Trắng', name: 'Trắng tuyền (White)' },
  { id: 'Đen', name: 'Đen tuyền (Black)' },
  { id: 'Mướp / Vằn', name: 'Mướp / Vằn (Tabby)' },
  { id: 'Nhị thể', name: 'Nhị thể (Bicolor)' },
  { id: 'Tam thể', name: 'Tam thể (Calico)' },
  { id: 'Đồi mồi', name: 'Đồi mồi (Tortie)' },
  { id: 'Màu pha khác', name: 'Màu pha khác' }
];

export default function AddCatPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null); 

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 
  
  const [catData, setCatData] = useState<any>({
    name: '', breed: 'Maine Coon', price: 0, status: 'Chưa sẵn sàng', dob: '', 
    images: ['', '', '', '', ''], medical_history: [], notes: ''
  });

  const [mainImage, setMainImage] = useState<string>('');
  
  const [gender, setGender] = useState<boolean>(true); // true = Đực, false = Cái
  const [hasPedigree, setHasPedigree] = useState<boolean>(false);
  
  // 🎯 STATE QUẢN LÝ PHẢ HỆ
  const [breedersList, setBreedersList] = useState<any[]>([]);
  const [allCatsList, setAllCatsList] = useState<any[]>([]);
  const [fatherBreederId, setFatherBreederId] = useState('');
  const [motherBreederId, setMotherBreederId] = useState('');
  const [fatherId, setFatherId] = useState('');
  const [motherId, setMotherId] = useState('');
  
  const [mix1, setMix1] = useState('Anh lông ngắn (ALN)');
  const [mix2, setMix2] = useState('Mèo Ta');

  const [dbBaseColors, setDbBaseColors] = useState<any[]>([]);
  const [dbPatterns, setDbPatterns] = useState<any[]>([]);
  const [baseColor, setBaseColor] = useState<string | null>(null);
  const [hasSilver, setHasSilver] = useState(false);
  const [pattern, setPattern] = useState<string | null>(null);
  const [simpleColor, setSimpleColor] = useState<string>('');

  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({ vaccineName: '', dateGiven: '', nextDueDate: '' });

  // 🎯 INIT DATA BỔ SUNG LOG BẮT LỖI
  useEffect(() => {
    const initData = async () => {
      const { data: colors } = await supabase.from('ems_base_colors').select('*');
      if (colors) setDbBaseColors(colors);
      
      const { data: patterns } = await supabase.from('ems_patterns').select('*');
      if (patterns) setDbPatterns(patterns);

      // Kéo danh sách Trại
      const { data: breeders } = await supabase.from('breeders').select('id, name');
      if (breeders) setBreedersList(breeders);

      // Kéo danh sách Mèo ĐÃ SỬA LỖI (Bắt lỗi nếu database thiếu cột)
      const { data: cats, error: catsError } = await supabase.from('cats').select('id, name, gender, breeder_id');
      if (catsError) {
        console.error("Lỗi kéo data mèo (Thiếu cột gender/breeder_id):", catsError.message);
      } else if (cats) {
        setAllCatsList(cats);
      }
    };
    initData();
  }, []);

  const handleImageClick = (index: number) => {
    setUploadingSlot(index);
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingSlot === null) return;
    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `new_cat_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('pet-images').upload(fileName, file);

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from('pet-images').getPublicUrl(fileName);
      const newUrl = publicUrlData.publicUrl;
      let newImages = [...catData.images];
      newImages[uploadingSlot] = newUrl;
      setCatData({ ...catData, images: newImages });
      if (uploadingSlot === 0) setMainImage(newUrl);
    } else {
      alert("Lỗi tải ảnh lên: " + uploadError.message);
    }
    setIsUploading(false);
    setUploadingSlot(null); 
    if (fileInputRef.current) fileInputRef.current.value = ''; 
  };

  const purebredList = ['Maine Coon', 'Anh lông ngắn (ALN)', 'Anh lông dài (ALD)', 'Ba Tư', 'Sphynx'];
  const isPurebred = purebredList.includes(catData.breed); 
  const isMixed = catData.breed === 'Giống lai khác'; 
  const generatedEmsCode = `${baseColor || ''}${hasSilver && baseColor ? 's' : ''}${pattern || ''}`;

  const handleSaveCat = async () => {
    if (!catData.name) {
      alert("Sếp quên nhập Tên hoặc Mã bầy cho bé mèo rồi!"); return;
    }

    setIsLoading(true);
    const cleanImages = catData.images.filter((img: string) => img !== '');
    const finalColor = isPurebred ? generatedEmsCode : simpleColor;
    const finalBreed = isMixed ? `Lai: ${mix1} x ${mix2}` : catData.breed;

    const { error } = await supabase
      .from('cats')
      .insert([{
        breeder_id: 1, 
        name: catData.name,
        breed: finalBreed,
        color: finalColor,
        price: catData.price,
        status: catData.status,
        dob: catData.dob,
        images: cleanImages,
        medical_history: catData.medical_history,
        notes: catData.notes,
        gender: gender,
        has_pedigree: isPurebred ? hasPedigree : false,
        father_id: fatherId ? parseInt(fatherId) : null,
        mother_id: motherId ? parseInt(motherId) : null
      }]);

    setIsLoading(false);
    if (!error) {
      alert("Đã kết nạp bé mèo mới thành công! 🚀");
      router.push('/dashboard/cats/kinvie');
    } else {
      alert("Có lỗi xảy ra: " + error.message);
    }
  };

  const addMedicalRecord = () => {
    if (!newRecord.vaccineName || !newRecord.dateGiven) return alert("Nhập đủ thông tin sếp ơi!");
    setCatData({ ...catData, medical_history: [...catData.medical_history, newRecord] });
    setNewRecord({ vaccineName: '', dateGiven: '', nextDueDate: '' });
    setIsMedicalModalOpen(false);
  };
  const removeMedicalRecord = (index: number) => {
    const updated = [...catData.medical_history]; updated.splice(index, 1);
    setCatData({ ...catData, medical_history: updated });
  };
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return ''; const [y, m, d] = dateString.split('-'); return `${d}/${m}/${y}`;
  };

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto pb-24 relative">
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

      {/* KHỐI SÁNG NEON */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 backdrop-blur-md bg-white/40 p-6 rounded-[2rem] border border-white/60 shadow-sm sticky top-4 z-50">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <Link href="/dashboard/cats/kinvie" className="cursor-pointer w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm text-stone-500 hover:text-orange-500 hover:shadow-orange-500/20 transition-all font-bold text-xl hover:-translate-x-1">
            ←
          </Link>
          <div>
            <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-1 animate-pulse">Kết nạp thành viên mới</p>
            <h1 className="text-3xl font-black text-stone-800 flex items-center gap-3">
              Thêm Bé Mèo 🐾
            </h1>
          </div>
        </div>

        <button 
          onClick={handleSaveCat}
          disabled={isLoading || isUploading}
          className="cursor-pointer bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black px-12 py-4 rounded-xl shadow-[0_4px_20px_rgba(249,115,22,0.4)] hover:shadow-[0_4px_30px_rgba(249,115,22,0.6)] transition-all transform hover:-translate-y-1 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang tạo hồ sơ...' : 'Hoàn Tất Hồ Sơ 🚀'}
        </button>
      </div>

      {/* KHU VỰC CHÍNH */}
      <div className="flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* 📸 CỘT TRÁI: HÌNH ẢNH */}
        <div className="w-full lg:w-5/12 flex flex-col gap-4">
          <div onClick={() => handleImageClick(0)} className="cursor-pointer relative aspect-[4/5] bg-stone-100 rounded-[2.5rem] border border-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.05)] overflow-hidden group">
            {isUploading && uploadingSlot === 0 && (
              <div className="absolute inset-0 bg-stone-900/60 flex flex-col items-center justify-center text-white z-20">
                <span className="text-4xl animate-spin mb-2">🐾</span><p className="font-bold">Đang tải ảnh lên...</p>
              </div>
            )}
            <img src={mainImage || 'https://via.placeholder.com/800?text=Chưa+Có+Ảnh'} alt="Main" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
              <span className="bg-white/90 text-stone-800 font-bold px-6 py-3 rounded-full shadow-xl flex items-center gap-2">📸 Nhấn để thêm ảnh bìa</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((idx) => {
              const imgUrl = catData.images?.[idx];
              return (
                <div key={idx} onClick={() => handleImageClick(idx)} className="cursor-pointer relative aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-sm hover:border-orange-300 transition-all duration-300 group">
                  {isUploading && uploadingSlot === idx && (<div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-white z-20"><span className="animate-spin">🐾</span></div>)}
                  {imgUrl ? (
                    <><img src={imgUrl} className="w-full h-full object-cover group-hover:brightness-50 transition-all" alt={`Thumb ${idx}`} /><div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white font-bold text-sm z-10 transition-opacity">Đổi</div></>
                  ) : (
                    <div className="w-full h-full bg-stone-100 flex flex-col items-center justify-center text-stone-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors"><span className="text-xl mb-1">+</span></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 📝 CỘT PHẢI: FORM NHẬP LIỆU BENTO */}
        <div className="w-full lg:w-7/12">
          <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 lg:p-12 border border-white/80 shadow-[0_10px_50px_rgba(0,0,0,0.03)] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <h2 className="text-2xl font-black text-stone-800 mb-8 flex items-center gap-3">
              Khai báo thông tin <span className="text-orange-500">❖</span>
            </h2>

            <div className="space-y-8 relative z-10">
              
              {/* TÊN & GIỚI TÍNH */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Tên gọi / Mã bầy <span className="text-rose-500">*</span></label>
                  <input type="text" placeholder="VD: KinVie Apollo..." value={catData.name} onChange={(e) => setCatData({...catData, name: e.target.value})} className="w-full bg-white/70 backdrop-blur-sm border border-stone-200/80 rounded-2xl px-6 py-4 text-stone-800 font-bold text-lg focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Giới tính</label>
                  <div className="flex bg-white/70 backdrop-blur-sm border border-stone-200/80 rounded-2xl overflow-hidden p-1 shadow-sm h-[60px]">
                    <button type="button" onClick={() => setGender(true)} className={`cursor-pointer flex-1 text-sm font-black rounded-xl transition-all ${gender ? 'bg-blue-500 text-white shadow-md transform scale-[1.02]' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}>♂ Đực</button>
                    <button type="button" onClick={() => setGender(false)} className={`cursor-pointer flex-1 text-sm font-black rounded-xl transition-all ${!gender ? 'bg-rose-500 text-white shadow-md transform scale-[1.02]' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}>♀ Cái</button>
                  </div>
                </div>
              </div>

              {/* GIỐNG MÈO & NGÀY SINH */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Giống mèo</label>
                  <select value={catData.breed} onChange={(e) => setCatData({...catData, breed: e.target.value})} className="cursor-pointer w-full bg-white/70 backdrop-blur-sm border border-stone-200/80 rounded-2xl px-6 py-4 text-stone-800 font-bold text-lg focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm appearance-none">
                    {ALL_BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>

                  {isMixed && (
                    <div className="mt-3 p-4 bg-stone-100 rounded-2xl border border-stone-200 flex items-center gap-3">
                       <select value={mix1} onChange={(e)=>setMix1(e.target.value)} className="w-full bg-white border border-stone-200 px-3 py-2 rounded-xl text-xs font-bold shadow-sm">
                         {ALL_BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                       </select>
                       <span className="text-orange-500 font-black text-sm">X</span>
                       <select value={mix2} onChange={(e)=>setMix2(e.target.value)} className="w-full bg-white border border-stone-200 px-3 py-2 rounded-xl text-xs font-bold shadow-sm">
                         {ALL_BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                       </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Ngày sinh (DOB)</label>
                  <input type="date" value={catData.dob} onChange={(e) => setCatData({...catData, dob: e.target.value})} className="cursor-pointer w-full bg-white/70 backdrop-blur-sm border border-stone-200/80 rounded-2xl px-6 py-4 text-stone-800 font-bold text-lg focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm" />
                </div>
              </div>

              {/* TRẠNG THÁI */}
              <div>
                <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Trạng thái hiện tại</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: 'Chưa sẵn sàng', iconUnselected: '○', iconSelected: '◻' },
                    { label: 'Sẵn sàng', iconUnselected: '◻', iconSelected: '◻' },
                    { label: 'Đã cọc', iconUnselected: '◻', iconSelected: '◻' },
                    { label: 'Đã về nhà mới', iconUnselected: '🔴', iconSelected: '🔴' }
                  ].map((item) => {
                    const isSelected = catData.status === item.label;
                    return (
                      <button 
                        key={item.label} onClick={() => setCatData({...catData, status: item.label})}
                        className={`cursor-pointer px-5 py-3 rounded-[14px] text-[14px] font-bold transition-all duration-300 border flex items-center gap-2 ${
                          isSelected ? 'bg-[#292524] text-white border-[#292524] shadow-md transform scale-[1.02]' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        <span className={`text-[13px] ${item.label === 'Đã về nhà mới' ? '' : isSelected ? 'text-white' : 'text-stone-400'}`}>
                          {isSelected ? item.iconSelected : item.iconUnselected}
                        </span>
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PHẢ HỆ */}
              {isPurebred && (
                <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100 shadow-sm mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-blue-900 uppercase flex items-center gap-2"><span>🌳</span> Nguồn gốc gia đình (Phả hệ)</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-[10px] font-black text-blue-500 uppercase mb-2">Trại của Mèo Bố</label>
                      <select 
                        value={fatherBreederId} 
                        onChange={(e) => { setFatherBreederId(e.target.value); setFatherId(''); }} 
                        className="cursor-pointer w-full bg-white border border-blue-200 px-4 py-3 rounded-xl text-sm text-stone-700 font-bold focus:outline-none focus:border-blue-400 shadow-sm appearance-none"
                      >
                        <option value="">-- Chọn Trại giống --</option>
                        {breedersList.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-blue-500 uppercase mb-2">Mèo Bố</label>
                      <select 
                        value={fatherId} 
                        onChange={(e) => setFatherId(e.target.value)} 
                        disabled={!fatherBreederId}
                        className="cursor-pointer w-full bg-white border border-blue-200 px-4 py-3 rounded-xl text-sm text-stone-700 font-bold focus:outline-none focus:border-blue-400 shadow-sm appearance-none disabled:bg-stone-100 disabled:text-stone-400"
                      >
                        <option value="">-- Chọn Mèo Bố --</option>
                        {/* BỘ LỌC ĐÃ ĐƯỢC TỐI ƯU CỰC KỲ AN TOÀN */}
                        {allCatsList.filter(c => c.gender !== false && c.breeder_id?.toString() === fatherBreederId).map(c => <option key={c.id} value={c.id}>♂ {c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-[10px] font-black text-rose-400 uppercase mb-2">Trại của Mèo Mẹ</label>
                      <select 
                        value={motherBreederId} 
                        onChange={(e) => { setMotherBreederId(e.target.value); setMotherId(''); }} 
                        className="cursor-pointer w-full bg-white border border-rose-200 px-4 py-3 rounded-xl text-sm text-stone-700 font-bold focus:outline-none focus:border-rose-400 shadow-sm appearance-none"
                      >
                        <option value="">-- Chọn Trại giống --</option>
                        {breedersList.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-rose-400 uppercase mb-2">Mèo Mẹ</label>
                      <select 
                        value={motherId} 
                        onChange={(e) => setMotherId(e.target.value)} 
                        disabled={!motherBreederId}
                        className="cursor-pointer w-full bg-white border border-rose-200 px-4 py-3 rounded-xl text-sm text-stone-700 font-bold focus:outline-none focus:border-rose-400 shadow-sm appearance-none disabled:bg-stone-100 disabled:text-stone-400"
                      >
                        <option value="">-- Chọn Mèo Mẹ --</option>
                        {/* BỘ LỌC ĐÃ ĐƯỢC TỐI ƯU CỰC KỲ AN TOÀN */}
                        {allCatsList.filter(c => c.gender === false && c.breeder_id?.toString() === motherBreederId).map(c => <option key={c.id} value={c.id}>♀ {c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-blue-200/50">
                    <label className="block text-xs font-bold text-stone-700 mb-3 flex items-center gap-2"><span>📜</span> Bé có giấy tờ (Gia phả TICA/WCF) không?</label>
                    <div className="flex gap-2 h-12">
                      <button type="button" onClick={() => setHasPedigree(true)} className={`cursor-pointer flex-1 text-sm font-black rounded-xl transition-all border ${hasPedigree ? 'bg-blue-500 text-white border-blue-500 shadow-md' : 'bg-white text-stone-500 border-stone-200 hover:border-blue-300'}`}>✓ CÓ PHẢ</button>
                      <button type="button" onClick={() => setHasPedigree(false)} className={`cursor-pointer flex-1 text-sm font-black rounded-xl transition-all border ${!hasPedigree ? 'bg-stone-500 text-white border-stone-500 shadow-md' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'}`}>✗ KHÔNG PHẢ</button>
                    </div>
                  </div>
                </div>
              )}

              {/* MÀU LÔNG (EMS) */}
              {isPurebred ? (
                <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100 shadow-sm">
                   <div className="flex items-center justify-between mb-4">
                     <h3 className="text-sm font-bold text-stone-800 uppercase flex items-center gap-2"><span>🎨</span> Khai báo Màu lông (Hệ EMS)</h3>
                     <div className="text-right">
                       <p className="text-[10px] text-stone-500 uppercase font-bold">Mã đang tạo</p>
                       <p className="text-lg font-black text-orange-600 bg-white px-3 py-1 rounded-lg border border-orange-200 shadow-sm">{generatedEmsCode || 'Chưa chọn'}</p>
                     </div>
                   </div>
                   {dbBaseColors.length > 0 && (
                     <>
                       <div className="mb-6">
                         <p className="text-xs font-bold text-stone-500 mb-2">1. Màu cơ bản (Base Color)</p>
                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                           {dbBaseColors.map(c => (
                             <div key={c.code} onClick={() => setBaseColor(baseColor === c.code ? null : c.code)} className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${baseColor === c.code ? 'bg-white border-orange-500 shadow-sm ring-1 ring-orange-500' : 'bg-white border-stone-200 hover:border-orange-300'}`}>
                                <div style={{ backgroundColor: c.hex }} className="w-5 h-5 rounded-md border border-stone-200 shrink-0"></div>
                                <div className="overflow-hidden"><p className="text-xs font-bold text-stone-800 uppercase">{c.code}</p><p className="text-[9px] text-stone-500 truncate">{c.name}</p></div>
                             </div>
                           ))}
                         </div>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div className="sm:col-span-1">
                            <p className="text-xs font-bold text-stone-500 mb-2">2. Ánh bạc</p>
                            <div onClick={() => setHasSilver(!hasSilver)} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${hasSilver ? 'bg-white border-orange-500 shadow-sm ring-1 ring-orange-500' : 'bg-white border-stone-200 hover:border-orange-300'}`}>
                              <div><p className="text-xs font-bold text-stone-800">Mã "s"</p><p className="text-[10px] text-stone-500">Silver / Smoke</p></div>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${hasSilver ? 'bg-orange-500 border-orange-500' : 'border-stone-300'}`}>
                                {hasSilver && <span className="text-white text-[10px]">✓</span>}
                              </div>
                            </div>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-xs font-bold text-stone-500 mb-2">3. Hoa văn (Pattern)</p>
                            <div className="grid grid-cols-2 gap-2">
                              {dbPatterns.map(p => (
                                <div key={p.code} onClick={() => setPattern(pattern === p.code ? null : p.code)} className={`p-2 rounded-xl border cursor-pointer text-center transition-all ${pattern === p.code ? 'bg-white border-orange-500 shadow-sm ring-1 ring-orange-500' : 'bg-white border-stone-200 hover:border-orange-300'}`}>
                                  <p className="text-xs font-bold text-stone-800">{p.code}</p><p className="text-[9px] text-stone-500 truncate">{p.name}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                       </div>
                     </>
                   )}
                </div>
              ) : (
                <div className="bg-stone-50/50 rounded-3xl p-6 border border-stone-200 shadow-sm mt-8">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-sm font-bold text-stone-800 uppercase flex items-center gap-2"><span>🐈</span> Chọn Màu lông (Mèo Dân Dã)</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {SIMPLE_COLORS.map(c => (
                      <div key={c.id} onClick={() => setSimpleColor(c.id)} className={`p-3 rounded-xl border cursor-pointer text-center flex flex-col items-center gap-1 transition-all ${simpleColor === c.id ? 'bg-white border-stone-600 shadow-md ring-1 ring-stone-600 text-stone-800' : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400'}`}>
                        <span className="text-xl opacity-80">🐾</span><p className="text-xs font-bold">{c.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SỨC KHỎE */}
              <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100 shadow-sm mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-stone-800 uppercase flex items-center gap-2"><span>🏥</span> Sức khỏe & Tiêm phòng</h3>
                  <button onClick={() => setIsMedicalModalOpen(true)} className="text-xs font-bold bg-white text-orange-600 px-4 py-2 rounded-xl shadow-sm border border-orange-200 hover:bg-orange-500 hover:text-white transition-colors cursor-pointer">
                    + Thêm mũi tiêm
                  </button>
                </div>

                {catData.medical_history.length === 0 ? (
                  <div className="text-center p-4 border-2 border-dashed border-stone-200 rounded-2xl bg-white/50 text-stone-400 text-xs font-bold">
                    Chưa có lịch sử tiêm phòng
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {catData.medical_history.map((record: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
                        <div>
                          <p className="font-bold text-stone-800 text-sm">{record.vaccineName}</p>
                          <p className="text-[11px] text-stone-500 mt-1">
                            Đã tiêm: <span className="font-black text-stone-700">{formatDateDisplay(record.dateGiven)}</span>
                            {record.nextDueDate && <span className="ml-3 text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md">Nhắc lại: {formatDateDisplay(record.nextDueDate)}</span>}
                          </p>
                        </div>
                        <button onClick={() => removeMedicalRecord(index)} className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8 border-t border-stone-200/50 pt-6">
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Đặc điểm / Ghi chú (Notes)</label>
                  <textarea 
                    value={catData.notes} onChange={(e) => setCatData({...catData, notes: e.target.value})}
                    placeholder="Ghi chú thêm về sức khỏe, thói quen ăn uống, tính cách của bé..." rows={4} 
                    className="w-full bg-white border border-stone-200/80 rounded-2xl px-5 py-4 text-stone-800 text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm resize-none"
                  ></textarea>
                </div>
              </div>

              {/* GIÁ TIỀN */}
              <div className="border-t border-stone-200/60 pt-8 mt-4">
                <label className="block text-xs font-black text-orange-500 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                  <span className="text-xl">💰</span> Giá niêm yết chuyển nhượng (VNĐ)
                </label>
                <div className="relative group/price">
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-rose-400 rounded-2xl blur opacity-25 group-hover/price:opacity-50 transition duration-500 pointer-events-none"></div>
                  <input 
                    type="number" value={catData.price} onChange={(e) => setCatData({...catData, price: parseInt(e.target.value) || 0})}
                    className="cursor-pointer relative w-full bg-white border-2 border-orange-100 rounded-2xl pl-16 pr-6 py-6 text-4xl md:text-5xl text-orange-600 font-black focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all shadow-lg placeholder:text-orange-200" 
                  />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-400 font-black text-3xl select-none pointer-events-none">đ</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* 🎯 MODAL THÊM LỊCH TIÊM */}
      {isMedicalModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsMedicalModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scale-up">
            <h2 className="text-xl font-black text-stone-800 mb-6 flex items-center gap-2">💉 Thêm mũi tiêm mới</h2>
            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-2">Tên Vaccine / Mũi tiêm</label>
                <input 
                  type="text" placeholder="Ví dụ: Vaccine 4 bệnh, Dại, Tẩy giun..."
                  value={newRecord.vaccineName} onChange={(e) => setNewRecord({...newRecord, vaccineName: e.target.value})} 
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-stone-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-2">Ngày tiêm</label>
                  <input type="date" value={newRecord.dateGiven} onChange={(e) => setNewRecord({...newRecord, dateGiven: e.target.value})} className="cursor-pointer w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-stone-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-2">Nhắc lại (Nếu có)</label>
                  <input type="date" value={newRecord.nextDueDate} onChange={(e) => setNewRecord({...newRecord, nextDueDate: e.target.value})} className="cursor-pointer w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-stone-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 outline-none" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsMedicalModalOpen(false)} className="cursor-pointer px-5 py-2.5 rounded-xl font-bold text-stone-500 hover:bg-stone-100 transition-colors">Hủy</button>
              <button onClick={addMedicalRecord} className="cursor-pointer px-6 py-2.5 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/30 transition-all hover:-translate-y-0.5">Thêm Mũi Tiêm</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}