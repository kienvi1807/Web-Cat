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
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [editCaption, setEditCaption] = useState('');
  const [isSavingCaption, setIsSavingCaption] = useState(false);

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

  const handleSaveCaption = async () => {
    if (!selectedPhoto) return;
    setIsSavingCaption(true);
    const { error } = await supabase
      .from('memorial_photos')
      .update({ caption: editCaption.trim() || null })
      .eq('id', selectedPhoto.id);
    setIsSavingCaption(false);
    if (error) { setToast({ message: 'Lỗi khi lưu: ' + error.message, type: 'error' }); return; }
    setPhotos(prev => prev.map(p => p.id === selectedPhoto.id ? { ...p, caption: editCaption.trim() || null } : p));
    setSelectedPhoto((prev: any) => prev ? { ...prev, caption: editCaption.trim() || null } : prev);
    setToast({ message: 'Đã lưu chú thích.', type: 'success' });
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
            <div className="mb-8">
              <Link href="/memorial" className="inline-flex items-center gap-1.5 text-sm font-black text-pink-500 hover:text-pink-600 mb-4">
                ← Quay lại Dây Leo Ký Ức
              </Link>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-stone-800">🌿 Ảnh kỷ niệm của tôi</h1>
                  <p className="text-sm text-stone-400 font-bold mt-1">{photos.length} ảnh đã gửi</p>
                </div>
                <Link href="/memorial/upload" className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-black text-sm shadow-md hover:from-pink-600 hover:to-rose-600 transition-all">
                  + Gửi ảnh mới
                </Link>
              </div>
            </div>

            {photos.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-16 text-center border border-stone-100">
                <span className="text-5xl block mb-4">📷</span>
                <p className="font-black text-stone-500">Sen chưa gửi ảnh kỷ niệm nào cả.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => { setSelectedPhoto(photo); setEditCaption(photo.caption || ''); }}
                    className="relative aspect-square rounded-xl overflow-hidden border border-stone-100"
                  >
                    <img src={photo.image_url} className="w-full h-full object-cover" alt="" />
                    <span className={`absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase border ${STATUS_STYLE[photo.status]}`}>
                      {STATUS_LABEL[photo.status]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white rounded-[2rem] overflow-hidden max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={selectedPhoto.image_url} className="w-full max-h-[50vh] object-cover" alt="" />
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {(selectedPhoto.memorial_photo_pets || []).map((mp: any) => (
                  <span key={mp.pets?.petid} className="text-[9px] font-black bg-pink-50 text-pink-500 px-2 py-0.5 rounded-full">
                    🐾 {mp.pets?.petname}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-stone-400 font-bold">{new Date(selectedPhoto.taken_date).toLocaleDateString('vi-VN')}</p>

              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Chú thích</label>
                <textarea
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm resize-none"
                />
              </div>

              {selectedPhoto.status === 'rejected' && selectedPhoto.admin_note && (
                <p className="text-[11px] text-rose-500 bg-rose-50 p-2 rounded-lg">Lý do: {selectedPhoto.admin_note}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSaveCaption}
                  disabled={isSavingCaption}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-black text-sm disabled:opacity-50"
                >
                  {isSavingCaption ? 'Đang lưu...' : 'Lưu chú thích'}
                </button>
                {selectedPhoto.status !== 'approved' && (
                  <button
                    onClick={() => { handleDelete(selectedPhoto); setSelectedPhoto(null); }}
                    className="px-5 py-3 border border-rose-200 text-rose-500 rounded-xl font-black text-sm"
                  >
                    🗑️ Xoá
                  </button>
                )}
                <button onClick={() => setSelectedPhoto(null)} className="px-5 py-3 bg-stone-100 rounded-xl font-black text-sm text-stone-600">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Footer />
    </div>
  );
}