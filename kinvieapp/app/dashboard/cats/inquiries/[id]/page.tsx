"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLoadingStore } from '@/store/useLoadingStore';
import BackgroundGlow from '@/components/layout/BackgroundGlow';

const STATUS_OPTIONS = ['Mới', 'Đã liên hệ', 'Đã chốt', 'Hủy'];

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Mới': return 'bg-sky-50 text-sky-600 border-sky-200 animate-pulse';
    case 'Đã liên hệ': return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'Đã chốt': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'Hủy': return 'bg-stone-100 text-stone-400 border-stone-200';
    default: return 'bg-stone-100 text-stone-400 border-stone-200';
  }
};

export default function InquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const inquiryId = params.id;

  const [inquiry, setInquiry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showLoading: showGlobalLoading, hideLoading: hideGlobalLoading } = useLoadingStore();
  const [isUpdating, setIsUpdating] = useState(false);

  // 🎯 GÁC CỔNG: CHỈ TÀI KHOẢN BOSS (type_id === 1) MỚI ĐƯỢC XEM TRANG NÀY
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isBoss, setIsBoss] = useState(false);

  useEffect(() => {
    const checkBossAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: dbUser } = await supabase.from('users').select('type_id').eq('email', user.email).maybeSingle();
      if (dbUser?.type_id === 1) {
        setIsBoss(true);
      }
      setIsCheckingAuth(false);
    };
    checkBossAccess();
  }, [router]);

  // 🎯 CHỈ FETCH DỮ LIỆU KHI ĐÃ XÁC NHẬN LÀ BOSS
  useEffect(() => {
    if (!isBoss) return;
    const fetchInquiry = async () => {
      setIsLoading(true);
      showGlobalLoading('Đang tải yêu cầu...');
      const { data } = await supabase
        .from('cat_inquiries')
        .select('*, cats(id, name, images, breed, price, breeder_id), users(fullname, avatarurl, email)')
        .eq('id', inquiryId)
        .maybeSingle();
      if (data) setInquiry(data);
      setIsLoading(false);
      hideGlobalLoading();
    };
    if (inquiryId) fetchInquiry();
  }, [inquiryId, isBoss]);

  useEffect(() => {
    const fetchInquiry = async () => {
      setIsLoading(true);
      showGlobalLoading('Đang tải yêu cầu...');
      const { data } = await supabase
        .from('cat_inquiries')
        .select('*, cats(id, name, images, breed, price, breeder_id), users(fullname, avatarurl, email)')
        .eq('id', inquiryId)
        .maybeSingle();
      if (data) setInquiry(data);
      setIsLoading(false);
      hideGlobalLoading();
    };
    if (inquiryId) fetchInquiry();
  }, [inquiryId]);

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    const { error } = await supabase.from('cat_inquiries').update({ status: newStatus }).eq('id', inquiryId);
    if (!error) setInquiry((prev: any) => ({ ...prev, status: newStatus }));
    setIsUpdating(false);
  };

  // 🎯 CHỜ XÁC THỰC XONG MỚI RENDER GÌ CẢ
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center font-black text-pink-400 animate-pulse">
        Đang xác thực quyền truy cập...
      </div>
    );
  };

  // 🎯 KHÔNG PHẢI BOSS -> CHẶN LUÔN, KHÔNG CHO XEM BẤT CỨ GÌ
  if (!isBoss) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-stone-500">
        <span className="text-6xl mb-4">🔒</span>
        <h2 className="text-2xl font-black text-stone-700">Bạn không có quyền truy cập trang này.</h2>
        <p className="text-sm text-stone-400 mt-2">Chỉ tài khoản Boss mới được xem chi tiết yêu cầu đón bé.</p>
        <Link href="/dashboard" className="mt-6 px-6 py-3 bg-pink-500 text-white rounded-full font-bold hover:bg-pink-600 transition-colors">Về Dashboard</Link>
      </div>
    );
  };

  if (isLoading) return null;

  if (!inquiry) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-stone-500">
      <span className="text-6xl mb-4">😿</span>
      <h2 className="text-2xl font-black">Không tìm thấy yêu cầu này.</h2>
      <Link href="/dashboard" className="mt-6 px-6 py-3 bg-pink-500 text-white rounded-full font-bold hover:bg-pink-600 transition-colors">Về Dashboard</Link>
    </div>
  );

  const cat = inquiry.cats;
  const catAdminLink = cat ? (cat.breeder_id === 1 ? `/dashboard/cats/kinvie/${cat.id}` : `/dashboard/cats/breeders/${cat.id}`) : null;
  const zaloTarget = inquiry.customer_zalo || inquiry.customer_phone;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 relative overflow-hidden selection:bg-pink-200">
      <BackgroundGlow />

      <div className="max-w-3xl mx-auto px-6 pt-12 relative z-10">
        <Link href="/dashboard" className="cursor-pointer group inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white text-pink-600 hover:bg-white px-5 py-2.5 rounded-full font-black text-sm mb-8 transition-all w-fit">
          <span className="transition-transform group-hover:-translate-x-1">←</span> Quay lại Dashboard
        </Link>

        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-6 md:p-10 shadow-sm">

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-stone-800 flex items-center gap-3">
              💌 Yêu cầu đón bé
            </h1>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(inquiry.status)}`}>
              {inquiry.status}
            </span>
          </div>

          {/* THÔNG TIN BÉ MÈO */}
          {cat && (
            <Link href={catAdminLink || '#'} className="flex items-center gap-4 bg-pink-50/50 border border-pink-100 rounded-2xl p-4 mb-8 hover:bg-pink-50 transition-colors group">
              <img
                src={cat.images?.[0] || 'https://images.unsplash.com/photo-1589883661923-6476cb0ae9f2?q=80&w=200&auto=format&fit=crop'}
                className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm"
                alt={cat.name}
              />
              <div className="flex-1 min-w-0">
                <p className="font-black text-stone-800 group-hover:text-pink-600 transition-colors">{cat.name}</p>
                <p className="text-xs text-stone-500">{cat.breed} · {cat.price ? cat.price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}</p>
              </div>
              <span className="text-pink-400 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          )}

          {/* THÔNG TIN KHÁCH HÀNG */}
          <div className="mb-8">
            <h3 className="text-sm font-black text-stone-800 uppercase flex items-center gap-2 mb-4"><span>👤</span> Thông tin khách hàng</h3>
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100 flex items-center gap-4 mb-4">
              <img
                src={inquiry.users?.avatarurl || `https://ui-avatars.com/api/?name=${encodeURIComponent(inquiry.customer_name)}&background=fce7f3&color=db2777`}
                className="w-12 h-12 rounded-full object-cover border border-white shadow-sm"
                alt="avatar"
              />
              <div>
                <p className="font-black text-stone-800">{inquiry.customer_name}</p>
                <p className="text-xs text-stone-400">{inquiry.users ? 'Khách đã có tài khoản' : 'Khách vãng lai'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href={`tel:${inquiry.customer_phone}`} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-stone-100 hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors">
                <span className="text-2xl">📞</span>
                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Điện thoại</p>
                  <p className="font-bold text-stone-800">{inquiry.customer_phone}</p>
                </div>
              </a>
              <a href={`https://zalo.me/${zaloTarget}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-stone-100 hover:border-sky-300 hover:bg-sky-50/30 transition-colors">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Zalo</p>
                  <p className="font-bold text-stone-800">{inquiry.customer_zalo || `${inquiry.customer_phone} (trùng SĐT)`}</p>
                </div>
              </a>
            </div>
          </div>

          {/* LỜI NHẮN */}
          <div className="mb-8">
            <h3 className="text-sm font-black text-stone-800 uppercase flex items-center gap-2 mb-3"><span>📝</span> Lời nhắn của khách</h3>
            <div className="bg-pink-50/30 p-5 rounded-2xl border border-pink-100/50">
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                {inquiry.message || <span className="italic text-stone-400">Khách không để lại lời nhắn gì thêm.</span>}
              </p>
            </div>
            <p className="text-[11px] text-stone-400 font-bold mt-3">Gửi lúc: {new Date(inquiry.created_at).toLocaleString('vi-VN')}</p>
          </div>

          {/* CẬP NHẬT TRẠNG THÁI */}
          <div>
            <h3 className="text-sm font-black text-stone-800 uppercase flex items-center gap-2 mb-3"><span>🔄</span> Cập nhật trạng thái</h3>
            <div className="flex flex-wrap gap-3">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleUpdateStatus(opt)}
                  disabled={isUpdating || inquiry.status === opt}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all disabled:opacity-40 ${inquiry.status === opt ? getStatusStyle(opt) : 'bg-white text-stone-500 border-stone-200 hover:border-pink-300 hover:text-pink-500'
                    }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}