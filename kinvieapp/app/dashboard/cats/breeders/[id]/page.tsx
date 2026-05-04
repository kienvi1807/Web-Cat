"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; 
import { ALL_BREEDS, SIMPLE_COLORS, formatEmsCode, formatDateDisplay } from '@/lib/utils';

export default function BreederCatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const catId = params.id;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null); 

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 
  
  const [catData, setCatData] = useState<any>({
    name: '', breed: 'Maine Coon', color: '', price: 0, status: '', dob: '', images: [], medical_history: [], notes: '', father_id: null, mother_id: null, approval_status: 'Chờ duyệt', breeder_id: null
  });

  const [mainImage, setMainImage] = useState<string>('');
  const [gender, setGender] = useState<boolean>(true); 

  const [dbBaseColors, setDbBaseColors] = useState<any[]>([]);
  const [dbPatterns, setDbPatterns] = useState<any[]>([]);
  const [baseColor, setBaseColor] = useState<string | null>(null);
  const [hasSilver, setHasSilver] = useState(false);
  const [pattern, setPattern] = useState<string | null>(null);
  const [simpleColor, setSimpleColor] = useState<string>('');
  const [isEmsOpen, setIsEmsOpen] = useState<boolean>(false); 

  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({ vaccineName: '', dateGiven: '', nextDueDate: '' });

  const [allCatsList, setAllCatsList] = useState<any[]>([]);
  const [breedersList, setBreedersList] = useState<any[]>([]);
  const [fatherBreederId, setFatherBreederId] = useState('');
  const [motherBreederId, setMotherBreederId] = useState('');
  const [isFatherDropdownOpen, setIsFatherDropdownOpen] = useState(false);
  const [isMotherDropdownOpen, setIsMotherDropdownOpen] = useState(false);

  const getCatImage = (id: number) => {
    const cat = allCatsList.find(c => c.id === id);
    return cat?.images?.[0] || 'https://via.placeholder.com/100?text=No+Img';
  };

  const getBreederDisplayName = (b: any) => {
    if (!b) return 'Chưa rõ';
    if (b.type_id === 1 || b.userid === 1) return 'KinVie Cattery';
    return b.cattery_name || b.fullname || b.full_name || b.name || b.username || b.email || b.phone || `Đối tác #${b.userid}`;
  };

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      
      const { data: colors } = await supabase.from('ems_base_colors').select('*');
      if (colors) setDbBaseColors(colors);
      
      const { data: patterns } = await supabase.from('ems_patterns').select('*');
      if (patterns) setDbPatterns(patterns);

      const { data: breeders } = await supabase.from('users').select('*').in('type_id', [1, 3]);
      if (breeders) setBreedersList(breeders);

      const { data: allCats } = await supabase.from('cats').select('id, name, gender, images, color, breeder_id, father_id, mother_id');
      if (allCats) setAllCatsList(allCats);

      if (catId) {
        const { data, error } = await supabase.from('cats').select(`*, users (*)`).eq('id', catId).maybeSingle();
        if (data) {
          let loadedImages = data.images || [];
          while (loadedImages.length < 5) loadedImages.push(''); 
          setCatData({ ...data, images: loadedImages, medical_history: data.medical_history || [], notes: data.notes || '', approval_status: data.approval_status || 'Chờ duyệt', breeder_id: data.breeder_id, users: data.users });
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

  // 🎯 LƯU THAY ĐỔI INFO
  const handleUpdateCat = async () => {
    setIsSaving(true);
    const cleanImages = catData.images.filter((img: string) => img !== '');
    const finalColor = isPurebred ? (generatedEmsCode || catData.color) : (simpleColor || catData.color);

    const { error } = await supabase
      .from('cats')
      .update({
        name: catData.name,
        breed: catData.breed,
        gender: gender, 
        color: finalColor,
        price: catData.price,
        status: catData.status,
        dob: catData.dob,
        images: cleanImages,
        medical_history: catData.medical_history, 
        notes: catData.notes,
        father_id: catData.father_id || null,
        mother_id: catData.mother_id || null
      })
      .eq('id', catId);

    setIsSaving(false);
    if (!error) {
      alert("Đã cập nhật hồ sơ bé mèo thành công! 🚀");
    } else {
      alert("Có lỗi xảy ra: " + error.message);
    }
  };

  // 🎯 XÓA MÈO
  const handleDeleteCat = async () => {
    if (window.confirm("Sếp có chắc chắn muốn XÓA VĨNH VIỄN hồ sơ bé mèo này không? Thao tác này không thể khôi phục!")) {
      setIsSaving(true);
      await supabase.from('cats').update({ father_id: null }).eq('father_id', catId);
      await supabase.from('cats').update({ mother_id: null }).eq('mother_id', catId);
      const { error } = await supabase.from('cats').delete().eq('id', catId);
      if (!error) {
        alert("Đã xóa hồ sơ thành công!");
        router.push('/dashboard/cats/breeders');
      } else {
        alert("Lỗi khi xóa hồ sơ: " + error.message);
        setIsSaving(false);
      }
    }
  };

  // 🎯 DUYỆT / TỪ CHỐI
  const handleApprove = async () => {
    if (!window.confirm(`Duyệt hiển thị bé mèo ${catData.name} lên cửa hàng?`)) return;
    setIsSaving(true);

    // Cập nhật cùng lúc Approval và Status
    const { error } = await supabase.from('cats').update({ 
      approval_status: 'Đã duyệt',
      status: 'Sẵn sàng' // Tự động chuyển trạng thái
    }).eq('id', catId);

    if (!error) {
      alert('Đã phê duyệt thành công!');
      // Update state để giao diện nhảy tab Trạng thái ngay lập tức
      setCatData({...catData, approval_status: 'Đã duyệt', status: 'Sẵn sàng'});
      await supabase.from('notifications').insert([{ user_id: catData.breeder_id, title: 'Mèo đã được duyệt', content: `Hồ sơ bé mèo ${catData.name} của trại bạn đã được kiểm duyệt và hiển thị lên cửa hàng.` }]);
    } else {
      alert('Lỗi phê duyệt: ' + error.message);
    }
    setIsSaving(false);
  };

  const handleReject = async () => {
    const reason = window.prompt(`Nhập lý do từ chối bé mèo ${catData.name} để gửi cho Đối tác:`);
    if (reason === null) return; 
    setIsSaving(true);
    const { error } = await supabase.from('cats').update({ approval_status: 'Từ chối' }).eq('id', catId);
    if (!error) {
      alert('Đã từ chối và gửi thông báo cho Đối tác!');
      setCatData({...catData, approval_status: 'Từ chối'});
      await supabase.from('notifications').insert([{ user_id: catData.breeder_id, title: 'Hồ sơ mèo bị từ chối', content: `Đơn xin duyệt của bé mèo ${catData.name} đã bị từ chối. Lý do: ${reason || 'Không đáp ứng đủ tiêu chuẩn hệ thống.'}` }]);
    } else {
      alert('Lỗi từ chối: ' + error.message);
    }
    setIsSaving(false);
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

  // 🎯 LOGIC CHỐNG PHỐI CẬN HUYẾT VÀ VÒNG LẶP
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
  if (catData.mother_id) excludedForFather.push(catData.mother_id, ...getAncestors(catData.mother_id, allCatsList), ...getDescendants(catData.mother_id, allCatsList));

  let excludedForMother = [...baseExcluded];
  if (catData.father_id) excludedForMother.push(catData.father_id, ...getAncestors(catData.father_id, allCatsList), ...getDescendants(catData.father_id, allCatsList));

  // 🎯 COMPONENT ĐỆ QUY VẼ CÂY PHẢ HỆ
  const PedigreeNode = ({ catIdNode, level, label }: { catIdNode: number | null, level: number, label: string }) => {
    if (!catIdNode || level > 5) return null;
    const cat = allCatsList.find(c => c.id === parseInt(catIdNode.toString()));
    if (!cat) return null;

    const hasFather = !!cat.father_id;
    const hasMother = !!cat.mother_id;
    const hasParents = level < 5 && (hasFather || hasMother);

    const isCurrent = level === 1;
    const borderClass = isCurrent ? 'border-orange-400 ring-4 ring-orange-50' : cat.gender ? 'border-orange-200 hover:border-orange-400' : 'border-rose-200 hover:border-rose-400';
    const textThemeClass = isCurrent ? 'text-orange-500' : cat.gender ? 'text-blue-500' : 'text-rose-500';
    const glowClass = isCurrent ? 'shadow-[0_0_15px_rgba(249,115,22,0.2)]' : cat.gender ? 'hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]';

    return (
      <div className="flex items-center group/node animate-fade-in">
        {level > 1 && <div className="w-10 h-[2px] bg-stone-300 rounded-full transition-colors group-hover/node:bg-stone-400"></div>}
        
        {/* Nút bấm nhảy trang thông minh (Boss thì về kinvie, Đối tác thì về breeders) */}
        <Link href={`/dashboard/cats/${cat.breeder_id === 1 ? 'kinvie' : 'breeders'}/${cat.id}`} className={`w-64 p-3 rounded-2xl border bg-white flex items-center gap-3 relative z-10 transition-all duration-300 hover:-translate-y-1 cursor-pointer ${borderClass} ${glowClass}`}>
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 relative">
             <img src={cat.images?.[0] || 'https://via.placeholder.com/100?text=No+Img'} className="w-full h-full object-cover" alt="cat" />
             <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-xl"></div>
          </div>
          <div className="overflow-hidden flex-1">
             <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${textThemeClass}`}>{label}</p>
             <p className="text-sm font-bold text-stone-800 truncate group-hover/node:text-orange-600 transition-colors">{cat.name}</p>
             <p className="text-[10px] text-stone-500 truncate">{formatEmsCode(cat.color)}</p>
          </div>
        </Link>

        {hasParents && (
          <div className="flex items-center">
            <div className="w-8 h-[2px] bg-stone-300 rounded-full transition-colors group-hover/node:bg-stone-400"></div>
            <div className="flex flex-col justify-center gap-6 border-l-2 border-stone-300 py-4 my-2 transition-colors group-hover/node:border-stone-400 relative">
               {hasFather && <div className="flex items-center relative -left-[2px]"><PedigreeNode catIdNode={cat.father_id} level={level+1} label={`Đời ${level+1} (Bố)`} /></div>}
               {hasMother && <div className="flex items-center relative -left-[2px]"><PedigreeNode catIdNode={cat.mother_id} level={level+1} label={`Đời ${level+1} (Mẹ)`} /></div>}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-orange-500 animate-pulse">
      <span className="text-6xl mb-4">⚖️</span>
      <h2 className="text-2xl font-black font-sans">Đang tải hồ sơ kiểm duyệt...</h2>
    </div>
  );

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto pb-24 relative">
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 backdrop-blur-md bg-white/40 p-6 rounded-[2rem] border border-white/60 shadow-sm sticky top-4 z-50">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <Link href="/dashboard/cats/breeders" className="cursor-pointer w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm text-stone-500 hover:text-orange-500 hover:shadow-blue-500/20 transition-all font-bold text-xl hover:-translate-x-1">←</Link>
          <div>
            <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-1 flex items-center gap-2">
              HỒ SƠ ĐỐI TÁC 
              <span className={`px-2 py-0.5 rounded-md text-[9px] text-white ${catData.approval_status === 'Đã duyệt' ? 'bg-emerald-500' : catData.approval_status === 'Từ chối' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}`}>{catData.approval_status}</span>
            </p>
            <h1 className="text-3xl font-sans font-black text-stone-800 flex items-center gap-3">
              {catData.name || 'Mèo Vô Danh'}
              <span className="text-sm font-bold text-stone-500 px-3 py-1 bg-white rounded-lg border border-stone-200">🏠 {getBreederDisplayName(catData.users)}</span>
            </h1>
          </div>
        </div>

        {/* 🎯 BỘ 4 NÚT QUYỀN LỰC CỦA ADMIN */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button onClick={handleDeleteCat} disabled={isSaving || isUploading} className="cursor-pointer px-5 py-2.5 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors disabled:opacity-50">
            Xóa Vĩnh Viễn
          </button>
          
          {(catData.approval_status === 'Chờ duyệt' || !catData.approval_status || catData.approval_status === 'Đã duyệt') && (
             <button onClick={handleReject} disabled={isSaving || isUploading} className="cursor-pointer px-5 py-2.5 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-500 hover:text-white transition-colors shadow-sm disabled:opacity-50 border border-rose-100">
               ✕ Từ chối
             </button>
          )}

          {(catData.approval_status === 'Chờ duyệt' || !catData.approval_status || catData.approval_status === 'Từ chối') && (
             <button onClick={handleApprove} disabled={isSaving || isUploading} className="cursor-pointer px-6 py-2.5 rounded-xl text-sm font-black text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/30 hover:-translate-y-0.5 disabled:opacity-50">
               ✓ Phê duyệt
             </button>
          )}

          <div className="w-px h-8 bg-stone-300 mx-1 hidden md:block"></div>

          <button 
            onClick={handleUpdateCat} 
            disabled={isSaving || isUploading} 
            className="cursor-pointer bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black px-8 py-3 rounded-xl shadow-[0_4px_20px_rgba(249,115,22,0.4)] hover:shadow-[0_4px_30px_rgba(249,115,22,0.6)] transition-all transform hover:-translate-y-1 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi 🚀'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 relative z-10">
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
                <div key={idx} onClick={() => handleImageClick(idx)} className="cursor-pointer relative aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-sm hover:border-orange-300 transition-all duration-300 group">
                  {isUploading && uploadingSlot === idx && <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-white z-20"><span className="animate-spin">🐾</span></div>}
                  {imgUrl ? <><img src={imgUrl} className="w-full h-full object-cover group-hover:brightness-50 transition-all" alt={`Thumb ${idx}`} /><div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white font-bold text-sm z-10 transition-opacity">Đổi</div></> : <div className="w-full h-full bg-stone-100 flex flex-col items-center justify-center text-stone-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors"><span className="text-xl mb-1">+</span></div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full lg:w-7/12">
          <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 lg:p-12 border border-white/80 shadow-[0_10px_50px_rgba(0,0,0,0.03)] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <h2 className="text-2xl font-black text-stone-800 mb-8 flex items-center gap-3">Thông tin chi tiết <span className="text-orange-500">❖</span></h2>

            <div className="space-y-8 relative z-10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Tên gọi / Mã bầy</label>
                  <input type="text" value={catData.name} onChange={(e) => setCatData({...catData, name: e.target.value})} className="w-full bg-white/70 backdrop-blur-sm border border-stone-200/80 rounded-2xl px-6 py-4 text-stone-800 font-bold text-lg focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Giới tính</label>
                  <div className="flex bg-white/70 backdrop-blur-sm border border-stone-200/80 rounded-2xl overflow-hidden p-1 shadow-sm h-[60px]">
                    <button type="button" onClick={() => setGender(true)} className={`cursor-pointer flex-1 text-sm font-black rounded-xl transition-all ${gender ? 'bg-blue-500 text-white shadow-md transform scale-[1.02]' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}>♂ Đực</button>
                    <button type="button" onClick={() => setGender(false)} className={`cursor-pointer flex-1 text-sm font-black rounded-xl transition-all ${!gender ? 'bg-rose-500 text-white shadow-md transform scale-[1.02]' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}>♀ Cái</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Giống mèo</label>
                  <select value={catData.breed} onChange={(e) => setCatData({...catData, breed: e.target.value})} className="cursor-pointer w-full bg-white/70 backdrop-blur-sm border border-stone-200/80 rounded-2xl px-6 py-4 text-stone-800 font-bold text-lg focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm appearance-none">
                    {ALL_BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-stone-500 uppercase tracking-widest mb-3 ml-1">Ngày sinh (DOB)</label>
                  <input type="date" value={catData.dob || ''} onChange={(e) => setCatData({...catData, dob: e.target.value})} className="cursor-pointer w-full bg-white/70 backdrop-blur-sm border border-stone-200/80 rounded-2xl px-6 py-4 text-stone-800 font-bold text-lg focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm" />
                </div>
              </div>

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
                        onClick={() => setCatData({...catData, status: item.label})}
                        className={`cursor-pointer px-5 py-3 rounded-[14px] text-[14px] font-bold transition-all duration-300 border flex items-center gap-2 ${
                          isSelected ? `${activeColor} shadow-md transform scale-[1.02]` : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
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

              {/* KHỐI CHỌN BỐ MẸ QUYỀN ADMIN (CHỌN TỪ TOÀN BỘ HỆ THỐNG) */}
              {isPurebred && (
                <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100 shadow-sm mt-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-orange-900 uppercase flex items-center gap-2"><span>🌳</span> Gán Phả Hệ (Quyền Admin)</h3>
                  </div>
                  
                  {/* BỐ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] font-black text-blue-500 uppercase mb-2">Trại của Mèo Bố</label>
                      <select value={fatherBreederId} onChange={(e) => { setFatherBreederId(e.target.value); setCatData({...catData, father_id: null}); }} className="w-full bg-white border border-blue-200 px-4 py-3 rounded-xl text-sm font-bold shadow-sm outline-none appearance-none cursor-pointer">
                        <option value="">-- Chọn Trại giống --</option>
                        {breedersList.map(b => <option key={b.userid} value={b.userid}>{getBreederDisplayName(b)}</option>)}
                      </select>
                    </div>
                    
                    <div className="relative">
                      <label className="block text-[10px] font-black text-blue-500 uppercase mb-2">Mèo Bố</label>
                      <button 
                        type="button" 
                        disabled={!fatherBreederId}
                        onClick={() => { setIsFatherDropdownOpen(!isFatherDropdownOpen); setIsMotherDropdownOpen(false); }}
                        className="w-full bg-white border border-blue-200 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm outline-none flex items-center justify-between disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed cursor-pointer h-[46px]"
                      >
                        {catData.father_id ? (
                          <div className="flex items-center gap-3">
                             <img src={getCatImage(catData.father_id)} className="w-6 h-6 rounded-md object-cover border border-stone-200" alt="father" />
                             <span>{allCatsList.find(c => c.id === catData.father_id)?.name}</span>
                          </div>
                        ) : (
                          <span className="text-stone-400">-- Chọn Mèo Bố --</span>
                        )}
                        <span className="text-[10px] text-stone-400">▼</span>
                      </button>

                      {isFatherDropdownOpen && !!fatherBreederId && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-blue-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
                          <div 
                            onClick={() => { setCatData({...catData, father_id: null}); setIsFatherDropdownOpen(false); }}
                            className="p-3 hover:bg-orange-50 cursor-pointer text-sm text-stone-500 font-bold border-b border-stone-100"
                          >
                            -- Bỏ chọn / Không rõ --
                          </div>
                          {allCatsList
                            .filter(c => c.gender !== false && !excludedForFather.includes(c.id) && (c.breeder_id?.toString() === fatherBreederId || c.id === catData.father_id))
                            .map(c => (
                              <div 
                                key={c.id} 
                                onClick={() => { setCatData({...catData, father_id: c.id}); setIsFatherDropdownOpen(false); }}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-rose-400 uppercase mb-2">Trại của Mèo Mẹ</label>
                      <select 
                        value={motherBreederId} 
                        onChange={(e) => { setMotherBreederId(e.target.value); setCatData({...catData, mother_id: null}); }} 
                        className="cursor-pointer w-full bg-white border border-rose-200 px-4 py-3 rounded-xl text-sm font-bold shadow-sm outline-none appearance-none"
                      >
                        <option value="">-- Chọn Trại giống --</option>
                        {breedersList.map(b => <option key={b.userid} value={b.userid}>{getBreederDisplayName(b)}</option>)}
                      </select>
                    </div>
                    
                    <div className="relative">
                      <label className="block text-[10px] font-black text-rose-400 uppercase mb-2">Mèo Mẹ</label>
                      <button 
                        type="button" 
                        disabled={!motherBreederId}
                        onClick={() => { setIsMotherDropdownOpen(!isMotherDropdownOpen); setIsFatherDropdownOpen(false); }}
                        className="w-full bg-white border border-rose-200 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm outline-none flex items-center justify-between disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed cursor-pointer h-[46px]"
                      >
                        {catData.mother_id ? (
                          <div className="flex items-center gap-3">
                             <img src={getCatImage(catData.mother_id)} className="w-6 h-6 rounded-md object-cover border border-stone-200" alt="mother" />
                             <span>{allCatsList.find(c => c.id === catData.mother_id)?.name}</span>
                          </div>
                        ) : (
                          <span className="text-stone-400">-- Chọn Mèo Mẹ --</span>
                        )}
                        <span className="text-[10px] text-stone-400">▼</span>
                      </button>

                      {isMotherDropdownOpen && !!motherBreederId && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-rose-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
                          <div 
                            onClick={() => { setCatData({...catData, mother_id: null}); setIsMotherDropdownOpen(false); }}
                            className="p-3 hover:bg-rose-50 cursor-pointer text-sm text-stone-500 font-bold border-b border-stone-100"
                          >
                            -- Bỏ chọn / Không rõ --
                          </div>
                          {allCatsList
                            .filter(c => c.gender === false && !excludedForMother.includes(c.id) && (c.breeder_id?.toString() === motherBreederId || c.id === catData.mother_id))
                            .map(c => (
                              <div 
                                key={c.id} 
                                onClick={() => { setCatData({...catData, mother_id: c.id}); setIsMotherDropdownOpen(false); }}
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
                </div>
              )}

              {/* 🎯 BẢNG CHỌN MÀU EMS */}
              {isPurebred ? (
                <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100 shadow-sm mt-8 transition-all duration-300">
                   <div className="flex items-center justify-between cursor-pointer group" onClick={() => setIsEmsOpen(!isEmsOpen)}>
                     <h3 className="text-sm font-bold text-stone-800 uppercase flex items-center gap-2 group-hover:text-orange-600 transition-colors">
                       <span>🎨</span> Cập nhật Màu lông (Hệ EMS)
                       <span className={`text-stone-400 transition-transform duration-300 ${isEmsOpen ? 'rotate-180' : ''}`}>▼</span>
                     </h3>
                     <div className="text-right">
                       <p className="text-[10px] text-stone-500 uppercase font-bold">Mã của mèo</p>
                       <p className="text-lg font-black text-orange-600 bg-white px-3 py-1 rounded-lg border border-orange-200 shadow-sm">{generatedEmsCode || catData.color || '???'}</p>
                     </div>
                   </div>
                   
                   {isEmsOpen && dbBaseColors.length > 0 && (
                     <div className="mt-6 border-t border-orange-200/50 pt-6 animate-fade-in">
                       <div className="mb-6">
                         <p className="text-xs font-bold text-stone-500 mb-2">1. Màu cơ bản (Base Color)</p>
                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                           {dbBaseColors.map(c => (
                             <div key={c.code} onClick={() => setBaseColor(baseColor === c.code ? null : c.code)} className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${baseColor === c.code ? 'bg-white border-orange-500 shadow-sm ring-1 ring-blue-500' : 'bg-white border-stone-200 hover:border-blue-300'}`}>
                                <div style={{ backgroundColor: c.hex }} className="w-5 h-5 rounded-md border border-stone-200 shrink-0"></div>
                                <div className="overflow-hidden"><p className="text-xs font-bold text-stone-800 uppercase">{c.code}</p><p className="text-[9px] text-stone-500 truncate">{c.name}</p></div>
                             </div>
                           ))}
                         </div>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div className="sm:col-span-1">
                            <p className="text-xs font-bold text-stone-500 mb-2">2. Ánh bạc</p>
                            <div onClick={() => setHasSilver(!hasSilver)} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${hasSilver ? 'bg-white border-orange-500 shadow-sm ring-1 ring-orange-500' : 'bg-white border-stone-200 hover:border-blue-300'}`}>
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
                                <div key={p.code} onClick={() => setPattern(pattern === p.code ? null : p.code)} className={`p-2 rounded-xl border cursor-pointer text-center transition-all ${pattern === p.code ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500' : 'bg-white border-stone-200 hover:border-blue-300'}`}>
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
                    value={catData.notes || ''} onChange={(e) => setCatData({...catData, notes: e.target.value})}
                    placeholder="Ghi chú thêm về sức khỏe, thói quen ăn uống, tính cách của bé..." rows={4} 
                    className="w-full bg-white border border-stone-200/80 rounded-2xl px-5 py-4 text-stone-800 text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="border-t border-stone-200/60 pt-8 mt-4">
                <label className="block text-xs font-black text-orange-500 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                  <span className="text-xl">💰</span> Giá niêm yết chuyển nhượng (VNĐ)
                </label>
                <div className="relative group/price">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur opacity-25 group-hover/price:opacity-50 transition duration-500 pointer-events-none"></div>
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

      {/* 🌳 KHỐI HIỂN THỊ CÂY PHẢ HỆ (CHỈ HIỆN KHI CÓ BỐ/MẸ VÀ CÓ THỂ CLICK) */}
      {(catData.father_id || catData.mother_id) && (
        <div className="w-full bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 lg:p-12 border border-white/80 shadow-[0_10px_50px_rgba(0,0,0,0.03)] relative overflow-hidden mt-8 z-10">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          <h2 className="text-2xl font-black text-stone-800 mb-8 flex items-center gap-3 relative z-10">
            Cây Phả Hệ Gia Tộc (5 Đời) <span className="text-green-600 text-3xl drop-shadow-md">🌳</span>
          </h2>
          
          <div className="overflow-x-auto custom-scrollbar pb-12 pt-4 border-t border-stone-200/60 mt-4 relative z-10">
             <div className="min-w-max pr-16 pt-6">
                <PedigreeNode catIdNode={parseInt(catId as string)} level={1} label="Mèo Hiện Tại" />
             </div>
          </div>
        </div>
      )}

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