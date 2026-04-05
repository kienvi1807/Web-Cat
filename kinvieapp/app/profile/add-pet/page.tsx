"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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

export default function AddPetPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ownerId, setOwnerId] = useState<number | null>(null);

  const [dbBaseColors, setDbBaseColors] = useState<any[]>([]);
  const [dbPatterns, setDbPatterns] = useState<any[]>([]);

  const [petname, setPetname] = useState('');
  const [breed, setBreed] = useState('Maine Coon');
  const [gender, setGender] = useState(true);
  const [description, setDescription] = useState('');
  
  const [mix1, setMix1] = useState('Anh lông ngắn (ALN)');
  const [mix2, setMix2] = useState('Mèo Ta');

  const [birthdate, setBirthdate] = useState('');
  const [lastVaccine, setLastVaccine] = useState('');
  const [lastDeworming, setLastDeworming] = useState('');

  const [hasPedigree, setHasPedigree] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null); // Chứa file thật để up lên mây
  const [neutered, setNeutered] = useState(false);

  const [baseColor, setBaseColor] = useState<string | null>(null);
  const [hasSilver, setHasSilver] = useState(false);
  const [pattern, setPattern] = useState<string | null>(null);
  const [simpleColor, setSimpleColor] = useState<string>('');

  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data: dbUser } = await supabase.from('users').select('userid').eq('email', user.email).single();
      if (dbUser) setOwnerId(dbUser.userid);

      const { data: colors } = await supabase.from('ems_base_colors').select('*');
      if (colors) setDbBaseColors(colors);
      const { data: patterns } = await supabase.from('ems_patterns').select('*');
      if (patterns) setDbPatterns(patterns);
    };
    initData();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file); // Lưu file thật vào state
      setImagePreviewUrl(URL.createObjectURL(file)); // Hiện ảnh ảo
    }
  };

  const handleDateInput = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val.length > 8) val = val.slice(0, 8); 
    if (val.length >= 5) {
      setter(`${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`);
    } else if (val.length >= 3) {
      setter(`${val.slice(0, 2)}/${val.slice(2)}`);
    } else {
      setter(val);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petname) { alert("Sen ơi nhập tên cho Boss đi nào!"); return; }
    if (!ownerId) { alert("Đang tải dữ liệu, vui lòng đợi!"); return; }

    setIsLoading(true);

    // ==========================================
    // 1. LOGIC UPLOAD ẢNH LÊN SUPABASE STORAGE
    // ==========================================
    let uploadedImageUrl = ''; 

    if (imageFile) {
      // Đặt tên file ngẫu nhiên để không bị trùng (Ví dụ: 12-17123456.jpg)
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${ownerId}-${Date.now()}.${fileExt}`;

      // Bắn file lên kho 'pet-images'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pet-images')
        .upload(fileName, imageFile);

      if (uploadError) {
        alert("Lỗi up ảnh, nhưng vẫn sẽ lưu thông tin: " + uploadError.message);
      } else {
        // Up xong thì lấy cái link Public về
        const { data: publicUrlData } = supabase.storage
          .from('pet-images')
          .getPublicUrl(fileName);
        
        uploadedImageUrl = publicUrlData.publicUrl; // Gán link xịn vào biến
      }
    }

    // ==========================================
    // 2. LƯU THÔNG TIN VÀO DATABASE
    // ==========================================
    const finalBreed = isMixed ? `Lai: ${mix1} x ${mix2}` : breed;

    const { error } = await supabase
      .from('pets')
      .insert([
        {
          ownerid: ownerId, 
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
          last_vaccine_date: formatDBDate(lastVaccine),
          last_deworming_date: formatDBDate(lastDeworming),
          description: description,
          status: 'Khỏe mạnh', 
          
          imageurl: uploadedImageUrl, // 👈 ĐÃ ĐƯỢC BƠM LINK ẢNH XỊN VÀO ĐÂY!
          price: 0
        }
      ]);

    setIsLoading(false);

    if (error) {
      alert("Lỗi thêm Boss: " + error.message);
    } else {
      alert("Thêm Boss thành công! Dữ liệu đã được lưu chuẩn xác.");
      router.push('/profile');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-700">
      <Header />
      <main className="pt-32 pb-20 container mx-auto px-4 relative z-10 max-w-3xl">
        <Link href="/profile" className="inline-flex items-center gap-2 text-sm font-bold text-stone-400 hover:text-pink-500 transition-colors mb-6">
          <span>❮</span> Quay lại Hồ sơ
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden p-8 sm:p-12 relative">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="text-center mb-8 relative">
              <div onClick={() => fileInputRef.current?.click()} className="w-32 h-32 bg-pink-100 rounded-full flex flex-col items-center justify-center text-sm mx-auto mb-4 shadow-inner border-4 border-white cursor-pointer hover:bg-pink-200 transition-all overflow-hidden relative group">
                {imagePreviewUrl ? (
                  <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <>
                    <span className="text-4xl text-pink-300 mb-1 group-hover:scale-110 transition-transform">📷</span>
                    <span className="text-pink-600 font-bold text-[10px] uppercase tracking-wide">Thêm Ảnh</span>
                  </>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              <h1 className="text-3xl font-sans font-bold text-stone-800 mb-2">Thông Tin Boss Mới</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Tên của Boss <span className="text-rose-500">*</span></label>
                <input type="text" value={petname} onChange={(e) => setPetname(e.target.value)} placeholder="VD: Miu Miu..." className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Ngày sinh</label>
                <div className="relative">
                  <input type="text" value={birthdate} onChange={handleDateInput(setBirthdate)} placeholder="dd/mm/yyyy" className="w-full bg-stone-50 border border-stone-200 pl-4 pr-10 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 font-medium tracking-wide" />
                  <input type="date" onChange={handleNativeDateChange(setBirthdate)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 cursor-pointer w-7 h-full z-10" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-lg">📅</span>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Giống mèo</label>
                <select value={breed} onChange={(e) => setBreed(e.target.value)} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 font-bold text-stone-700 cursor-pointer">
                  <optgroup label="🌟 Mèo Thuần Chủng (Tây)">
                    <option value="Maine Coon">Maine Coon</option>
                    <option value="Anh lông ngắn (ALN)">Anh lông ngắn (ALN)</option>
                    <option value="Anh lông dài (ALD)">Anh lông dài (ALD)</option>
                    <option value="Ba Tư">Mèo Ba Tư</option>
                    <option value="Sphynx">Sphynx (Không lông)</option>
                  </optgroup>
                  <optgroup label="🐈 Mèo Dân Dã (Ta / Lai)">
                    <option value="Mèo Ta">Mèo Ta / Mèo mướp</option>
                    <option value="Giống lai khác">Giống lai khác</option>
                  </optgroup>
                </select>

                {isMixed && (
                  <div className="mt-3 p-3 bg-pink-50/50 rounded-xl border border-pink-100 flex items-center gap-2">
                     <select value={mix1} onChange={(e)=>setMix1(e.target.value)} className="w-full bg-white border border-stone-200 px-2 py-2 rounded-lg text-xs font-medium">
                       {ALL_BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                     </select>
                     <span className="text-pink-400 font-black text-xs">X</span>
                     <select value={mix2} onChange={(e)=>setMix2(e.target.value)} className="w-full bg-white border border-stone-200 px-2 py-2 rounded-lg text-xs font-medium">
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
            </div>

            {isPurebred && (
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
                <label className="block text-sm font-bold text-stone-800 mb-3 flex items-center gap-2"><span>📜</span> Boss nhà mình có giấy tờ (Gia phả) không?</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setHasPedigree(true)} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all border ${hasPedigree ? 'bg-pink-500 text-white border-pink-500 shadow-md' : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-pink-300'}`}>✓ CÓ PHẢ (TICA/WCF)</button>
                  <button type="button" onClick={() => setHasPedigree(false)} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all border ${!hasPedigree ? 'bg-stone-500 text-white border-stone-500 shadow-md' : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-300'}`}>✗ KHÔNG PHẢ</button>
                </div>
              </div>
            )}

            {isPurebred ? (
              <div className="bg-pink-50/50 rounded-3xl p-6 border border-pink-100">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-sm font-bold text-stone-800 uppercase flex items-center gap-2"><span>🎨</span> Màu lông (Hệ EMS)</h3>
                   <div className="text-right">
                     <p className="text-[10px] text-stone-500 uppercase font-bold">Mã của Boss</p>
                     <p className="text-lg font-black text-pink-600 bg-white px-3 py-1 rounded-lg border border-pink-200 shadow-sm">{generatedEmsCode || '???'}</p>
                   </div>
                 </div>
                 {dbBaseColors.length > 0 && (
                   <>
                     <div className="mb-6">
                       <p className="text-xs font-bold text-stone-500 mb-2">1. Màu cơ bản (Base Color)</p>
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
                          <p className="text-xs font-bold text-stone-500 mb-2">3. Hoa văn (Pattern)</p>
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
            ) : (
              <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100">
                <h3 className="text-sm font-bold text-stone-800 uppercase mb-4 flex items-center gap-2"><span>🐈</span> Màu lông nhận dạng</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SIMPLE_COLORS.map(c => (
                    <div key={c.id} onClick={() => setSimpleColor(c.id)} className={`p-3 rounded-xl border cursor-pointer text-center flex flex-col items-center gap-1 ${simpleColor === c.id ? 'bg-white border-orange-500 shadow-md ring-1 ring-orange-500 text-orange-600' : 'bg-white border-stone-200 text-stone-600'}`}>
                      <span className="text-xl opacity-80">🐾</span><p className="text-xs font-bold">{c.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SỨC KHỎE */}
            <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100 space-y-4">
               <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2"><span>🏥</span> Tình trạng y tế</h3>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1.5">Lần tiêm vaccine</label>
                    <div className="relative">
                      <input type="text" value={lastVaccine} onChange={handleDateInput(setLastVaccine)} placeholder="dd/mm/yyyy" className="w-full bg-white border border-stone-200 pl-3 pr-8 py-2.5 rounded-xl text-xs outline-none focus:border-pink-400 tracking-wide" />
                      <input type="date" onChange={handleNativeDateChange(setLastVaccine)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 cursor-pointer w-6 h-full z-10" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-sm">📅</span>
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1.5">Lần tẩy giun</label>
                    <div className="relative">
                      <input type="text" value={lastDeworming} onChange={handleDateInput(setLastDeworming)} placeholder="dd/mm/yyyy" className="w-full bg-white border border-stone-200 pl-3 pr-8 py-2.5 rounded-xl text-xs outline-none focus:border-pink-400 tracking-wide" />
                      <input type="date" onChange={handleNativeDateChange(setLastDeworming)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 cursor-pointer w-6 h-full z-10" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-sm">📅</span>
                    </div>
                 </div>
                 <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1.5">Đã triệt sản?</label>
                  <div className="flex bg-white border border-stone-200 rounded-xl overflow-hidden p-1">
                    <button type="button" onClick={() => setNeutered(true)} className={`flex-1 py-1 text-xs font-bold rounded-lg ${neutered ? 'bg-pink-500 text-white shadow-sm' : 'text-stone-400'}`}>✓ Rồi</button>
                    <button type="button" onClick={() => setNeutered(false)} className={`flex-1 py-1 text-xs font-bold rounded-lg ${!neutered ? 'bg-stone-200 text-stone-600 shadow-sm' : 'text-stone-400'}`}>✗ Chưa</button>
                  </div>
                </div>
               </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Đặc điểm / Ghi chú</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="VD: Mắt 2 màu, hay cắn cáp sạc..." rows={2} className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 resize-none"></textarea>
            </div>

            <button type="submit" disabled={isLoading} className={`w-full text-white font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center ${isLoading ? 'bg-pink-300 cursor-not-allowed shadow-none' : 'bg-pink-500 hover:bg-pink-600 shadow-pink-200 hover:-translate-y-0.5'}`}>
              {isLoading ? 'Đang lưu vào sổ...' : 'Hoàn Tất Hồ Sơ Boss'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}