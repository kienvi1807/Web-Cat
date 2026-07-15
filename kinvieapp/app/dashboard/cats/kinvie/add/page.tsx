"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import BackgroundGlow from '@/components/layout/BackgroundGlow';
import { useLayoutStore } from '@/store/useLayoutStore';
import { SIMPLE_COLORS, formatEmsCode, formatDateDisplay } from '@/lib/utils';

export default function AddCatPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  const setThemeColor = useLayoutStore(state => state.setThemeColor);
  useEffect(() => {
    setThemeColor('red'); // 👈 Set lại tone đỏ
  }, [setThemeColor]);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 🎯 BỔ SUNG STATE LƯU ID CỦA BOSS ĐỂ TRÁNH LỖI FOREIGN KEY
  const [bossId, setBossId] = useState<number | null>(null);

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
  const [fatherId, setFatherId] = useState<number | null>(null);
  const [motherId, setMotherId] = useState<number | null>(null);

  // 🎯 STATE BẬT TẮT CHO MENU CHỌN MÈO CÓ ẢNH
  const [isFatherDropdownOpen, setIsFatherDropdownOpen] = useState(false);
  const [isMotherDropdownOpen, setIsMotherDropdownOpen] = useState(false);
  const [isFatherBreederDropdownOpen, setIsFatherBreederDropdownOpen] = useState(false);
  const [isMotherBreederDropdownOpen, setIsMotherBreederDropdownOpen] = useState(false);

  const [mix1, setMix1] = useState('Anh lông ngắn (ALN)');
  const [mix2, setMix2] = useState('Mèo Ta');

  const [dbBaseColors, setDbBaseColors] = useState<any[]>([]);
  const [dbBreeds, setDbBreeds] = useState<any[]>([]);
  const [dbPatterns, setDbPatterns] = useState<any[]>([]);
  const [baseColor, setBaseColor] = useState<string | null>(null);
  const [hasSilver, setHasSilver] = useState(false);
  const [pattern, setPattern] = useState<string | null>(null);
  const [simpleColor, setSimpleColor] = useState<string>('');

  const [isEmsOpen, setIsEmsOpen] = useState<boolean>(true); // Mặc định mở ở trang Add
  const [isBreedDropdownOpen, setIsBreedDropdownOpen] = useState(false);

  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({ vaccineName: '', dateGiven: '', nextDueDate: '' });

  // Hàm tiện ích để lấy ảnh của mèo từ ID
  const getCatImage = (id: number | null) => {
    if (!id) return 'https://via.placeholder.com/100?text=No+Img';
    const cat = allCatsList.find(c => c.id === id);
    return cat?.images?.[0] || 'https://via.placeholder.com/100?text=No+Img';
  };

  // 🎯 INIT DATA
  useEffect(() => {
    const initData = async () => {
      // 1. TỰ ĐỘNG TÌM ID CỦA BOSS (NGƯỜI CÓ TYPE_ID = 1)
      const { data: bossData } = await supabase.from('users').select('userid').eq('type_id', 1).limit(1).maybeSingle();
      if (bossData) setBossId(bossData.userid);

      // 2. Kéo các dữ liệu danh mục
      const { data: colors } = await supabase.from('ems_base_colors').select('*');
      if (colors) setDbBaseColors(colors);

      const { data: patterns } = await supabase.from('ems_patterns').select('*');
      if (patterns) setDbPatterns(patterns);

      const { data: breeds } = await supabase.from('cat_breeds').select('*').order('sort_order');
      if (breeds) setDbBreeds(breeds);

      // 3. Kéo danh sách Trại giống (Boss và Breeder)
      // Bổ sung kéo thêm fullname và cattery_name để lấy thông tin hiển thị
      const { data: breeders } = await supabase.from('users').select('userid, fullname, cattery_name, email, phone, type_id').in('type_id', [1, 3]);
      if (breeders) setBreedersList(breeders);

      // 4. Kéo danh sách mèo để làm phả hệ
      const { data: cats, error: catsError } = await supabase.from('cats').select('id, name, gender, images, color, breeder_id, father_id, mother_id');
      if (catsError) {
        console.error("Lỗi kéo data mèo:", catsError.message);
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

    // 🎯 CHẶN LỖI NẾU KHÔNG CÓ BOSS ID
    if (!bossId) {
      alert("Lỗi: Hệ thống không tìm thấy tài khoản Boss (KinVie) nào trong database!"); return;
    }

    setIsLoading(true);
    const cleanImages = catData.images.filter((img: string) => img !== '');
    const finalColor = isPurebred ? generatedEmsCode : simpleColor;
    const finalBreed = isMixed ? `Lai: ${mix1} x ${mix2}` : catData.breed;

    const { error } = await supabase
      .from('cats')
      .insert([{
        breeder_id: bossId, // 🎯 DÙNG ID ĐỘNG CỦA BOSS THAY VÌ SỐ 1
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
        father_id: fatherId || null,
        mother_id: motherId || null
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

  // 🎯 LOGIC CHỐNG PHỐI CẬN HUYẾT
  const getDescendants = (targetId: number, list: any[]) => {
    let res: number[] = [];
    const find = (id: number) => {
      const children = list.filter(c => c.father_id === id || c.mother_id === id);
      children.forEach(c => { if (!res.includes(c.id)) { res.push(c.id); find(c.id); } });
    };
    find(targetId); return res;
  };

  const getAncestors = (targetId: number, list: any[]) => {
    let res: number[] = [];
    const find = (id: number) => {
      const cat = list.find(c => c.id === id);
      if (cat) {
        if (cat.father_id && !res.includes(cat.father_id)) { res.push(cat.father_id); find(cat.father_id); }
        if (cat.mother_id && !res.includes(cat.mother_id)) { res.push(cat.mother_id); find(cat.mother_id); }
      }
    };
    find(targetId); return res;
  };

  let excludedForFather: number[] = [];
  if (motherId) {
    excludedForFather.push(motherId, ...getAncestors(motherId, allCatsList), ...getDescendants(motherId, allCatsList));
  }

  let excludedForMother: number[] = [];
  if (fatherId) {
    excludedForMother.push(fatherId, ...getAncestors(fatherId, allCatsList), ...getDescendants(fatherId, allCatsList));
  }

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto pb-24 relative">
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

      {/* 🎯 GỌI COMPONENT NỀN THÔNG MINH */}
      <BackgroundGlow />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 backdrop-blur-md bg-white/40 p-6 rounded-[2rem] border border-white/60 shadow-sm sticky top-4 z-50">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <Link href="/dashboard/cats/kinvie" className="cursor-pointer w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm text-stone-500 hover:text-red-500 hover:shadow-red-500/20 transition-all font-bold text-xl hover:-translate-x-1">
            ←
          </Link>
          <div>
            <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-1 animate-pulse">Kết nạp thành viên mới</p>
            <h1 className="text-3xl font-black text-stone-800 flex items-center gap-3">
              Thêm Bé Mèo 🐾
            </h1>
          </div>
        </div>

        <button
          onClick={handleSaveCat}
          disabled={isLoading || isUploading}
          className="cursor-pointer bg-gradient-to-r from-red-500 to-red-500 hover:from-red-600 hover:to-red-600 text-white font-black px-12 py-4 rounded-xl shadow-[0_4px_20px_rgba(249,115,22,0.4)] hover:shadow-[0_4px_30px_rgba(249,115,22,0.6)] transition-all transform hover:-translate-y-1 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div key={idx} onClick={() => handleImageClick(idx)} className="cursor-pointer relative aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-sm hover:border-red-300 transition-all duration-300 group">
                  {isUploading && uploadingSlot === idx && (<div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-white z-20"><span className="animate-spin">🐾</span></div>)}
                  {imgUrl ? (
                    <><img src={imgUrl} className="w-full h-full object-cover group-hover:brightness-50 transition-all" alt={`Thumb ${idx}`} /><div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white font-bold text-sm z-10 transition-opacity">Đổi</div></>
                  ) : (
                    <div className="w-full h-full bg-stone-100 flex flex-col items-center justify-center text-stone-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors"><span className="text-xl mb-1">+</span></div>
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
              Khai báo thông tin <span className="text-red-500">❖</span>
            </h2>

            <div className="space-y-8 relative z-10">

              {/* TÊN & GIỚI TÍNH */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Tên gọi / Mã bầy <span className="text-rose-500">*</span></label>
                  <input type="text" placeholder="VD: KinVie Apollo..." value={catData.name} onChange={(e) => setCatData({ ...catData, name: e.target.value })} className="w-full bg-white/70 backdrop-blur-sm border border-stone-200/80 rounded-2xl px-6 py-4 text-stone-800 font-bold text-lg focus:outline-none focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all shadow-sm" />
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
                <div className="relative z-30">
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Giống mèo</label>
                  <button
                    type="button"
                    onClick={() => setIsBreedDropdownOpen(!isBreedDropdownOpen)}
                    className="cursor-pointer w-full bg-white/70 backdrop-blur-sm border border-stone-200/80 rounded-2xl px-6 py-4 text-stone-800 font-bold text-lg flex items-center justify-between focus:outline-none focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all shadow-sm h-[60px]"
                  >
                    <span>{catData.breed}</span>
                    <span className="text-[10px] text-stone-400">▼</span>
                  </button>
                  {isBreedDropdownOpen && (
                    <div className="absolute top-[85px] left-0 w-full bg-white border border-stone-200 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar p-2">
                      {Object.entries(
                        dbBreeds.reduce((acc: any, b: any) => {
                          const cat = b.category || 'Khác';
                          if (!acc[cat]) acc[cat] = [];
                          acc[cat].push(b.name);
                          return acc;
                        }, {})
                      ).map(([cat, names]: any) => (
                        <div key={cat}>
                          <div className="text-[10px] font-black text-stone-400 uppercase px-3 py-2 mt-2 border-t border-stone-100 first:border-t-0 first:mt-0">
                            {cat === 'Ta / Lai' ? '🐈' : '🌟'} {cat}
                          </div>
                          {names.map((b: string) => (
                            <div key={b} onClick={() => { setCatData({ ...catData, breed: b }); setIsBreedDropdownOpen(false); }} className="px-4 py-3 hover:bg-red-50 hover:text-red-600 rounded-xl cursor-pointer text-sm font-bold text-stone-700 transition-colors">{b}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {isMixed && (
                    <div className="mt-3 p-4 bg-stone-100 rounded-2xl border border-stone-200 flex items-center gap-3">
                      <select value={mix1} onChange={(e) => setMix1(e.target.value)} className="w-full bg-white border border-stone-200 px-3 py-2 rounded-xl text-xs font-bold shadow-sm">
                        {dbBreeds.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                      </select>
                      <span className="text-red-500 font-black text-sm">X</span>
                      <select value={mix2} onChange={(e) => setMix2(e.target.value)} className="w-full bg-white border border-stone-200 px-3 py-2 rounded-xl text-xs font-bold shadow-sm">
                        {dbBreeds.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Ngày sinh (DOB)</label>
                  <input type="date" value={catData.dob} onChange={(e) => setCatData({ ...catData, dob: e.target.value })} className="cursor-pointer w-full bg-white/70 backdrop-blur-sm border border-stone-200/80 rounded-2xl px-6 py-4 text-stone-800 font-bold text-lg focus:outline-none focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all shadow-sm" />
                </div>
              </div>

              {/* TRẠNG THÁI */}
              <div>
                <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Trạng thái hiện tại</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: 'Chưa sẵn sàng', icon: '○' },
                    { label: 'Sẵn sàng', icon: '◻' },
                    { label: 'Đã cọc', icon: '◻' },
                    { label: 'Đã về nhà mới', icon: '🔴' }
                  ].map((item) => {
                    const isSelected = catData.status === item.label;

                    // 🎯 SET MÀU ĐỘNG TÙY THEO TỪNG TRẠNG THÁI KHÁC NHAU
                    let activeColor = '';
                    if (item.label === 'Chưa sẵn sàng') activeColor = 'bg-stone-800 text-white border-stone-800'; // Đen
                    if (item.label === 'Sẵn sàng') activeColor = 'bg-emerald-500 text-white border-emerald-500'; // Xanh lá
                    if (item.label === 'Đã cọc') activeColor = 'bg-amber-500 text-white border-amber-500'; // Vàng
                    if (item.label === 'Đã về nhà mới') activeColor = 'bg-rose-500 text-white border-rose-500'; // Đỏ

                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setCatData({ ...catData, status: item.label })}
                        className={`cursor-pointer px-5 py-3 rounded-[14px] text-[14px] font-bold transition-all duration-300 border flex items-center gap-2 ${isSelected ? `${activeColor} shadow-md transform scale-[1.02]` : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                          }`}
                      >
                        <span className={`text-[15px] ${item.label === 'Đã về nhà mới' ? '' : isSelected ? 'text-white' : 'text-stone-400'}`}>
                          {item.icon}
                        </span>
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PHẢ HỆ (CUSTOM DROPDOWN) */}
              {isPurebred && (
                <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100 shadow-sm mt-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-blue-900 uppercase flex items-center gap-2"><span>🌳</span> Gán Phả Hệ (Bố/Mẹ)</h3>
                  </div>

                  {/* BỐ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 relative z-40">
                    <div className="relative">
                      <label className="block text-[10px] font-black text-blue-500 uppercase mb-2">Trại của Mèo Bố</label>
                      <button
                        type="button"
                        onClick={() => { setIsFatherBreederDropdownOpen(!isFatherBreederDropdownOpen); setIsFatherDropdownOpen(false); setIsMotherDropdownOpen(false); setIsMotherBreederDropdownOpen(false); }}
                        className="w-full bg-white border border-blue-200 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm outline-none flex items-center justify-between cursor-pointer h-[46px]"
                      >
                        <span className="truncate">
                          {fatherBreederId
                            ? (breedersList.find(b => b.userid.toString() === fatherBreederId)?.type_id === 1
                              ? 'KinVie Cattery'
                              : breedersList.find(b => b.userid.toString() === fatherBreederId)?.cattery_name || breedersList.find(b => b.userid.toString() === fatherBreederId)?.fullname || breedersList.find(b => b.userid.toString() === fatherBreederId)?.email || `Đối tác #${fatherBreederId}`)
                            : '-- Chọn Trại giống --'}
                        </span>
                        <span className="text-[10px] text-stone-400">▼</span>
                      </button>
                      {isFatherBreederDropdownOpen && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-blue-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar p-2">
                          <div
                            onClick={() => { setFatherBreederId(''); setFatherId(null); setIsFatherBreederDropdownOpen(false); }}
                            className="p-3 hover:bg-blue-50 cursor-pointer text-sm text-stone-500 font-bold border-b border-stone-100 rounded-lg"
                          >
                            -- Chọn Trại giống --
                          </div>
                          {breedersList.map(b => (
                            <div
                              key={b.userid}
                              onClick={() => { setFatherBreederId(b.userid.toString()); setFatherId(null); setIsFatherBreederDropdownOpen(false); }}
                              className="p-3 hover:bg-blue-50 hover:text-blue-600 cursor-pointer text-sm text-stone-700 font-bold rounded-lg transition-colors truncate"
                            >
                              {b.type_id === 1 ? 'KinVie Cattery' : (b.cattery_name || b.fullname || b.email || b.phone || `Đối tác #${b.userid}`)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <label className="block text-[10px] font-black text-blue-500 uppercase mb-2">Mèo Bố</label>
                      <button
                        type="button"
                        disabled={!fatherBreederId}
                        onClick={() => { setIsFatherDropdownOpen(!isFatherDropdownOpen); setIsFatherBreederDropdownOpen(false); setIsMotherDropdownOpen(false); setIsMotherBreederDropdownOpen(false); }}
                        className="w-full bg-white border border-blue-200 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm outline-none flex items-center justify-between disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed cursor-pointer h-[46px]"
                      >
                        {fatherId ? (
                          <div className="flex items-center gap-3">
                            <img src={getCatImage(fatherId)} className="w-6 h-6 rounded-md object-cover border border-stone-200" alt="father" />
                            <span>{allCatsList.find(c => c.id === fatherId)?.name}</span>
                          </div>
                        ) : (
                          <span className="text-stone-400">-- Chọn Mèo Bố --</span>
                        )}
                        <span className="text-[10px] text-stone-400">▼</span>
                      </button>

                      {isFatherDropdownOpen && !!fatherBreederId && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-blue-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
                          <div
                            onClick={() => { setFatherId(null); setIsFatherDropdownOpen(false); }}
                            className="p-3 hover:bg-blue-50 cursor-pointer text-sm text-stone-500 font-bold border-b border-stone-100"
                          >
                            -- Bỏ chọn / Không rõ --
                          </div>
                          {allCatsList
                            .filter(c => c.gender !== false && c.breeder_id?.toString() === fatherBreederId && !excludedForFather.includes(c.id))
                            .map(c => (
                              <div
                                key={c.id}
                                onClick={() => { setFatherId(c.id); setIsFatherDropdownOpen(false); }}
                                className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b border-stone-50 last:border-0 transition-colors"
                              >
                                <img src={c.images?.[0] || 'https://via.placeholder.com/100?text=No+Img'} className="w-8 h-8 rounded-lg object-cover border border-stone-200 shadow-sm shrink-0" alt="cat" />
                                <div className="overflow-hidden">
                                  <p className="text-sm font-bold text-stone-800 truncate">{c.name}</p>
                                  <p className="text-[10px] text-stone-500 truncate">{formatEmsCode(c.color)}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MẸ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-30">
                    <div className="relative">
                      <label className="block text-[10px] font-black text-rose-400 uppercase mb-2">Trại của Mèo Mẹ</label>
                      <button
                        type="button"
                        onClick={() => { setIsMotherBreederDropdownOpen(!isMotherBreederDropdownOpen); setIsMotherDropdownOpen(false); setIsFatherDropdownOpen(false); setIsFatherBreederDropdownOpen(false); }}
                        className="w-full bg-white border border-rose-200 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm outline-none flex items-center justify-between cursor-pointer h-[46px]"
                      >
                        <span className="truncate">
                          {motherBreederId
                            ? (breedersList.find(b => b.userid.toString() === motherBreederId)?.type_id === 1
                              ? 'KinVie Cattery'
                              : breedersList.find(b => b.userid.toString() === motherBreederId)?.cattery_name || breedersList.find(b => b.userid.toString() === motherBreederId)?.fullname || breedersList.find(b => b.userid.toString() === motherBreederId)?.email || `Đối tác #${motherBreederId}`)
                            : '-- Chọn Trại giống --'}
                        </span>
                        <span className="text-[10px] text-stone-400">▼</span>
                      </button>
                      {isMotherBreederDropdownOpen && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-rose-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar p-2">
                          <div
                            onClick={() => { setMotherBreederId(''); setMotherId(null); setIsMotherBreederDropdownOpen(false); }}
                            className="p-3 hover:bg-rose-50 cursor-pointer text-sm text-stone-500 font-bold border-b border-stone-100 rounded-lg"
                          >
                            -- Chọn Trại giống --
                          </div>
                          {breedersList.map(b => (
                            <div
                              key={b.userid}
                              onClick={() => { setMotherBreederId(b.userid.toString()); setMotherId(null); setIsMotherBreederDropdownOpen(false); }}
                              className="p-3 hover:bg-rose-50 hover:text-rose-600 cursor-pointer text-sm text-stone-700 font-bold rounded-lg transition-colors truncate"
                            >
                              {b.type_id === 1 ? 'KinVie Cattery' : (b.cattery_name || b.fullname || b.email || b.phone || `Đối tác #${b.userid}`)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <label className="block text-[10px] font-black text-rose-400 uppercase mb-2">Mèo Mẹ</label>
                      <button
                        type="button"
                        disabled={!motherBreederId}
                        onClick={() => { setIsMotherDropdownOpen(!isMotherDropdownOpen); setIsMotherBreederDropdownOpen(false); setIsFatherDropdownOpen(false); setIsFatherBreederDropdownOpen(false); }}
                        className="w-full bg-white border border-rose-200 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm outline-none flex items-center justify-between disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed cursor-pointer h-[46px]"
                      >
                        {motherId ? (
                          <div className="flex items-center gap-3">
                            <img src={getCatImage(motherId)} className="w-6 h-6 rounded-md object-cover border border-stone-200" alt="mother" />
                            <span>{allCatsList.find(c => c.id === motherId)?.name}</span>
                          </div>
                        ) : (
                          <span className="text-stone-400">-- Chọn Mèo Mẹ --</span>
                        )}
                        <span className="text-[10px] text-stone-400">▼</span>
                      </button>

                      {isMotherDropdownOpen && !!motherBreederId && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-rose-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
                          <div
                            onClick={() => { setMotherId(null); setIsMotherDropdownOpen(false); }}
                            className="p-3 hover:bg-rose-50 cursor-pointer text-sm text-stone-500 font-bold border-b border-stone-100"
                          >
                            -- Bỏ chọn / Không rõ --
                          </div>
                          {allCatsList
                            .filter(c => c.gender === false && c.breeder_id?.toString() === motherBreederId && !excludedForMother.includes(c.id))
                            .map(c => (
                              <div
                                key={c.id}
                                onClick={() => { setMotherId(c.id); setIsMotherDropdownOpen(false); }}
                                className="flex items-center gap-3 p-3 hover:bg-rose-50 cursor-pointer border-b border-stone-50 last:border-0 transition-colors"
                              >
                                <img src={c.images?.[0] || 'https://via.placeholder.com/100?text=No+Img'} className="w-8 h-8 rounded-lg object-cover border border-stone-200 shadow-sm shrink-0" alt="cat" />
                                <div className="overflow-hidden">
                                  <p className="text-sm font-bold text-stone-800 truncate">{c.name}</p>
                                  <p className="text-[10px] text-stone-500 truncate">{formatEmsCode(c.color)}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
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

              {/* 🎯 BẢNG CHỌN MÀU EMS DẠNG SỔ XUỐNG (ACCORDION) */}
              {isPurebred ? (
                <div className="bg-red-50/50 rounded-3xl p-6 border border-red-100 shadow-sm mt-8 transition-all duration-300">
                  <div className="flex items-center justify-between cursor-pointer group cursor-pointer" onClick={() => setIsEmsOpen(!isEmsOpen)}>
                    <h3 className="text-sm font-bold text-stone-800 uppercase flex items-center gap-2 group-hover:text-red-600 transition-colors">
                      <span>🎨</span> Cập nhật Màu lông (Hệ EMS)
                      <span className={`text-stone-400 transition-transform duration-300 ${isEmsOpen ? 'rotate-180' : ''}`}>▼</span>
                    </h3>
                    <div className="text-right">
                      <p className="text-[10px] text-stone-500 uppercase font-bold">Mã đang tạo</p>
                      <p className="text-lg font-black text-red-600 bg-white px-3 py-1 rounded-lg border border-red-200 shadow-sm">{generatedEmsCode || 'Chưa chọn'}</p>
                    </div>
                  </div>

                  {isEmsOpen && dbBaseColors.length > 0 && (
                    <div className="mt-6 border-t border-red-200/50 pt-6 animate-fade-in">
                      <div className="mb-6">
                        <p className="text-xs font-bold text-stone-500 mb-2">1. Màu cơ bản (Base Color)</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {dbBaseColors.map(c => (
                            <div key={c.code} onClick={() => setBaseColor(baseColor === c.code ? null : c.code)} className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${baseColor === c.code ? 'bg-white border-red-500 shadow-sm ring-1 ring-red-500' : 'bg-white border-stone-200 hover:border-red-300'}`}>
                              <div style={{ backgroundColor: c.hex }} className="w-5 h-5 rounded-md border border-stone-200 shrink-0"></div>
                              <div className="overflow-hidden"><p className="text-xs font-bold text-stone-800 uppercase">{c.code}</p><p className="text-[9px] text-stone-500 truncate">{c.name}</p></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="sm:col-span-1">
                          <p className="text-xs font-bold text-stone-500 mb-2">2. Ánh bạc</p>
                          <div onClick={() => setHasSilver(!hasSilver)} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${hasSilver ? 'bg-white border-red-500 shadow-sm ring-1 ring-red-500' : 'bg-white border-stone-200 hover:border-red-300'}`}>
                            <div><p className="text-xs font-bold text-stone-800">Mã "s"</p><p className="text-[10px] text-stone-500">Silver / Smoke</p></div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${hasSilver ? 'bg-red-500 border-red-500' : 'border-stone-300'}`}>
                              {hasSilver && <span className="text-white text-[10px]">✓</span>}
                            </div>
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs font-bold text-stone-500 mb-2">3. Hoa văn (Pattern)</p>
                          <div className="grid grid-cols-2 gap-2">
                            {dbPatterns.map(p => (
                              <div key={p.code} onClick={() => setPattern(pattern === p.code ? null : p.code)} className={`p-2 rounded-xl border cursor-pointer text-center transition-all ${pattern === p.code ? 'bg-white border-red-500 shadow-sm ring-1 ring-red-500' : 'bg-white border-stone-200 hover:border-red-300'}`}>
                                <p className="text-xs font-bold text-stone-800">{p.code}</p><p className="text-[9px] text-stone-500 truncate">{p.name}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-stone-50/50 rounded-3xl p-6 border border-stone-200 shadow-sm mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-stone-800 uppercase flex items-center gap-2"><span>🐈</span> Chọn Màu lông (Mèo Dân Dã)</h3>
                    <div className="text-right">
                      <p className="text-lg font-black text-stone-600 bg-white px-3 py-1 rounded-lg border border-stone-200 shadow-sm">{simpleColor || '???'}</p>
                    </div>
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

              <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100 shadow-sm mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-stone-800 uppercase flex items-center gap-2"><span>🏥</span> Sức khỏe & Tiêm phòng</h3>
                  <button onClick={() => setIsMedicalModalOpen(true)} className="text-xs font-bold bg-white text-red-600 px-4 py-2 rounded-xl shadow-sm border border-red-200 hover:bg-red-500 hover:text-white transition-colors cursor-pointer">
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
                            {record.nextDueDate && <span className="ml-3 text-red-500 bg-red-50 px-2 py-0.5 rounded-md">Nhắc lại: {formatDateDisplay(record.nextDueDate)}</span>}
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
                    value={catData.notes} onChange={(e) => setCatData({ ...catData, notes: e.target.value })}
                    placeholder="Ghi chú thêm về sức khỏe, thói quen ăn uống, tính cách của bé..." rows={4}
                    className="w-full bg-white border border-stone-200/80 rounded-2xl px-5 py-4 text-stone-800 text-sm focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all shadow-sm resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="border-t border-stone-200/60 pt-8 mt-4">
                <label className="block text-xs font-black text-red-500 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                  <span className="text-xl">💰</span> Giá niêm yết chuyển nhượng (VNĐ)
                </label>
                <div className="relative group/price">
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-rose-400 rounded-2xl blur opacity-25 group-hover/price:opacity-50 transition duration-500 pointer-events-none"></div>
                  <input
                    type="number" value={catData.price} onChange={(e) => setCatData({ ...catData, price: parseInt(e.target.value) || 0 })}
                    className="cursor-pointer relative w-full bg-white border-2 border-red-100 rounded-2xl pl-16 pr-6 py-6 text-4xl md:text-5xl text-red-600 font-black focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all shadow-lg placeholder:text-red-200"
                  />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-red-400 font-black text-3xl select-none pointer-events-none">đ</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* 🎯 MODAL THÊM LỊCH TIÊM */}
      {isMedicalModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm cursor-pointer" onClick={() => setIsMedicalModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scale-up">
            <h2 className="text-xl font-black text-stone-800 mb-6 flex items-center gap-2">💉 Thêm mũi tiêm mới</h2>
            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-2">Tên Vaccine / Mũi tiêm</label>
                <input
                  type="text" placeholder="Ví dụ: Vaccine 4 bệnh, Dại, Tẩy giun..."
                  value={newRecord.vaccineName} onChange={(e) => setNewRecord({ ...newRecord, vaccineName: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-stone-700 focus:border-red-400 focus:ring-2 focus:ring-red-500/20 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-2">Ngày tiêm</label>
                  <input type="date" value={newRecord.dateGiven} onChange={(e) => setNewRecord({ ...newRecord, dateGiven: e.target.value })} className="cursor-pointer w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-stone-700 focus:border-red-400 focus:ring-2 focus:ring-red-500/20 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-2">Nhắc lại (Nếu có)</label>
                  <input type="date" value={newRecord.nextDueDate} onChange={(e) => setNewRecord({ ...newRecord, nextDueDate: e.target.value })} className="cursor-pointer w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-stone-700 focus:border-red-400 focus:ring-2 focus:ring-red-500/20 outline-none" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsMedicalModalOpen(false)} className="cursor-pointer px-5 py-2.5 rounded-xl font-bold text-stone-500 hover:bg-stone-100 transition-colors">Hủy</button>
              <button onClick={addMedicalRecord} className="cursor-pointer px-6 py-2.5 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/30 transition-all hover:-translate-y-0.5">Thêm Mũi Tiêm</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}