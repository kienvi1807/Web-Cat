"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BackgroundGlow from '@/components/layout/BackgroundGlow';
import Toast from '@/components/ui/Toast';

export default function MemorialApprovalPage() {
  const router = useRouter();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  // 🎯 GÁC CỔNG: chỉ Boss/Staff (type_id 1 hoặc 2)
  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data: dbUser } = await supabase.from('users').select('type_id').eq('email', user.email).maybeSingle();
      if (dbUser && (dbUser.type_id === 1 || dbUser.type_id === 2)) setIsAllowed(true);
      setIsCheckingAuth(false);
    };
    checkAccess();
  }, [router]);

  const fetchPending = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('memorial_photos')
      .select('*, users(fullname, cattery_name, avatarurl), memorial_photo_pets(pets(petid, petname))')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    if (data) setPhotos(data);
    setIsLoading(false);
  };

  useEffect(() => { if (isAllowed) fetchPending(); }, [isAllowed]);

  const handleApprove = async (photo: any) => {
    const { error } = await supabase.from('memorial_photos').update({ status: 'approved' }).eq('id', photo.id);
    if (error) { setToast({ message: 'Lỗi khi duyệt: ' + error.message, type: 'error' }); return; }

    await supabase.from('notifications').insert([{
      user_id: photo.user_id,
      title: '🌿 Ảnh kỷ niệm đã được duyệt!',
      content: 'Một ảnh kỷ niệm bạn gửi đã được duyệt và xuất hiện trên Cây Ký Ức rồi nè!',
      type: 'memorial_approved',
      link: '/profile/memorial',
      related_id: String(photo.id)
    }]);

    setPhotos(prev => prev.filter(p => p.id !== photo.id));
    setToast({ message: 'Đã duyệt ảnh!', type: 'success' });
  };

  const handleReject = async (photo: any) => {
    if (!rejectNote.trim()) { setToast({ message: 'Nhập lý do từ chối giúp mình nhé!', type: 'error' }); return; }

    const { error } = await supabase.from('memorial_photos').update({ status: 'rejected', admin_note: rejectNote.trim() }).eq('id', photo.id);
    if (error) { setToast({ message: 'Lỗi khi từ chối: ' + error.message, type: 'error' }); return; }

    await supabase.from('notifications').insert([{
      user_id: photo.user_id,
      title: '😿 Ảnh kỷ niệm bị từ chối',
      content: `Lý do: ${rejectNote.trim()}`,
      type: 'memorial_rejected',
      link: '/profile/memorial',
      related_id: String(photo.id)
    }]);

    setPhotos(prev => prev.filter(p => p.id !== photo.id));
    setRejectingId(null);
    setRejectNote('');
    setToast({ message: 'Đã từ chối ảnh.', type: 'success' });
  };

  if (isCheckingAuth) return <div className="min-h-screen flex items-center justify-center font-black text-pink-400 animate-pulse">Đang xác thực...</div>;

  if (!isAllowed) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-stone-500">
      <span className="text-6xl mb-4">🔒</span>
      <h2 className="text-2xl font-black text-stone-700">Bạn không có quyền truy cập trang này.</h2>
      <Link href="/dashboard" className="mt-6 px-6 py-3 bg-pink-500 text-white rounded-full font-bold hover:bg-pink-600 transition-colors">Về Dashboard</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 relative overflow-hidden">
      <BackgroundGlow />
      <div className="max-w-4xl mx-auto px-6 pt-4 relative z-10">
        <h1 className="text-2xl md:text-3xl font-black text-stone-800 mb-2 flex items-center gap-3">🌿 Duyệt Ảnh Cây Ký Ức</h1>
        <p className="text-sm text-stone-400 font-bold mb-8">{photos.length} ảnh đang chờ duyệt</p>

        {isLoading ? (
          <p className="text-center text-stone-400 font-bold py-20">Đang tải...</p>
        ) : photos.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-stone-100">
            <span className="text-5xl block mb-4">🎉</span>
            <p className="font-black text-stone-600">Không còn ảnh nào chờ duyệt cả!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-6 flex flex-col md:flex-row gap-6">
                <img src={photo.image_url} className="w-full md:w-56 h-56 rounded-2xl object-cover shrink-0" alt="memorial" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={photo.users?.avatarurl || 'https://ui-avatars.com/api/?name=Sen'} className="w-8 h-8 rounded-full object-cover" alt="" />
                    <p className="font-black text-stone-700 text-sm">{photo.users?.cattery_name || photo.users?.fullname || 'Sen ẩn danh'}</p>
                  </div>
                  <p className="text-sm text-stone-600 mb-2">{photo.caption || <span className="italic text-stone-300">Không có chú thích</span>}</p>
                  <p className="text-[11px] text-stone-400 font-bold mb-3">Ngày kỷ niệm: {new Date(photo.taken_date).toLocaleDateString('vi-VN')}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(photo.memorial_photo_pets  || []).map((mp: any) => (
                      <span key={mp.pets?.petid} className="text-[10px] font-black bg-pink-50 text-pink-500 px-2.5 py-1 rounded-full border border-pink-100">🐾 {mp.pets?.petname}</span>
                    ))}
                  </div>

                  {rejectingId === photo.id ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        placeholder="Lý do từ chối..."
                        rows={2}
                        className="w-full text-xs p-3 rounded-xl border border-stone-200 resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleReject(photo)} className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-black">Xác nhận từ chối</button>
                        <button onClick={() => { setRejectingId(null); setRejectNote(''); }} className="px-4 py-2 bg-stone-100 text-stone-500 rounded-xl text-xs font-black">Huỷ</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(photo)} className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black hover:bg-emerald-600 transition-colors">✅ Duyệt</button>
                      <button onClick={() => setRejectingId(photo.id)} className="px-5 py-2.5 bg-white border border-rose-200 text-rose-500 rounded-xl text-xs font-black hover:bg-rose-50 transition-colors">✕ Từ chối</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}