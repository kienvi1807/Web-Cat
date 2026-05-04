"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion'; // Thêm Framer Motion vào
import BackgroundGlow from '@/components/layout/BackgroundGlow';
import { useLayoutStore } from '@/store/useLayoutStore';
import { ALL_BREEDS, SIMPLE_COLORS, formatEmsCode, formatDateDisplay } from '@/lib/utils';

// Cấu hình animation Stagger cho Dropdown
const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03, delayChildren: 0.05 } }
};
const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export default function CatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const catId = params.id;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null); 

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 
  
  const [catData, setCatData] = useState<any>({
    name: '', breed: 'Maine Coon', color: '', price: 0, status: '', dob: '', images: [], medical_history: [], notes: '', father_id: null, mother_id: null
  });

  const [mainImage, setMainImage] = useState<string>('');
  const [gender, setGender] = useState<boolean>(true);

  // STATE MÀU SẮC
  const [dbBaseColors, setDbBaseColors] = useState<any[]>([]);
  const [dbPatterns, setDbPatterns] = useState<any[]>([]);
  const [baseColor, setBaseColor] = useState<string | null>(null);
  const [hasSilver, setHasSilver] = useState(false);
  const [pattern, setPattern] = useState<string | null>(null);
  const [simpleColor, setSimpleColor] = useState<string>('');
  const [isEmsOpen, setIsEmsOpen] = useState<boolean>(false);

  // STATE DROPDOWN CUSTOM
  const [isBreedOpen, setIsBreedOpen] = useState(false);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({ vaccineName: '', dateGiven: '', nextDueDate: '' });

  // STATE PHẢ HỆ
  const [allCatsList, setAllCatsList] = useState<any[]>([]);
  const [breedersList, setBreedersList] = useState<any[]>([]);
  const [fatherBreederId, setFatherBreederId] = useState('');
  const [motherBreederId, setMotherBreederId] = useState('');
  const [isFatherDropdownOpen, setIsFatherDropdownOpen] = useState(false);
  const [isMotherDropdownOpen, setIsMotherDropdownOpen] = useState(false);
  const [isFatherBreederOpen, setIsFatherBreederOpen] = useState(false);
  const [isMotherBreederOpen, setIsMotherBreederOpen] = useState(false);

  const setThemeColor = useLayoutStore((state: any) => state.setThemeColor);
  useEffect(() => {
    setThemeColor('red'); // 👈 Set lại tone đỏ
  }, [setThemeColor]);

  const getAvatarUrl = (path: string) => {
    if (!path) return 'https://ui-avatars.com/api/?name=Trại&background=E2E8F0&color=64748B&bold=true';
    
    // Nếu database đã lưu sẵn link http đầy đủ thì trả về luôn
    if (path.startsWith('http')) return path;
    
    // Nếu chỉ lưu path (VD: avatars/abc.jpg), dùng supabase để tạo link public
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  };


  const getCatImage = (id: number) => {
    const cat = allCatsList.find(c => c.id === id);
    return cat?.images?.[0] || 'https://via.placeholder.com/100?text=No+Img';
  };

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      
      const { data: colors } = await supabase.from('ems_base_colors').select('*');
      if (colors) setDbBaseColors(colors);
      
      const { data: patterns } = await supabase.from('ems_patterns').select('*');
      if (patterns) setDbPatterns(patterns);

      const { data: breeders } = await supabase.from('users').select('userid, fullname, email, phone, avatarurl, cattery_name').in('type_id', [1, 3]);
      if (breeders) setBreedersList(breeders);

      const { data: allCats } = await supabase.from('cats').select('id, name, gender, images, color, breeder_id, father_id, mother_id');
      if (allCats) setAllCatsList(allCats);

      if (catId) {
        const { data, error } = await supabase.from('cats').select('*').eq('id', catId).single();
        if (data) {
          let loadedImages = data.images || [];
          while (loadedImages.length < 5) loadedImages.push(''); 
          setCatData({ ...data, images: loadedImages, medical_history: data.medical_history || [], notes: data.notes || '' });
          if (loadedImages[0]) setMainImage(loadedImages[0]);
          setGender(data.gender !== false);

          const colorStr = data.color || '';
          if (colorStr && !colorStr.includes(' ') && colorStr.length <= 5) {
            setBaseColor(colorStr[0]);
            setHasSilver(colorStr.includes('s'));
            const pMatch = colorStr.match(/\d{2}/);
            if (pMatch) setPattern(pMatch[0]);
          } else {
            setSimpleColor(colorStr);
          }

          if (data.father_id && allCats) {
            const father = allCats.find(c => c.id === data.father_id);
            if (father) setFatherBreederId(father.breeder_id?.toString() || '1');
          }
          if (data.mother_id && allCats) {
            const mother = allCats.find(c => c.id === data.mother_id);
            if (mother) setMotherBreederId(mother.breeder_id?.toString() || '1');
          }
        }
      }
      setIsLoading(false);
    };
    initData();
  }, [catId]);

  const handleImageClick = (index: number) => {
    setUploadingSlot(index);
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingSlot === null) return;
    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `cat_${catId}_${Date.now()}.${fileExt}`;
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
  const generatedEmsCode = `${baseColor || ''}${hasSilver && baseColor ? 's' : ''}${pattern || ''}`;

  const handleUpdateCat = async () => {
    setIsSaving(true);
    const cleanImages = catData.images.filter((img: string) => img !== '');
    const finalColor = isPurebred ? (generatedEmsCode || catData.color) : (simpleColor || catData.color);

    const { error } = await supabase.from('cats').update({
      name: catData.name, breed: catData.breed, gender: gender, color: finalColor,
      price: catData.price, status: catData.status, dob: catData.dob, images: cleanImages,
      medical_history: catData.medical_history, notes: catData.notes,
      father_id: catData.father_id || null, mother_id: catData.mother_id || null
    }).eq('id', catId);

    setIsSaving(false);
    if (!error) {
      alert("Đã cập nhật hồ sơ bé mèo thành công! 🚀");
      router.push('/dashboard/cats/kinvie');
    } else {
      alert("Có lỗi xảy ra: " + error.message);
    }
  };

  const handleDeleteCat = async () => {
    const isConfirm = window.confirm("Sếp có chắc chắn muốn xóa hồ sơ bé mèo này không? Thao tác này không thể khôi phục!");
    if (isConfirm) {
      setIsSaving(true);
      const { error } = await supabase.from('cats').delete().eq('id', catId);
      if (!error) {
        alert("Đã xóa hồ sơ thành công!");
        router.push('/dashboard/cats/kinvie');
      } else {
        alert("Lỗi khi xóa hồ sơ: " + error.message);
        setIsSaving(false);
      }
    }
  };

  const addMedicalRecord = () => {
    if (!newRecord.vaccineName || !newRecord.dateGiven) { alert("Sếp vui lòng nhập Tên loại Vaccine và Ngày tiêm nhé!"); return; }
    setCatData({ ...catData, medical_history: [...catData.medical_history, newRecord] });
    setNewRecord({ vaccineName: '', dateGiven: '', nextDueDate: '' });
    setIsMedicalModalOpen(false);
  };
  const removeMedicalRecord = (index: number) => {
    const updatedHistory = [...catData.medical_history]; updatedHistory.splice(index, 1);
    setCatData({ ...catData, medical_history: updatedHistory });
  };

  // LOGIC CHỐNG PHỐI CẬN HUYẾT
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

  const getPartners = (targetId: number, list: any[]) => {
    const children = list.filter(c => c.father_id === targetId || c.mother_id === targetId);
    const partners: number[] = [];
    children.forEach(c => {
      if (c.father_id && c.father_id !== targetId && !partners.includes(c.father_id)) partners.push(c.father_id);
      if (c.mother_id && c.mother_id !== targetId && !partners.includes(c.mother_id)) partners.push(c.mother_id);
    });
    return partners;
  };

  const currentCatId = parseInt(catId as string);
  let baseExcluded = [currentCatId, ...getDescendants(currentCatId, allCatsList)];
  const myPartners = getPartners(currentCatId, allCatsList);
  myPartners.forEach(partnerId => {
    baseExcluded.push(partnerId, ...getAncestors(partnerId, allCatsList), ...getDescendants(partnerId, allCatsList));
  });

  let excludedForFather = [...baseExcluded];
  if (catData.mother_id) {
    excludedForFather.push(catData.mother_id, ...getAncestors(catData.mother_id, allCatsList), ...getDescendants(catData.mother_id, allCatsList));
  }

  let excludedForMother = [...baseExcluded];
  if (catData.father_id) {
    excludedForMother.push(catData.father_id, ...getAncestors(catData.father_id, allCatsList), ...getDescendants(catData.father_id, allCatsList));
  }

  // COMPONENT ĐỆ QUY CÂY PHẢ HỆ (ĐỔI SANG TONE ĐỎ)
  const PedigreeNode = ({ catIdNode, level, label }: { catIdNode: number | null, level: number, label: string }) => {
    if (!catIdNode || level > 5) return null;
    const cat = allCatsList.find(c => c.id === parseInt(catIdNode.toString()));
    if (!cat) return null;

    const hasFather = !!cat.father_id;
    const hasMother = !!cat.mother_id;
    const hasParents = level < 5 && (hasFather || hasMother);

    const isCurrent = level === 1;
    // 🎯 LOGIC PHÂN LOẠI MÀU THEO GIỚI TÍNH
    let borderClass = '';
    let textThemeClass = '';
    let glowClass = '';

    if (isCurrent) {
      // Con hiện tại: Đỏ
      borderClass = 'border-red-500 ring-4 ring-red-100';
      textThemeClass = 'text-red-600';
      glowClass = 'shadow-[0_0_15px_rgba(239,68,68,0.2)]';
    } else if (cat.gender) {
      // Các con Đực (level > 1): Xanh Blue
      borderClass = 'border-blue-300 hover:border-blue-500';
      textThemeClass = 'text-blue-600';
      glowClass = 'hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]';
    } else {
      // Các con Cái (level > 1): Hồng Rose
      borderClass = 'border-rose-300 hover:border-rose-500';
      textThemeClass = 'text-rose-500';
      glowClass = 'hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]';
    }

    return (
      <div className="flex items-center group/node animate-fade-in">
        {level > 1 && <div className="w-10 h-[2px] bg-red-200 rounded-full transition-colors group-hover/node:bg-red-400"></div>}
        
        <Link href={`/dashboard/cats/kinvie/${cat.id}`} className={`w-64 p-3 rounded-2xl border bg-white flex items-center gap-3 relative z-10 transition-all duration-300 hover:-translate-y-1 cursor-pointer ${borderClass} ${glowClass}`}>
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 relative">
             <img src={cat.images?.[0] || 'https://via.placeholder.com/100?text=No+Img'} className="w-full h-full object-cover" alt="cat" />
             <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-xl"></div>
          </div>
          <div className="overflow-hidden flex-1">
             <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${textThemeClass}`}>{label}</p>
             <p className="text-sm font-bold text-stone-800 truncate group-hover/node:text-red-600 transition-colors">{cat.name}</p>
             <p className="text-[10px] text-stone-500 truncate">{formatEmsCode(cat.color)}</p>
          </div>
        </Link>

        {hasParents && (
          <div className="flex items-center">
            <div className="w-8 h-[2px] bg-red-200 rounded-full transition-colors group-hover/node:bg-red-400"></div>
            <div className="flex flex-col justify-center gap-6 border-l-2 border-red-200 py-4 my-2 transition-colors group-hover/node:border-red-400 relative">
               {hasFather && <div className="flex items-center relative -left-[2px]"><PedigreeNode catIdNode={cat.father_id} level={level+1} label={`Đời ${level+1} (Bố)`} /></div>}
               {hasMother && <div className="flex items-center relative -left-[2px]"><PedigreeNode catIdNode={cat.mother_id} level={level+1} label={`Đời ${level+1} (Mẹ)`} /></div>}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-red-500 animate-pulse">
      <span className="text-6xl mb-4">🐈</span>
      <h2 className="text-2xl font-black font-sans">Đang mở hồ sơ mật...</h2>
    </div>
  );

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto pb-24 relative">
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
      
      {/* 🎯 GỌI COMPONENT NỀN THÔNG MINH */}
      <BackgroundGlow />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 backdrop-blur-md bg-white/40 p-6 rounded-[2rem] border border-white/60 shadow-sm sticky top-4 z-50">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <Link href="/dashboard/cats/kinvie" className="cursor-pointer w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm text-stone-500 hover:text-red-500 hover:shadow-red-500/20 transition-all font-bold text-xl hover:-translate-x-1">←</Link>
          <div>
            <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-1">Hồ sơ Cattery / #{catId}</p>
            <h1 className="text-3xl font-sans font-black text-stone-800 flex items-center gap-3">{catData.name || 'Mèo Vô Danh'}</h1>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button onClick={handleDeleteCat} disabled={isSaving || isUploading} className="cursor-pointer px-6 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Xóa Hồ Sơ</button>
          <button onClick={handleUpdateCat} disabled={isSaving || isUploading} className="cursor-pointer bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-black px-10 py-4 rounded-xl shadow-[0_4px_20px_rgba(239,68,68,0.4)] hover:shadow-[0_4px_30px_rgba(239,68,68,0.6)] transition-all transform hover:-translate-y-1 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi 🚀'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 relative z-10">
        {/* CỘT TRÁI: ẢNH */}
        <div className="w-full lg:w-5/12 flex flex-col gap-4">
          <div onClick={() => handleImageClick(0)} className="cursor-pointer relative aspect-[4/5] bg-stone-100 rounded-[2.5rem] border border-white/80 shadow-[0_10px_40px_rgba(0,0,0,0.05)] overflow-hidden group">
            {isUploading && uploadingSlot === 0 && <div className="absolute inset-0 bg-stone-900/60 flex flex-col items-center justify-center text-white z-20"><span className="text-4xl animate-spin mb-2">🐾</span><p className="font-bold">Đang tải ảnh lên...</p></div>}
            <img src={mainImage || 'https://via.placeholder.com/800'} alt="Main" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm"><span className="bg-white/90 text-stone-800 font-bold px-6 py-3 rounded-full shadow-xl flex items-center gap-2">📸 {catData.images[0] ? 'Đổi ảnh bìa' : 'Thêm ảnh bìa'}</span></div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((idx) => {
              const imgUrl = catData.images?.[idx];
              return (
                <div key={idx} onClick={() => handleImageClick(idx)} className="cursor-pointer relative aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-sm hover:border-red-400 transition-all duration-300 group">
                  {isUploading && uploadingSlot === idx && <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-white z-20"><span className="animate-spin">🐾</span></div>}
                  {imgUrl ? <><img src={imgUrl} className="w-full h-full object-cover group-hover:brightness-50 transition-all" alt={`Thumb ${idx}`} /><div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white font-bold text-sm z-10 transition-opacity">Đổi</div></> : <div className="w-full h-full bg-stone-100 flex flex-col items-center justify-center text-stone-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors"><span className="text-xl mb-1">+</span></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* CỘT PHẢI: FORM */}
        <div className="w-full lg:w-7/12">
          <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 lg:p-12 border border-white/80 shadow-[0_10px_50px_rgba(0,0,0,0.03)] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ef4444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <h2 className="text-2xl font-black text-stone-800 mb-8 flex items-center gap-3">Thông tin chi tiết <span className="text-red-500">❖</span></h2>

            <div className="space-y-8 relative z-10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Tên gọi / Mã bầy</label>
                  <input type="text" value={catData.name} onChange={(e) => setCatData({...catData, name: e.target.value})} className="w-full bg-white/70 backdrop-blur-sm border border-stone-200/80 rounded-2xl px-6 py-4 text-stone-800 font-bold text-lg focus:outline-none focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Giới tính</label>
                  <div className="flex bg-white/70 backdrop-blur-sm border border-stone-200/80 rounded-2xl overflow-hidden p-1 shadow-sm h-[60px]">
                    <button type="button" onClick={() => setGender(true)} className={`cursor-pointer flex-1 text-sm font-black rounded-xl transition-all ${gender ? 'bg-blue-600 text-white shadow-md transform scale-[1.02]' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}>♂ Đực</button>
                    <button type="button" onClick={() => setGender(false)} className={`cursor-pointer flex-1 text-sm font-black rounded-xl transition-all ${!gender ? 'bg-rose-500 text-white shadow-md transform scale-[1.02]' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}>♀ Cái</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 🎯 DROPDOWN GIỐNG MÈO DARK MODE */}
                <div className="relative">
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Giống mèo</label>
                  <button 
                    type="button" 
                    onClick={() => setIsBreedOpen(!isBreedOpen)}
                    className="cursor-pointer w-full bg-white/70 backdrop-blur-sm border border-stone-200/80 rounded-2xl px-6 py-4 text-left text-stone-800 font-bold text-lg focus:outline-none focus:border-red-400 transition-all shadow-sm flex justify-between items-center"
                  >
                    <span className={catData.breed === 'Chưa rõ' ? 'text-stone-400' : 'text-red-600'}>{catData.breed}</span>
                    <span className={`transition-transform duration-300 text-red-400 ${isBreedOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  
                  <AnimatePresence>
                    {isBreedOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-full left-0 w-full mt-2 bg-white/95 backdrop-blur-xl border border-blue-100 shadow-xl rounded-2xl z-50 max-h-60 overflow-hidden flex flex-col"
                      >
                        <div className="overflow-y-auto p-2 custom-scrollbar">
                          <motion.div variants={listVariants} initial="hidden" animate="show">
                            {ALL_BREEDS.map(breed => (
                              <motion.div 
                                key={breed} 
                                variants={itemVariants}
                                onClick={() => { setCatData({...catData, breed}); setIsBreedOpen(false); }}
                                className={`cursor-pointer px-5 py-3 rounded-xl font-bold text-sm transition-all mb-1 flex justify-between ${catData.breed === breed ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-red-600 hover:bg-red-600 hover:text-white'}`}
                              >
                                <span>{breed}</span>
                                {catData.breed === breed && <span className="text-white/80">✓</span>}
                              </motion.div>
                            ))}
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Ngày sinh (DOB)</label>
                  <input type="date" value={catData.dob || ''} onChange={(e) => setCatData({...catData, dob: e.target.value})} className="cursor-pointer w-full bg-white/70 backdrop-blur-sm border border-stone-200/80 rounded-2xl px-6 py-4 text-stone-800 font-bold text-lg focus:outline-none focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all shadow-sm" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Trạng thái hiện tại</label>
                <div className="flex flex-wrap gap-3">
                  
                  {/* 🎯 BẢNG MÀU TƯƠNG ỨNG VỚI TỪNG TRẠNG THÁI */}
                  {['Chưa sẵn sàng', 'Sẵn sàng', 'Đã cọc', 'Đã về nhà mới'].map((item) => {
                    
                    const statusStyles = {
                      'Chưa sẵn sàng': {
                        active: 'bg-stone-800 text-white border-stone-800 shadow-lg shadow-stone-500/30',
                        hover: 'hover:border-stone-400 hover:bg-stone-50'
                      },
                      'Sẵn sàng': {
                        active: 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/30',
                        hover: 'hover:border-green-400 hover:bg-green-50'
                      },
                      'Đã cọc': {
                        active: 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/30',
                        hover: 'hover:border-amber-400 hover:bg-amber-50'
                      },
                      'Đã về nhà mới': {
                        active: 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/30',
                        hover: 'hover:border-blue-400 hover:bg-blue-50'
                      }
                    };

                    const style = statusStyles[item as keyof typeof statusStyles];
                    const isActive = catData.status === item;

                    return (
                      <button 
                        key={item} 
                        onClick={() => setCatData({...catData, status: item})}
                        className={`cursor-pointer px-5 py-3 rounded-2xl text-[14px] font-bold transition-all duration-300 border ${
                          isActive 
                            ? `${style.active} transform scale-[1.02]` 
                            : `bg-white text-stone-500 border-stone-200 ${style.hover}`
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}

                </div>
              </div>

              {/* KHỐI CHỌN BỐ MẸ - GIAO DIỆN GLASS TRẮNG */}
              {isPurebred && (
                <div className="bg-red-50/30 rounded-3xl p-6 border border-red-100/50 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-red-800 uppercase flex items-center gap-2"><span>🌳</span> Gán Phả Hệ (Bố/Mẹ)</h3>
                  </div>
                  
                  {/* BỐ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    
                    {/* TRẠI CỦA MÈO BỐ */}
                    <div className="relative">
                      <label className="block text-[10px] font-black text-blue-500 uppercase mb-2">Trại của Mèo Bố</label>
                      <button 
                        type="button" 
                        onClick={() => { setIsFatherBreederOpen(!isFatherBreederOpen); setIsMotherBreederOpen(false); setIsFatherDropdownOpen(false); setIsMotherDropdownOpen(false); setIsBreedOpen(false); }}
                        className="cursor-pointer w-full bg-white border border-blue-100 px-4 py-3 rounded-xl text-sm font-bold shadow-sm outline-none flex items-center justify-between hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        <span className={!fatherBreederId ? 'text-stone-400' : 'text-blue-700'}>
                          {fatherBreederId 
                            ? (breedersList.find(b => b.userid.toString() === fatherBreederId)?.userid === 1 
                                ? 'KinVie Cattery' 
                                : breedersList.find(b => b.userid.toString() === fatherBreederId)?.cattery_name || 'Tên trại chưa cập nhật')
                            : '-- Chọn Trại giống --'}
                        </span>
                        <span className={`text-[10px] text-blue-400 transition-transform duration-300 ${isFatherBreederOpen ? 'rotate-180' : ''}`}>▼</span>
                      </button>

                      <AnimatePresence>
                        {isFatherBreederOpen && (
                          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="absolute top-full left-0 w-full mt-2 bg-white/95 backdrop-blur-xl border border-blue-100 shadow-xl rounded-2xl z-50 max-h-60 overflow-hidden flex flex-col">
                            <div className="overflow-y-auto custom-scrollbar p-2">
                              <motion.div variants={listVariants} initial="hidden" animate="show">
                                <motion.div variants={itemVariants} onClick={() => { setFatherBreederId(''); setCatData({...catData, father_id: null}); setIsFatherBreederOpen(false); }} className="p-3 hover:bg-blue-50 cursor-pointer text-sm text-stone-400 font-bold rounded-xl transition-colors">-- Bỏ chọn --</motion.div>
                                                                {breedersList.map(b => (
                                  <motion.div key={b.userid} variants={itemVariants} onClick={() => { setFatherBreederId(b.userid.toString()); setIsFatherBreederOpen(false); setCatData({...catData, father_id: null}); }} className="p-3 hover:bg-blue-50 cursor-pointer text-sm text-stone-700 font-bold rounded-xl transition-colors flex items-center gap-3">
                                    
                                    {/* 🎯 THAY ICON NHÀ BẰNG ẢNH AVATAR */}
                                    <img 
                                      src={getAvatarUrl(b.avatarurl)} 
                                      className="w-7 h-7 rounded-full object-cover border-2 border-blue-100 shadow-sm shrink-0" 
                                      alt="avatar" 
                                    />
                                    <span className="truncate">{b.userid === 1 ? 'KinVie Cattery' : b.cattery_name || 'Chưa đặt tên'}</span>
                                    
                                  </motion.div>
                                ))}
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* MÈO BỐ */}
                    <div className="relative">
                      <label className="block text-[10px] font-black text-blue-500 uppercase mb-2">Mèo Bố</label>
                      <button type="button" disabled={!fatherBreederId} onClick={() => { setIsFatherDropdownOpen(!isFatherDropdownOpen); setIsMotherDropdownOpen(false); setIsFatherBreederOpen(false); }} className="w-full bg-white border border-blue-100 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm outline-none flex items-center justify-between disabled:bg-stone-50 disabled:text-stone-300 disabled:cursor-not-allowed cursor-pointer h-[46px] hover:border-blue-300 transition-all">
                        {catData.father_id ? (<div className="flex items-center gap-3"><img src={getCatImage(catData.father_id)} className="w-6 h-6 rounded-md object-cover border border-stone-200" alt="father" /><span className="text-blue-700">{allCatsList.find(c => c.id === catData.father_id)?.name}</span></div>) : (<span className="text-stone-400">-- Chọn Mèo Bố --</span>)}
                        <span className={`text-[10px] text-blue-400 transition-transform duration-300 ${isFatherDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                      </button>

                      <AnimatePresence>
                        {isFatherDropdownOpen && !!fatherBreederId && (
                          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="absolute top-full left-0 w-full mt-2 bg-white/95 backdrop-blur-xl border border-blue-100 shadow-xl rounded-2xl z-50 max-h-60 overflow-hidden flex flex-col">
                            <div className="overflow-y-auto custom-scrollbar p-2">
                              <motion.div variants={listVariants} initial="hidden" animate="show">
                                <motion.div variants={itemVariants} onClick={() => { setCatData({...catData, father_id: null}); setIsFatherDropdownOpen(false); }} className="p-3 hover:bg-blue-50 cursor-pointer text-sm text-stone-400 font-bold rounded-xl transition-colors">-- Bỏ chọn --</motion.div>
                                {allCatsList.filter(c => c.gender !== false && !excludedForFather.includes(c.id) && (c.breeder_id?.toString() === fatherBreederId || c.id === catData.father_id)).map(c => (
                                  <motion.div key={c.id} variants={itemVariants} onClick={() => { setCatData({...catData, father_id: c.id}); setIsFatherDropdownOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer rounded-xl transition-colors">
                                    <img src={c.images?.[0] || 'https://via.placeholder.com/100?text=No+Img'} className="w-8 h-8 rounded-lg object-cover border border-blue-100 shadow-sm shrink-0" alt="cat" />
                                    <div className="overflow-hidden"><p className="text-sm font-bold text-stone-800 truncate">{c.name}</p><p className="text-[10px] text-stone-500 truncate">{formatEmsCode(c.color)}</p></div>
                                  </motion.div>
                                ))}
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* MẸ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* TRẠI CỦA MÈO MẸ */}
                    <div className="relative">
                      <label className="block text-[10px] font-black text-rose-400 uppercase mb-2">Trại của Mèo Mẹ</label>
                      <button 
                        type="button" 
                        onClick={() => { setIsMotherBreederOpen(!isMotherBreederOpen); setIsFatherBreederOpen(false); setIsFatherDropdownOpen(false); setIsMotherDropdownOpen(false); setIsBreedOpen(false); }}
                        className="cursor-pointer w-full bg-white border border-rose-100 px-4 py-3 rounded-xl text-sm font-bold shadow-sm outline-none flex items-center justify-between hover:border-rose-300 hover:shadow-md transition-all"
                      >
                        <span className={!motherBreederId ? 'text-stone-400' : 'text-rose-700'}>
                          {motherBreederId 
                            ? (breedersList.find(b => b.userid.toString() === motherBreederId)?.userid === 1 
                                ? 'KinVie Cattery' 
                                : breedersList.find(b => b.userid.toString() === motherBreederId)?.cattery_name || 'Tên trại chưa cập nhật')
                            : '-- Chọn Trại giống --'}
                        </span>
                        <span className={`text-[10px] text-rose-400 transition-transform duration-300 ${isMotherBreederOpen ? 'rotate-180' : ''}`}>▼</span>
                      </button>

                      <AnimatePresence>
                        {isMotherBreederOpen && (
                          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="absolute top-full left-0 w-full mt-2 bg-white/95 backdrop-blur-xl border border-rose-100 shadow-xl rounded-2xl z-50 max-h-60 overflow-hidden flex flex-col">
                            <div className="overflow-y-auto custom-scrollbar p-2">
                              <motion.div variants={listVariants} initial="hidden" animate="show">
                                <motion.div variants={itemVariants} onClick={() => { setMotherBreederId(''); setCatData({...catData, mother_id: null}); setIsMotherBreederOpen(false); }} className="p-3 hover:bg-rose-50 cursor-pointer text-sm text-stone-400 font-bold rounded-xl transition-colors">-- Bỏ chọn --</motion.div>
                                {breedersList.map(b => (
                                  <motion.div key={b.userid} variants={itemVariants} onClick={() => { setMotherBreederId(b.userid.toString()); setIsMotherBreederOpen(false); setCatData({...catData, mother_id: null}); }} className="p-3 hover:bg-rose-50 cursor-pointer text-sm text-stone-700 font-bold rounded-xl transition-colors flex items-center gap-3">
                                    
                                    {/* 🎯 THAY ICON NHÀ BẰNG ẢNH AVATAR */}
                                    <img 
                                      src={getAvatarUrl(b.avatarurl)} 
                                      className="w-7 h-7 rounded-full object-cover border-2 border-rose-100 shadow-sm shrink-0" 
                                      alt="avatar" 
                                    />
                                    <span className="truncate">{b.userid === 1 ? 'KinVie Cattery' : b.cattery_name || 'Chưa đặt tên'}</span>
                                    
                                  </motion.div>
                                ))}
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* MÈO MẸ */}
                    <div className="relative">
                      <label className="block text-[10px] font-black text-rose-400 uppercase mb-2">Mèo Mẹ</label>
                      <button type="button" disabled={!motherBreederId} onClick={() => { setIsMotherDropdownOpen(!isMotherDropdownOpen); setIsFatherDropdownOpen(false); setIsMotherBreederOpen(false); }} className="w-full bg-white border border-rose-100 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm outline-none flex items-center justify-between disabled:bg-stone-50 disabled:text-stone-300 disabled:cursor-not-allowed cursor-pointer h-[46px] hover:border-rose-300 transition-all">
                        {catData.mother_id ? (<div className="flex items-center gap-3"><img src={getCatImage(catData.mother_id)} className="w-6 h-6 rounded-md object-cover border border-stone-200" alt="mother" /><span className="text-rose-700">{allCatsList.find(c => c.id === catData.mother_id)?.name}</span></div>) : (<span className="text-stone-400">-- Chọn Mèo Mẹ --</span>)}
                        <span className={`text-[10px] text-rose-400 transition-transform duration-300 ${isMotherDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                      </button>

                      <AnimatePresence>
                        {isMotherDropdownOpen && !!motherBreederId && (
                          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="absolute top-full left-0 w-full mt-2 bg-white/95 backdrop-blur-xl border border-rose-100 shadow-xl rounded-2xl z-50 max-h-60 overflow-hidden flex flex-col">
                            <div className="overflow-y-auto custom-scrollbar p-2">
                              <motion.div variants={listVariants} initial="hidden" animate="show">
                                <motion.div variants={itemVariants} onClick={() => { setCatData({...catData, mother_id: null}); setIsMotherDropdownOpen(false); }} className="p-3 hover:bg-rose-50 cursor-pointer text-sm text-stone-400 font-bold rounded-xl transition-colors">-- Bỏ chọn --</motion.div>
                                {allCatsList.filter(c => c.gender === false && !excludedForMother.includes(c.id) && (c.breeder_id?.toString() === motherBreederId || c.id === catData.mother_id)).map(c => (
                                  <motion.div key={c.id} variants={itemVariants} onClick={() => { setCatData({...catData, mother_id: c.id}); setIsMotherDropdownOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-rose-50 cursor-pointer rounded-xl transition-colors">
                                    <img src={c.images?.[0] || 'https://via.placeholder.com/100?text=No+Img'} className="w-8 h-8 rounded-lg object-cover border border-rose-100 shadow-sm shrink-0" alt="cat" />
                                    <div className="overflow-hidden"><p className="text-sm font-bold text-stone-800 truncate">{c.name}</p><p className="text-[10px] text-stone-500 truncate">{formatEmsCode(c.color)}</p></div>
                                  </motion.div>
                                ))}
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}

              {/* BẢNG CHỌN MÀU EMS */}
              {isPurebred ? (
                <div className="bg-red-50/40 rounded-3xl p-6 border border-red-100 shadow-sm transition-all duration-300">
                   <div className="flex items-center justify-between cursor-pointer group" onClick={() => setIsEmsOpen(!isEmsOpen)}>
                     <h3 className="text-sm font-bold text-stone-800 uppercase flex items-center gap-2 group-hover:text-red-600 transition-colors">
                       <span>🎨</span> Cập nhật Màu lông (Hệ EMS)
                       <span className={`text-red-400 transition-transform duration-300 ${isEmsOpen ? 'rotate-180' : ''}`}>▼</span>
                     </h3>
                     <div className="text-right">
                       <p className="text-[10px] text-stone-500 uppercase font-bold">Mã của Boss</p>
                       <p className="text-lg font-black text-red-600 bg-white px-3 py-1 rounded-lg border border-red-200 shadow-sm">{generatedEmsCode || catData.color || '???'}</p>
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
                <div className="bg-stone-50/50 rounded-3xl p-6 border border-stone-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-sm font-bold text-stone-800 uppercase flex items-center gap-2"><span>🐈</span> Chọn Màu lông (Mèo Dân Dã)</h3>
                     <div className="text-right">
                       <p className="text-lg font-black text-red-600 bg-white px-3 py-1 rounded-lg border border-red-200 shadow-sm">{simpleColor || catData.color || '???'}</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {SIMPLE_COLORS.map(c => (
                      <div key={c.id} onClick={() => setSimpleColor(c.id)} className={`p-3 rounded-xl border cursor-pointer text-center flex flex-col items-center gap-1 transition-all ${simpleColor === c.id ? 'bg-white border-red-500 shadow-md ring-1 ring-red-500 text-red-600' : 'bg-white border-stone-200 text-stone-500 hover:border-red-300'}`}>
                        <span className="text-xl opacity-80">🐾</span><p className="text-xs font-bold">{c.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Y TẾ */}
              <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-stone-800 uppercase flex items-center gap-2"><span>🏥</span> Sức khỏe & Tiêm phòng</h3>
                  <button onClick={() => setIsMedicalModalOpen(true)} className="text-xs font-bold bg-white text-red-600 px-4 py-2 rounded-xl shadow-sm border border-red-200 hover:bg-red-500 hover:text-white transition-colors cursor-pointer">
                    + Thêm mũi tiêm
                  </button>
                </div>

                {catData.medical_history.length === 0 ? (
                  <div className="text-center p-4 border-2 border-dashed border-red-100 rounded-2xl bg-white/50 text-red-300 text-xs font-bold">
                    Chưa có lịch sử tiêm phòng
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {catData.medical_history.map((record: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-stone-100 shadow-sm hover:border-red-200 transition-colors">
                        <div>
                          <p className="font-bold text-stone-800 text-sm">{record.vaccineName}</p>
                          <p className="text-[11px] text-stone-500 mt-1">
                            Đã tiêm: <span className="font-black text-stone-700">{formatDateDisplay(record.dateGiven)}</span>
                            {record.nextDueDate && <span className="ml-3 text-red-500 bg-red-50 px-2 py-0.5 rounded-md">Nhắc lại: {formatDateDisplay(record.nextDueDate)}</span>}
                          </p>
                        </div>
                        <button onClick={() => removeMedicalRecord(index)} className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8 border-t border-stone-200/50 pt-6">
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Đặc điểm / Ghi chú (Notes)</label>
                  <textarea 
                    value={catData.notes || ''} onChange={(e) => setCatData({...catData, notes: e.target.value})}
                    placeholder="Ghi chú thêm về sức khỏe, thói quen ăn uống, tính cách của bé..." rows={4} 
                    className="w-full bg-white border border-stone-200/80 rounded-2xl px-5 py-4 text-stone-800 text-sm focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all shadow-sm resize-none"
                  ></textarea>
                </div>
              </div>

              {/* GIÁ */}
              <div className="border-t border-stone-200/60 pt-8 mt-4">
                <label className="block text-xs font-black text-red-500 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                  <span className="text-xl">💰</span> Giá niêm yết chuyển nhượng (VNĐ)
                </label>
                <div className="relative group/price">
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-orange-400 rounded-2xl blur opacity-25 group-hover/price:opacity-50 transition duration-500 pointer-events-none"></div>
                  <input 
                    type="number" value={catData.price} onChange={(e) => setCatData({...catData, price: parseInt(e.target.value) || 0})}
                    className="cursor-pointer relative w-full bg-white border-2 border-red-100 rounded-2xl pl-16 pr-6 py-6 text-4xl md:text-5xl text-red-600 font-black focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all shadow-lg placeholder:text-red-200" 
                  />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-red-400 font-black text-3xl select-none pointer-events-none">đ</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* CÂY PHẢ HỆ TONE ĐỎ */}
      {(catData.father_id || catData.mother_id) && (
        <div className="w-full bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 lg:p-12 border border-white/80 shadow-[0_10px_50px_rgba(0,0,0,0.03)] relative overflow-hidden mt-8 z-10">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ef4444 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          <h2 className="text-2xl font-black text-stone-800 mb-8 flex items-center gap-3 relative z-10">
            Cây Phả Hệ Gia Tộc (5 Đời) <span className="text-red-600 text-3xl drop-shadow-md">🌳</span>
          </h2>
          
          <div className="overflow-x-auto custom-scrollbar pb-12 pt-4 border-t border-red-100 mt-4 relative z-10">
             <div className="min-w-max pr-16 pt-6">
                <PedigreeNode catIdNode={parseInt(catId as string)} level={1} label="Mèo Hiện Tại" />
             </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM LỊCH TIÊM */}
      {isMedicalModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsMedicalModalOpen(false)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl"
          >
            <h2 className="text-xl font-black text-stone-800 mb-6 flex items-center gap-2">💉 Thêm mũi tiêm mới</h2>
            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-2">Tên Vaccine / Mũi tiêm</label>
                <input 
                  type="text" placeholder="Ví dụ: Vaccine 4 bệnh, Dại, Tẩy giun..."
                  value={newRecord.vaccineName} onChange={(e) => setNewRecord({...newRecord, vaccineName: e.target.value})} 
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-stone-700 focus:border-red-400 focus:ring-2 focus:ring-red-500/20 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-2">Ngày tiêm</label>
                  <input type="date" value={newRecord.dateGiven} onChange={(e) => setNewRecord({...newRecord, dateGiven: e.target.value})} className="cursor-pointer w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-stone-700 focus:border-red-400 focus:ring-2 focus:ring-red-500/20 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-2">Nhắc lại (Nếu có)</label>
                  <input type="date" value={newRecord.nextDueDate} onChange={(e) => setNewRecord({...newRecord, nextDueDate: e.target.value})} className="cursor-pointer w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold text-stone-700 focus:border-red-400 focus:ring-2 focus:ring-red-500/20 outline-none" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsMedicalModalOpen(false)} className="cursor-pointer px-5 py-2.5 rounded-xl font-bold text-stone-500 hover:bg-stone-100 transition-colors">Hủy</button>
              <button onClick={addMedicalRecord} className="cursor-pointer px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5">Thêm Mũi Tiêm</button>
            </div>
          </motion.div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .animate-blob { animation: blob 10s infinite alternate; }
        @keyframes blob { 
          0% { transform: translate(0px, 0px) scale(1); } 
          33% { transform: translate(40px, -60px) scale(1.1); } 
          66% { transform: translate(-30px, 30px) scale(0.9); } 
          100% { transform: translate(0px, 0px) scale(1); } 
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ef4444; }
      `}} />
    </div>
  );
}