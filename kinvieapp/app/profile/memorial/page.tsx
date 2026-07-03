"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import Toast from '@/components/ui/Toast';

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-500 border-rose-200',
};
const STATUS_LABEL: Record<string, string> = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Bị từ chối' };

export default function MyMemorialPhotosPage() {
  const [dbUserId, setDbUserId] = useState<number | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  const fetchMyPhotos = async (userId: number) => {
    setIsLoading(true);
    const { data } = await supabase
      .from('memorial_photos')
      .select('*, memorial_photo_pets(pets(petid, petname))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setPhotos(data);
    setIsLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }
      const { data: dbUser } = await supabase.from('users').select('userid').eq('email', user.email).maybeSingle();
      if (dbUser) { setDbUserId(dbUser.userid); fetchMyPhotos(dbUser.userid); } else { setIsLoading(false); }
    };
    init();
  }, []);

  const handleDelete = async (photo: any) => {
    if (photo.status === 'approved') {
      setToast({ message: 'Ảnh đã duyệt không thể tự xoá, liên hệ Boss nếu cần gỡ nhé!', type: 'error' });
      return;
    }
    if (!window.confirm('Xoá ảnh này khỏi danh sách?')) return;

    const { error } = await supabase.from('memorial_photos').delete().eq('id', photo.id);
    if (error) { setToast({ message: 'Lỗi khi xoá: ' + error.message, type: 'error' }); return; }
    setPhotos(prev => prev.filter(p => p.id !== photo.id));
    setToast({ message: 'Đã xoá ảnh.', type: 'success' });
  };

  return (
    <div className="min-h-screen bg-[#FFF8FA] text-stone-700 font-sans">
      <Header />
      <main className="pt-32 pb-24 container mx-auto px-4 max-w-4xl relative z-10">
        {isLoading ? (
          <p className="text-center text-stone-400 font-bold py-20 animate-pulse">Đang tải...</p>
        ) : !dbUserId ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-500">
            <p className="font-black">Sen vui lòng đăng nhập để xem ảnh của mình nhé!</p>
            <Link href="/login" className="mt-4 px-6 py-3 bg-pink-500 text-white rounded-full font-bold">Đăng nhập</Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-stone-800">🌿 Ảnh kỷ niệm của tôi</h1>
                <p className="text-sm text-stone-400 font-bold mt-1">{photos.length} ảnh đã gửi</p>
              </div>
              <Link href="/memorial/upload" className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-black text-sm shadow-md hover:from-pink-600 hover:to-rose-600 transition-all">
                + Gửi ảnh mới
              </Link>
            </div>

            {photos.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-16 text-center border border-stone-100">
                <span className="text-5xl block mb-4">📷</span>
                <p className="font-black text-stone-500">Sen chưa gửi ảnh kỷ niệm nào cả.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {photos.map((photo) => (
                  <div key={photo.id} className="bg-white rounded-[1.75rem] border border-stone-100 shadow-sm overflow-hidden">
                    <div className="relative">
                      <img src={photo.image_url} className="w-full h-48 object-cover" alt="memorial" />
                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_STYLE[photo.status]}`}>
                        {STATUS_LABEL[photo.status]}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-stone-700 mb-2 line-clamp-2">{photo.caption || <span className="italic text-stone-300">Không có chú thích</span>}</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {(photo.memorial_photo_pets || []).map((mp: any) => (
                          <span key={mp.pets?.petid} className="text-[9px] font-black bg-pink-50 text-pink-500 px-2 py-0.5 rounded-full">🐾 {mp.pets?.petname}</span>
                        ))}
                      </div>
                      <p className="text-[10px] text-stone-400 font-bold mb-2">{new Date(photo.taken_date).toLocaleDateString('vi-VN')}</p>
                      {photo.status === 'rejected' && photo.admin_note && (
                        <p className="text-[11px] text-rose-500 bg-rose-50 p-2 rounded-lg mb-3">Lý do: {photo.admin_note}</p>
                      )}
                      {photo.status !== 'approved' && (
                        <button onClick={() => handleDelete(photo)} className="text-[11px] font-black text-stone-400 hover:text-rose-500 transition-colors">🗑️ Xoá ảnh</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Footer />
    </div>
  );
}