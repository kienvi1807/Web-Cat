"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import Toast from '@/components/ui/Toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DIMENSION = 1600;

export default function UploadMemorialPhotoPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [dbUserId, setDbUserId] = useState<number | null>(null);
  const [isEligible, setIsEligible] = useState(true);
  const [maxPhotos, setMaxPhotos] = useState(0);
  const [usedCount, setUsedCount] = useState(0);

  const [myCats, setMyCats] = useState<any[]>([]);
  const [petOwnerMap, setPetOwnerMap] = useState<{ [petid: number]: string }>({}); // Map petid -> tên chủ, hiện badge khi là Boss của gia đình
  const [selectedCatIds, setSelectedCatIds] = useState<number[]>([]);
  const deceasedSelectedCats = myCats.filter(c => selectedCatIds.includes(c.id) && c.status === 'Đã lên thiên đường mèo');

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [takenDate, setTakenDate] = useState(new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [isLastPhoto, setIsLastPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: dbUser } = await supabase.from('users').select('userid, type_id').eq('email', user.email).maybeSingle();
      if (!dbUser) { setIsLoading(false); return; }
      setDbUserId(dbUser.userid);

      const { data: typeInfo } = await supabase.from('type_users').select('is_memorial_eligible, max_memorial_photos').eq('id', dbUser.type_id).maybeSingle();
      if (typeInfo) {
        setIsEligible(typeInfo.is_memorial_eligible);
        setMaxPhotos(typeInfo.max_memorial_photos);
      }

      const { count } = await supabase
        .from('memorial_photos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', dbUser.userid)
        .neq('status', 'rejected');
      setUsedCount(count || 0);

      // 👨‍👩‍👧‍👦 Gộp thêm Boss của các thành viên gia đình đã accepted — chung nhà thì chung ảnh kỷ niệm luôn
      const { data: connRows } = await supabase
        .from('family_connections')
        .select('requester_id, receiver_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${dbUser.userid},receiver_id.eq.${dbUser.userid}`);

      const familyOwnerIds = (connRows || []).map(r =>
        r.requester_id === dbUser.userid ? r.receiver_id : r.requester_id
      );
      const ownerIdsToFetch = [dbUser.userid, ...familyOwnerIds];

      let ownerNameMap: { [key: number]: string } = {};
      if (familyOwnerIds.length > 0) {
        const { data: familyUsers } = await supabase.from('users').select('userid, fullname').in('userid', familyOwnerIds);
        (familyUsers || []).forEach((u: any) => { ownerNameMap[u.userid] = u.fullname; });
      }

      // 🎯 LẤY THÚ CƯNG KHÁCH TỰ QUẢN LÝ Ở "THÚ CƯNG CỦA TÔI" (bảng pets, ownerid = khách hoặc gia đình đã accepted)
      const { data: pets } = await supabase.from('pets').select('petid, petname, imageurl, status, ownerid').in('ownerid', ownerIdsToFetch);
      if (pets) {
        setMyCats(pets.map(p => ({ id: p.petid, name: p.petname, images: [p.imageurl], status: p.status, ownerid: p.ownerid })));
        const petOwnerLabelMap: { [petid: number]: string } = {};
        pets.forEach(p => {
          if (p.ownerid !== dbUser.userid) petOwnerLabelMap[p.petid] = ownerNameMap[p.ownerid] || 'người nhà';
        });
        setPetOwnerMap(petOwnerLabelMap);
      }

      setIsLoading(false);
    };
    init();
  }, [router]);

  const toggleCat = (catId: number) => {
    setSelectedCatIds(prev => {
      const next = prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId];
      const stillValid = next.length === 1 && myCats.find(c => c.id === next[0])?.status === 'Đã lên thiên đường mèo';
      if (!stillValid) setIsLastPhoto(false);
      return next;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > MAX_FILE_SIZE) {
      setToast({ message: 'Ảnh vượt quá 5MB, Sen chọn ảnh nhỏ hơn giúp mình nhé!', type: 'error' });
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  // 🎯 NÉN ẢNH BẰNG CANVAS TRƯỚC KHI UPLOAD
  const compressImage = (inputFile: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => { img.src = e.target?.result as string; };
      reader.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => { blob ? resolve(blob) : reject(new Error('Nén ảnh thất bại')); }, 'image/webp', 0.8);
      };
      img.onerror = reject;
      reader.readAsDataURL(inputFile);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUserId || !file) { setToast({ message: 'Sen chọn 1 tấm ảnh trước đã nhé!', type: 'error' }); return; }
    if (selectedCatIds.length === 0) { setToast({ message: 'Sen chọn ít nhất 1 bé mèo cho ảnh này nhé!', type: 'error' }); return; }
    if (usedCount >= maxPhotos) { setToast({ message: `Sen đã dùng hết ${maxPhotos} ảnh, nâng hạng thành viên để có thêm slot nhé!`, type: 'error' }); return; }

    setIsSubmitting(true);
    try {
      if (isLastPhoto && selectedCatIds.length !== 1) {
        setToast({ message: 'Ảnh cuối cùng chỉ được gắn cho đúng 1 bé thôi Sen ơi!', type: 'error' });
        setIsSubmitting(false);
        return;
      }

      const compressedBlob = await compressImage(file);
      const fileName = `${dbUserId}/${crypto.randomUUID()}.webp`;

      const { error: uploadError } = await supabase.storage.from('memorial-images').upload(fileName, compressedBlob, { contentType: 'image/webp' });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('memorial-images').getPublicUrl(fileName);

      // 🎯 Nếu đánh dấu ảnh cuối cùng, gỡ cờ is_last_photo khỏi ảnh cũ của đúng bé này trước
      if (isLastPhoto) {
        const { data: oldLinks } = await supabase
          .from('memorial_photo_pets')
          .select('photo_id')
          .eq('pet_id', selectedCatIds[0]);
        const oldPhotoIds = (oldLinks || []).map(l => l.photo_id);
        if (oldPhotoIds.length > 0) {
          await supabase.from('memorial_photos').update({ is_last_photo: false }).in('id', oldPhotoIds).eq('is_last_photo', true);
        }
      }

      const { data: insertedPhoto, error: insertError } = await supabase
        .from('memorial_photos')
        .insert({
          user_id: dbUserId,
          image_url: publicUrl,
          caption: caption.trim() || null,
          taken_date: takenDate,
          file_size: compressedBlob.size,
          is_last_photo: isLastPhoto
        })
        .select()
        .single();
      if (insertError) throw insertError;

      const linkRows = selectedCatIds.map(catId => ({ photo_id: insertedPhoto.id, pet_id: catId }));
      await supabase.from('memorial_photo_pets').insert(linkRows);

      setToast({ message: 'Ảnh đang chờ Boss duyệt nha! 🐾', type: 'success' });
      setTimeout(() => router.push('/profile/memorial'), 1200);
    } catch (err: any) {
      setToast({ message: 'Lỗi khi gửi ảnh: ' + err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#FFF8FA]"><Header /><div className="pt-40 text-center font-black text-pink-400 animate-pulse">Đang tải...</div><Footer /></div>
  );

  if (!isEligible) return (
    <div className="min-h-screen bg-[#FFF8FA]"><Header />
      <div className="pt-40 pb-24 text-center px-4">
        <span className="text-5xl block mb-4">🚫</span>
        <p className="font-black text-stone-600">Tính năng này dành cho khách hàng, không áp dụng cho tài khoản của bạn.</p>
      </div>
      <Footer /></div>
  );

  const isFull = usedCount >= maxPhotos;

  return (
    <div className="min-h-screen bg-[#FFF8FA] text-stone-700 font-sans">
      <Header />
      <main className="pt-32 pb-24 container mx-auto px-4 max-w-2xl relative z-10">
        <h1 className="text-2xl md:text-3xl font-black text-stone-800 mb-2">🌿 Gửi Ảnh Kỷ Niệm</h1>
        <p className="text-sm text-stone-400 font-bold mb-8">Đã dùng {usedCount}/{maxPhotos} ảnh</p>

        {isFull ? (
          <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-8 text-center">
            <p className="font-black text-amber-600">Sen đã dùng hết {usedCount}/{maxPhotos} ảnh, nâng hạng thành viên để có thêm slot nhé!</p>
          </div>
        ) : myCats.length === 0 ? (
          <div className="bg-white border border-stone-100 rounded-[2rem] p-8 text-center">
            <span className="text-4xl block mb-3">🐾</span>
            <p className="font-black text-stone-500">Sen chưa thêm bé thú cưng nào ở "Thú cưng của tôi" cả, nên chưa gửi ảnh kỷ niệm được.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-[11px] font-black text-stone-400 uppercase tracking-widest mb-2">Chọn ảnh *</label>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileSelect} className="hidden" />
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} className="w-full h-64 object-cover rounded-2xl" alt="preview" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-3 right-3 px-4 py-2 bg-white/90 rounded-xl text-xs font-black shadow-sm">Đổi ảnh</button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full h-48 border-2 border-dashed border-pink-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-pink-400 hover:bg-pink-50/30 transition-colors">
                  <span className="text-3xl">📷</span>
                  <span className="text-sm font-bold">Bấm để chọn ảnh (tối đa 5MB)</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-black text-stone-400 uppercase tracking-widest mb-2">Ngày kỷ niệm *</label>
              <input type="date" value={takenDate} onChange={(e) => setTakenDate(e.target.value)} required max={new Date().toISOString().slice(0, 10)} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold" />
            </div>

            <div>
              <label className="block text-[11px] font-black text-stone-400 uppercase tracking-widest mb-2">Chọn bé mèo trong ảnh *</label>
              <div className="flex flex-wrap gap-2">
                {myCats.map((cat) => {
                  const isSelected = selectedCatIds.includes(cat.id);
                  const ownerLabel = petOwnerMap[cat.id];
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => toggleCat(cat.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black border transition-all ${isSelected ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-stone-500 border-stone-200 hover:border-pink-300'}`}
                    >
                      <img src={cat.images?.[0] || 'https://via.placeholder.com/40'} className="w-5 h-5 rounded-full object-cover" alt="" />
                      {cat.name}
                      {ownerLabel && <span className={`text-[9px] font-bold ${isSelected ? 'text-pink-100' : 'text-pink-400'}`}>🏠 {ownerLabel}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {deceasedSelectedCats.length === 1 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLastPhoto}
                    onChange={(e) => setIsLastPhoto(e.target.checked)}
                    className="mt-1 w-5 h-5 accent-amber-500 cursor-pointer"
                  />
                  <span>
                    <span className="block font-black text-amber-700">🌈 Đây là ảnh cuối cùng của {deceasedSelectedCats[0].name}</span>
                    <span className="block text-xs text-amber-600 mt-1">
                      Ảnh này sẽ hiển thị to nhất, có vòng hoa tưởng niệm, ở trên cùng Cây Ký Ức — dạng ảnh trắng đen, di chuột vào sẽ hiện màu gốc.
                    </span>
                  </span>
                </label>
              </div>
            )}

            {deceasedSelectedCats.length > 1 && (
              <p className="text-xs text-amber-600 font-bold">
                ⚠️ Muốn gắn ảnh cuối cùng thì Sen chỉ chọn đúng 1 bé thôi nhé (bé đã lên thiên đường mèo).
              </p>
            )}

            <div>
              <label className="block text-[11px] font-black text-stone-400 uppercase tracking-widest mb-2">Chú thích</label>
              <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} placeholder="Kể cho Boss nghe kỷ niệm này đi Sen ơi..." className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm resize-none" />
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-black shadow-md hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50">
              {isSubmitting ? 'Đang gửi...' : 'Gửi ảnh kỷ niệm'}
            </button>
          </form>
        )}
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Footer />
    </div>
  );
}