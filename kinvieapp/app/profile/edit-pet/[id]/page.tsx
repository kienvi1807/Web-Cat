"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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

const ALL_BREEDS = [
  'Maine Coon', 'Anh lông ngắn (ALN)', 'Anh lông dài (ALD)',
  'Ba Tư', 'Sphynx', 'Mèo Ta', 'Giống lai khác', 'Chưa rõ'
];

const PET_STATUS_OPTIONS = [
  { value: 'Khỏe mạnh', label: 'Đang ở nhà', emoji: '🏠', color: 'emerald' },
  { value: 'Đang mất tích', label: 'Đang mất tích', emoji: '📢', color: 'amber' },
  { value: 'Đã lên thiên đường mèo', label: 'Đã lên thiên đường mèo', emoji: '🌈', color: 'stone' },
];

export default function EditPetPage() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [ownerId, setOwnerId] = useState<number | null>(null);

  const [dbBaseColors, setDbBaseColors] = useState<any[]>([]);
  const [dbPatterns, setDbPatterns] = useState<any[]>([]);

  const [sireOptions, setSireOptions] = useState<any[]>([]);
  const [damOptions, setDamOptions] = useState<any[]>([]);

  const [petname, setPetname] = useState('');
  const [breed, setBreed] = useState('Maine Coon');
  const [gender, setGender] = useState(true);
  const [description, setDescription] = useState('');

  const [mix1, setMix1] = useState('Anh lông ngắn (ALN)');
  const [mix2, setMix2] = useState('Mèo Ta');

  const [birthdate, setBirthdate] = useState('');
  const [hasPedigree, setHasPedigree] = useState(false);

  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [neutered, setNeutered] = useState(false);

  const [status, setStatus] = useState('Khỏe mạnh');

  const [baseColor, setBaseColor] = useState<string | null>(null);
  const [hasSilver, setHasSilver] = useState(false);
  const [pattern, setPattern] = useState<string | null>(null);
  const [simpleColor, setSimpleColor] = useState<string>('');

  const [fatherId, setFatherId] = useState('');
  const [motherId, setMotherId] = useState('');

  // 🎯 QUẢN LÝ ĐÓNG MỞ CÁC DROPDOWN & BẢNG
  const [isBreedDropdownOpen, setIsBreedDropdownOpen] = useState(false);
  const [isFatherDropdownOpen, setIsFatherDropdownOpen] = useState(false);
  const [isMotherDropdownOpen, setIsMotherDropdownOpen] = useState(false);

  // 🎯 STATE MỚI CHO BẢNG MÀU (Đóng/Mở cả cụm)
  const [isEmsBoardOpen, setIsEmsBoardOpen] = useState(false);
  const [isSimpleColorBoardOpen, setIsSimpleColorBoardOpen] = useState(false);

  const formatDateForInput = (dbDate: string | null) => {
    if (!dbDate) return '';
    const [y, m, d] = dbDate.split('-');
    return `${d}/${m}/${y}`;
  };

  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: dbUser } = await supabase.from('users').select('userid, type_id').eq('email', user.email).single();

      if (dbUser) {
        setOwnerId(dbUser.userid);

        const isBoss = dbUser.type_id === 1;
        let availableSires: any[] = [];
        let availableDams: any[] = [];

        if (isBoss) {
          const { data: catteryCats } = await supabase.from('cats').select('id, name, gender, images');
          const { data: allPets } = await supabase.from('pets').select('petid, petname, gender, imageurl').neq('petid', id);

          const formatCat = (c: any) => ({ id: `cat_${c.id}`, name: c.name, image: c.images?.[0] || null, type: 'Trại KinVie' });
          const formatPet = (p: any) => ({ id: `pet_${p.petid}`, name: p.petname, image: p.imageurl || null, type: 'Khách Hàng' });

          availableSires = [
            ...(catteryCats?.filter(c => c.gender === 'Male').map(formatCat) || []),
            ...(allPets?.filter(p => p.gender === true).map(formatPet) || [])
          ];
          availableDams = [
            ...(catteryCats?.filter(c => c.gender === 'Female').map(formatCat) || []),
            ...(allPets?.filter(p => p.gender === false).map(formatPet) || [])
          ];
        } else {
          const { data: myPets } = await supabase.from('pets').select('petid, petname, gender, imageurl').eq('ownerid', dbUser.userid).neq('petid', id);
          const formatMyPet = (p: any) => ({ id: `pet_${p.petid}`, name: p.petname, image: p.imageurl || null, type: 'Boss của bạn' });

          availableSires = myPets?.filter(p => p.gender === true).map(formatMyPet) || [];
          availableDams = myPets?.filter(p => p.gender === false).map(formatMyPet) || [];
        }

        setSireOptions(availableSires);
        setDamOptions(availableDams);
      }

      const { data: colors } = await supabase.from('ems_base_colors').select('*');
      if (colors) setDbBaseColors(colors);
      const { data: patterns } = await supabase.from('ems_patterns').select('*');
      if (patterns) setDbPatterns(patterns);

      if (id) {
        const { data: petData, error } = await supabase.from('pets').select('*').eq('petid', id).single();
        if (petData) {
          setPetname(petData.petname || '');
          setGender(petData.gender);
          setDescription(petData.description || '');
          setHasPedigree(petData.has_pedigree || false);
          setNeutered(petData.neutered || false);
          setStatus(petData.status || 'Khỏe mạnh');
          setBirthdate(formatDateForInput(petData.birthdate));

          if (petData.breed && petData.breed.startsWith('Lai: ')) {
            setBreed('Giống lai khác');
            const mixParts = petData.breed.replace('Lai: ', '').split(' x ');
            if (mixParts.length === 2) {
              setMix1(mixParts[0]);
              setMix2(mixParts[1]);
            }
          } else {
            setBreed(petData.breed || 'Maine Coon');
          }

          setBaseColor(petData.ems_base_code);
          setHasSilver(petData.ems_silver || false);
          setPattern(petData.ems_pattern_code);
          setSimpleColor(petData.simple_color || '');
          setExistingImageUrl(petData.imageurl || '');
          setImagePreviewUrl(petData.imageurl || '');

          if (petData.sire_id) setFatherId(petData.sire_id.toString());
          if (petData.dam_id) setMotherId(petData.dam_id.toString());
        } else {
          router.push('/profile');
        }
      }
      setIsLoading(false);
    };
    initData();
  }, [id, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDateInput = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length >= 5) { setter(`${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`); }
    else if (val.length >= 3) { setter(`${val.slice(0, 2)}/${val.slice(2)}`); }
    else { setter(val); }
  };

  const handleNativeDateChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [y, m, d] = e.target.value.split('-');
      setter(`${d}/${m}/${y}`);
    }
  };

  const formatDBDate = (dateStr: string) => {
    if (dateStr.length < 10) return null;
    const [dd, mm, yyyy] = dateStr.split('/');
    return `${yyyy}-${mm}-${dd}`;
  };

  const purebredList = ['Maine Coon', 'Anh lông ngắn (ALN)', 'Anh lông dài (ALD)', 'Ba Tư', 'Sphynx'];
  const isPurebred = purebredList.includes(breed);
  const isMixed = breed === 'Giống lai khác';

  const generatedEmsCode = `${baseColor || ''}${hasSilver && baseColor ? 's' : ''}${pattern || ''}`;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petname) { alert("Sen ơi nhập tên cho Boss đi nào!"); return; }
    if (!ownerId) return;

    setIsSaving(true);
    let finalImageUrl = existingImageUrl;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${ownerId}-update-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('pet-images').upload(fileName, imageFile);
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('pet-images').getPublicUrl(fileName);
        finalImageUrl = publicUrlData.publicUrl;
      }
    }

    const finalBreed = isMixed ? `Lai: ${mix1} x ${mix2}` : breed;

    const { error } = await supabase
      .from('pets')
      .update({
        petname: petname.trim(),
        breed: finalBreed,
        gender: gender,
        birthdate: formatDBDate(birthdate),
        has_pedigree: isPurebred ? hasPedigree : false,
        ems_base_code: isPurebred ? baseColor : null,
        ems_silver: isPurebred ? hasSilver : false,
        ems_pattern_code: isPurebred ? pattern : null,
        simple_color: !isPurebred ? simpleColor : null,
        neutered: neutered,
        description: description,
        status: status,
        imageurl: finalImageUrl,
        father_id: fatherId || null,
        mother_id: motherId || null
      })
      .eq('petid', id);

    setIsSaving(false);

    if (error) {
      alert("Lỗi cập nhật: " + error.message);
    } else {
      alert("Cập nhật hồ sơ Boss thành công!");
      router.push(`/pet/${id}`);
    }
  };

  const selectedSire = sireOptions.find(opt => opt.id === fatherId);
  const selectedDam = damOptions.find(opt => opt.id === motherId);
  const selectedSimpleColor = SIMPLE_COLORS.find(c => c.id === simpleColor);

  const defaultCatAvatar = 'https://ui-avatars.com/api/?name=Cat&background=f3f4f6&color=a8a29e';

  if (isLoading) {
    return <div className="min-h-screen pt-32 text-center text-stone-400 font-bold">Đang tải hồ sơ Boss... 🐾</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-700">
      <Header />
      <main className="pt-32 pb-20 container mx-auto px-4 relative z-10 max-w-3xl">
        <Link href={`/pet/${id}`} className="inline-flex items-center gap-2 text-sm font-bold text-stone-400 hover:text-pink-500 transition-colors mb-6">
          <span>❮</span> Hủy & Quay lại
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-visible p-8 sm:p-12 relative">
          <form onSubmit={handleUpdate} className="space-y-8">

            <div className="text-center mb-8 relative">
              <div onClick={() => fileInputRef.current?.click()} className="w-32 h-32 bg-pink-100 rounded-full flex flex-col items-center justify-center text-sm mx-auto mb-4 shadow-inner border-4 border-white cursor-pointer hover:bg-pink-200 transition-all overflow-hidden relative group">
                {imagePreviewUrl ? (
                  <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <>
                    <span className="text-4xl text-pink-300 mb-1 group-hover:scale-110 transition-transform">📷</span>
                    <span className="text-pink-600 font-bold text-[10px] uppercase tracking-wide">Đổi Ảnh</span>
                  </>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Cập nhật ảnh</div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              <h1 className="text-3xl font-sans font-bold text-stone-800 mb-2">Chỉnh Sửa Hồ Sơ</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Tên của Boss <span className="text-rose-500">*</span></label>
                <input type="text" value={petname} onChange={(e) => setPetname(e.target.value)} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400" />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Ngày sinh</label>
                <div className="relative">
                  <input type="text" value={birthdate} onChange={handleDateInput(setBirthdate)} placeholder="dd/mm/yyyy" className="w-full bg-stone-50 border border-stone-200 pl-4 pr-10 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 font-medium tracking-wide" />
                  <input type="date" onChange={handleNativeDateChange(setBirthdate)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 cursor-pointer w-7 h-full z-10" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-lg">📅</span>
                </div>
              </div>

              <div className="relative z-40">
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Giống mèo</label>
                <div onClick={() => setIsBreedDropdownOpen(!isBreedDropdownOpen)} className="w-full bg-stone-50 border border-stone-200 px-4 py-3.5 rounded-xl text-sm transition-all font-bold text-stone-700 cursor-pointer hover:border-pink-300 shadow-sm flex items-center justify-between">
                  <span>{breed}</span>
                  <span className="text-[10px] text-stone-400">▼</span>
                </div>
                {isBreedDropdownOpen && (
                  <div className="absolute top-[75px] left-0 w-full bg-white border border-pink-200 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto p-2">
                    <div className="text-[10px] font-black text-stone-400 uppercase px-3 py-2">🌟 Mèo Thuần Chủng (Tây)</div>
                    {['Maine Coon', 'Anh lông ngắn (ALN)', 'Anh lông dài (ALD)', 'Ba Tư', 'Sphynx'].map(b => (
                      <div key={b} onClick={() => { setBreed(b); setIsBreedDropdownOpen(false); }} className="px-4 py-3 hover:bg-pink-50 hover:text-pink-600 rounded-xl cursor-pointer text-sm font-bold text-stone-700 transition-colors">{b}</div>
                    ))}
                    <div className="text-[10px] font-black text-stone-400 uppercase px-3 py-2 mt-2 border-t border-stone-100">🐈 Mèo Dân Dã (Ta / Lai)</div>
                    {['Mèo Ta', 'Giống lai khác', 'Chưa rõ'].map(b => (
                      <div key={b} onClick={() => { setBreed(b); setIsBreedDropdownOpen(false); }} className="px-4 py-3 hover:bg-pink-50 hover:text-pink-600 rounded-xl cursor-pointer text-sm font-bold text-stone-700 transition-colors">{b}</div>
                    ))}
                  </div>
                )}

                {isMixed && (
                  <div className="mt-3 p-3 bg-pink-50/50 rounded-xl border border-pink-100 flex items-center gap-2">
                    <select value={mix1} onChange={(e) => setMix1(e.target.value)} className="w-full bg-white border border-stone-200 px-3 py-2.5 rounded-lg text-xs font-bold text-stone-700 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10 transition-all cursor-pointer hover:border-pink-300 shadow-sm">
                      {ALL_BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <span className="text-pink-400 font-black text-xs">X</span>
                    <select value={mix2} onChange={(e) => setMix2(e.target.value)} className="w-full bg-white border border-stone-200 px-3 py-2.5 rounded-lg text-xs font-bold text-stone-700 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10 transition-all cursor-pointer hover:border-pink-300 shadow-sm">
                      {ALL_BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Giới tính</label>
                <div className="flex bg-stone-50 border border-stone-200 rounded-xl overflow-hidden p-1">
                  <button type="button" onClick={() => setGender(true)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${gender ? 'bg-white text-blue-500 shadow-sm' : 'text-stone-400'}`}>♂ Đực</button>
                  <button type="button" onClick={() => setGender(false)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${!gender ? 'bg-white text-pink-500 shadow-sm' : 'text-stone-400'}`}>♀ Cái</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Tình trạng hiện tại</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PET_STATUS_OPTIONS.map((opt) => {
                    const isSelected = status === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => setStatus(opt.value)}
                        className={`flex flex-col items-center justify-center gap-1.5 px-2 py-4 rounded-xl border transition-all text-center min-h-[88px] ${isSelected
                          ? opt.value === 'Đã lên thiên đường mèo'
                            ? 'bg-stone-700 text-white border-stone-700'
                            : opt.value === 'Đang mất tích'
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-white text-stone-500 border-stone-200 hover:border-pink-300'
                          }`}
                      >
                        <span className="text-xl leading-none">{opt.emoji}</span>
                        <span className="text-[11px] font-bold leading-tight">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
                {status === 'Đã lên thiên đường mèo' && (
                  <p className="mt-2 text-xs text-stone-400 italic">Ảnh của Boss sẽ được đặt trong vòng hoa tưởng nhớ ở trang quản lý.</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100 mt-6 relative z-30">
              <h3 className="text-sm font-bold text-stone-800 uppercase mb-4 flex items-center gap-2"><span>🧬</span> Thông tin phả hệ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="relative">
                  <label className="block text-[10px] font-bold text-blue-500 uppercase mb-1">Mèo Bố (Sire)</label>
                  <div onClick={() => setIsFatherDropdownOpen(!isFatherDropdownOpen)} className="w-full bg-white border border-blue-200 p-2.5 rounded-2xl cursor-pointer hover:border-blue-400 transition-all shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedSire ? (
                        <><img src={selectedSire.image || defaultCatAvatar} className="w-8 h-8 rounded-full object-cover border border-blue-100" alt="sire" />
                          <div className="flex flex-col"><span className="text-sm font-bold text-stone-700">{selectedSire.name}</span><span className="text-[9px] text-blue-500 font-bold uppercase">{selectedSire.type}</span></div>
                        </>
                      ) : (
                        <><div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 text-xs font-bold border border-dashed border-stone-300">?</div><span className="text-sm font-medium text-stone-400">Không rõ / Ngoài hệ thống</span></>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-400 pr-2">▼</span>
                  </div>
                  {isFatherDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-blue-200 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto p-2 custom-scrollbar">
                      <div onClick={() => { setFatherId(''); setIsFatherDropdownOpen(false); }} className="p-2 hover:bg-stone-50 rounded-xl cursor-pointer flex items-center gap-3 mb-1 border-b border-stone-50"><div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 text-xs font-bold border border-dashed border-stone-300">?</div><span className="text-sm font-bold text-stone-500">Bỏ chọn (Không rõ)</span></div>
                      {sireOptions.map(sire => (
                        <div key={sire.id} onClick={() => { setFatherId(sire.id); setIsFatherDropdownOpen(false); }} className="p-2 hover:bg-blue-50 rounded-xl cursor-pointer flex items-center gap-3 transition-colors"><img src={sire.image || defaultCatAvatar} className="w-10 h-10 rounded-full object-cover border border-blue-100 shadow-sm" alt="sire" /><div className="flex flex-col"><span className="text-sm font-bold text-stone-800">♂ {sire.name}</span><span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">{sire.type}</span></div></div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-[10px] font-bold text-pink-500 uppercase mb-1">Mèo Mẹ (Dam)</label>
                  <div onClick={() => setIsMotherDropdownOpen(!isMotherDropdownOpen)} className="w-full bg-white border border-pink-200 p-2.5 rounded-2xl cursor-pointer hover:border-pink-400 transition-all shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedDam ? (
                        <><img src={selectedDam.image || defaultCatAvatar} className="w-8 h-8 rounded-full object-cover border border-pink-100" alt="dam" />
                          <div className="flex flex-col"><span className="text-sm font-bold text-stone-700">{selectedDam.name}</span><span className="text-[9px] text-pink-500 font-bold uppercase">{selectedDam.type}</span></div>
                        </>
                      ) : (
                        <><div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 text-xs font-bold border border-dashed border-stone-300">?</div><span className="text-sm font-medium text-stone-400">Không rõ / Ngoài hệ thống</span></>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-400 pr-2">▼</span>
                  </div>
                  {isMotherDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-pink-200 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto p-2 custom-scrollbar">
                      <div onClick={() => { setMotherId(''); setIsMotherDropdownOpen(false); }} className="p-2 hover:bg-stone-50 rounded-xl cursor-pointer flex items-center gap-3 mb-1 border-b border-stone-50"><div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 text-xs font-bold border border-dashed border-stone-300">?</div><span className="text-sm font-bold text-stone-500">Bỏ chọn (Không rõ)</span></div>
                      {damOptions.map(dam => (
                        <div key={dam.id} onClick={() => { setMotherId(dam.id); setIsMotherDropdownOpen(false); }} className="p-2 hover:bg-pink-50 rounded-xl cursor-pointer flex items-center gap-3 transition-colors"><img src={dam.image || defaultCatAvatar} className="w-10 h-10 rounded-full object-cover border border-pink-100 shadow-sm" alt="dam" /><div className="flex flex-col"><span className="text-sm font-bold text-stone-800">♀ {dam.name}</span><span className="text-[10px] text-pink-500 font-bold uppercase tracking-wider">{dam.type}</span></div></div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {isPurebred && (
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
                <label className="block text-sm font-bold text-stone-800 mb-3 flex items-center gap-2"><span>📜</span> Có giấy tờ (Gia phả) không?</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setHasPedigree(true)} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all border ${hasPedigree ? 'bg-pink-500 text-white border-pink-500 shadow-md' : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-pink-300'}`}>✓ CÓ PHẢ (TICA/WCF)</button>
                  <button type="button" onClick={() => setHasPedigree(false)} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all border ${!hasPedigree ? 'bg-stone-500 text-white border-stone-500 shadow-md' : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-300'}`}>✗ KHÔNG PHẢ</button>
                </div>
              </div>
            )}

            {/* ==============================================
                🎯 BẢNG MÀU EMS (SỔ XUỐNG GỌN GÀNG)
                ============================================== */}
            {isPurebred ? (
              <div className="bg-pink-50/50 rounded-3xl p-6 border border-pink-100 relative z-20 transition-all">
                <div
                  onClick={() => setIsEmsBoardOpen(!isEmsBoardOpen)}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-stone-800 uppercase flex items-center gap-2 mb-1"><span>🎨</span> Bảng Màu (Hệ EMS)</h3>
                    <p className="text-[10px] text-stone-500">Mã hiện tại: <span className="font-bold text-pink-600">{generatedEmsCode || 'Chưa chọn'}</span></p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-pink-200 flex items-center justify-center text-pink-500 group-hover:bg-pink-100 transition-colors shadow-sm">
                    <span className={`transform transition-transform ${isEmsBoardOpen ? 'rotate-180' : ''}`}>▼</span>
                  </div>
                </div>

                {/* NỘI DUNG BẢNG MÀU BÊN TRONG DROPDOWN */}
                <div className={`transition-all duration-300 overflow-hidden ${isEmsBoardOpen ? 'max-h-[1000px] opacity-100 mt-6 border-t border-pink-100 pt-6' : 'max-h-0 opacity-0'}`}>
                  {dbBaseColors.length > 0 && (
                    <>
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-stone-500">1. Màu cơ bản (Base Color)</p>
                          <button type="button" onClick={() => setBaseColor(null)} className="text-[10px] text-pink-500 font-bold hover:underline">Bỏ chọn</button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {dbBaseColors.map(c => (
                            <div key={c.code} onClick={() => setBaseColor(baseColor === c.code ? null : c.code)} className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${baseColor === c.code ? 'bg-white border-pink-500 shadow-sm ring-1 ring-pink-500' : 'bg-white border-stone-200 hover:border-pink-300'}`}>
                              <div style={{ backgroundColor: c.hex }} className="w-5 h-5 rounded-md border border-stone-200 shrink-0"></div>
                              <div className="overflow-hidden"><p className="text-xs font-bold text-stone-800 uppercase">{c.code}</p><p className="text-[9px] text-stone-500 truncate">{c.name}</p></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="sm:col-span-1">
                          <p className="text-xs font-bold text-stone-500 mb-2">2. Ánh bạc</p>
                          <div onClick={() => setHasSilver(!hasSilver)} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${hasSilver ? 'bg-white border-pink-500 shadow-sm ring-1 ring-pink-500' : 'bg-white border-stone-200'}`}>
                            <div><p className="text-xs font-bold text-stone-800">Mã "s"</p><p className="text-[10px] text-stone-500">Silver / Smoke</p></div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${hasSilver ? 'bg-pink-500 border-pink-500' : 'border-stone-300'}`}>
                              {hasSilver && <span className="text-white text-[10px]">✓</span>}
                            </div>
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-stone-500">3. Hoa văn (Pattern)</p>
                            <button type="button" onClick={() => setPattern(null)} className="text-[10px] text-pink-500 font-bold hover:underline">Bỏ chọn</button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {dbPatterns.map(p => (
                              <div key={p.code} onClick={() => setPattern(pattern === p.code ? null : p.code)} className={`p-2 rounded-xl border cursor-pointer text-center ${pattern === p.code ? 'bg-white border-pink-500 shadow-sm ring-1 ring-pink-500' : 'bg-white border-stone-200'}`}>
                                <p className="text-xs font-bold text-stone-800">{p.code}</p><p className="text-[9px] text-stone-500 truncate">{p.name}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* ==============================================
                 🎯 BẢNG MÀU MÈO TA (SỔ XUỐNG GỌN GÀNG)
                 ============================================== */
              <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100 relative z-20 transition-all">
                <div
                  onClick={() => setIsSimpleColorBoardOpen(!isSimpleColorBoardOpen)}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-stone-800 uppercase flex items-center gap-2 mb-1"><span>🐈</span> Màu lông nhận dạng</h3>
                    <p className="text-[10px] text-stone-500">Đã chọn: <span className="font-bold text-orange-600">{selectedSimpleColor?.name || 'Chưa chọn'}</span></p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-orange-200 flex items-center justify-center text-orange-500 group-hover:bg-orange-100 transition-colors shadow-sm">
                    <span className={`transform transition-transform ${isSimpleColorBoardOpen ? 'rotate-180' : ''}`}>▼</span>
                  </div>
                </div>

                <div className={`transition-all duration-300 overflow-hidden ${isSimpleColorBoardOpen ? 'max-h-[500px] opacity-100 mt-6 border-t border-orange-100 pt-6' : 'max-h-0 opacity-0'}`}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {SIMPLE_COLORS.map(c => (
                      <div key={c.id} onClick={() => setSimpleColor(c.id)} className={`p-3 rounded-xl border cursor-pointer text-center flex flex-col items-center gap-1 ${simpleColor === c.id ? 'bg-white border-orange-500 shadow-md ring-1 ring-orange-500 text-orange-600' : 'bg-white border-stone-200 text-stone-600'}`}>
                        <span className="text-xl opacity-80">🐾</span><p className="text-xs font-bold">{c.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100 space-y-4">
              <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2"><span>🏥</span> Tình trạng y tế</h3>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Đã triệt sản chưa?</label>
                <div className="flex bg-white border border-stone-200 rounded-xl overflow-hidden p-1 max-w-sm">
                  <button type="button" onClick={() => setNeutered(true)} className={`flex-1 py-2 text-sm font-bold rounded-lg ${neutered ? 'bg-pink-500 text-white shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>✓ Đã triệt sản</button>
                  <button type="button" onClick={() => setNeutered(false)} className={`flex-1 py-2 text-sm font-bold rounded-lg ${!neutered ? 'bg-stone-200 text-stone-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>✗ Chưa</button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Đặc điểm / Ghi chú</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 resize-none"></textarea>
            </div>

            <button type="submit" disabled={isSaving} className={`w-full text-white font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center ${isSaving ? 'bg-pink-300 cursor-not-allowed shadow-none' : 'bg-pink-500 hover:bg-pink-600 shadow-pink-200 hover:-translate-y-0.5'}`}>
              {isSaving ? 'Đang lưu cập nhật...' : 'Lưu Thay Đổi'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}