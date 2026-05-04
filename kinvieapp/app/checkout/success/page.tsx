"use client";

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderid');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  // THÔNG TIN TÀI KHOẢN NGÂN HÀNG
  const BANK_ID = 'Vietcombank'; 
  const ACCOUNT_NO = '0611001960655'; 
  const ACCOUNT_NAME = 'NGUYEN TRUNG KIEN';

  useEffect(() => {
    if (orderId) fetchOrderDetails();
    else router.push('/');
  }, [orderId]);

  const fetchOrderDetails = async () => {
    const { data } = await supabase.from('orders').select('*').eq('orderid', orderId).maybeSingle();
    if (data) setOrderData(data);
    setIsLoading(false);
  };

  // 🎯 LOGIC UPLOAD ẢNH BIÊN LAI VÀ XÁC NHẬN
  const handleUploadBill = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `bill_order_${orderId}_${Date.now()}.${fileExt}`;
    
    // Up ảnh tạm vào bucket pet-images của sếp
    const { error: uploadError } = await supabase.storage.from('pet-images').upload(fileName, file);

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from('pet-images').getPublicUrl(fileName);
      const billUrl = publicUrlData.publicUrl;

      // Cập nhật trạng thái đơn thành "Chờ xác nhận" và nhét link bill vào paymentmethod
      await supabase.from('orders').update({ 
        orderstatus: 'Chờ xác nhận',
        paymentmethod: `${orderData.paymentmethod} | BILL: ${billUrl}`
      }).eq('orderid', orderId);

      // Chuyển hướng sang trang Theo dõi đơn hàng
      router.push(`/order-tracking/${orderId}`);
    } else {
      alert("Lỗi tải ảnh: " + uploadError.message);
    }
    setIsUploading(false);
  };

  if (isLoading) return <div className="min-h-[70vh] flex items-center justify-center text-4xl text-pink-300 animate-spin">🐾</div>;
  if (!orderData) return <div className="min-h-[70vh] flex flex-col items-center justify-center text-center"><h2 className="text-2xl font-black">Lỗi đơn hàng</h2></div>;

  const amount = orderData.totalamount;
  const addInfo = `Thanh toan don hang ${orderId}`; 
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${addInfo}&accountName=${ACCOUNT_NAME}`;

  // NẾU KHÁCH CHỌN COD, ĐẨY THẲNG SANG TRANG THEO DÕI LUÔN
  if (orderData.paymentmethod === 'COD') {
    router.push(`/order-tracking/${orderId}`);
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto py-20 px-4 animate-fade-in">
      <input type="file" ref={fileInputRef} onChange={handleUploadBill} accept="image/*" className="hidden" />

      <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 md:p-12 text-center">
        
        <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-sm">⏳</div>
        
        <h1 className="text-3xl md:text-4xl font-black text-stone-800 mb-2 tracking-tight">Đơn hàng chờ thanh toán</h1>
        <p className="text-stone-500 font-medium mb-8">
          Mã đơn hàng: <span className="font-black text-pink-500">#{orderId}</span><br/>
          Hệ thống đã giữ hàng cho sếp. Vui lòng thanh toán để xác nhận đơn!
        </p>

        <div className="bg-stone-50/80 rounded-[2.5rem] border border-stone-200 p-8 max-w-xl mx-auto mb-8 shadow-inner">
          <h2 className="text-xl font-black text-stone-800 mb-6">Quét mã VietQR</h2>
          
          <div className="bg-white p-4 rounded-[2rem] border-2 border-dashed border-pink-200 inline-block mb-6 shadow-sm relative group">
            {isUploading && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center font-bold text-pink-500"><span className="animate-spin text-3xl mb-2">🐾</span>Đang up bill...</div>}
            <img src={qrUrl} alt="QR" className="w-64 h-64 object-contain rounded-xl" />
          </div>

          <div className="text-center mb-8">
             <p className="text-stone-400 text-sm font-bold mb-1">Số tiền cần chuyển:</p>
             <p className="text-4xl font-black text-rose-500">{amount.toLocaleString('vi-VN')}đ</p>
          </div>

          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-black py-4 px-6 rounded-2xl shadow-xl hover:shadow-pink-500/30 transition-all flex items-center justify-center gap-2"
          >
            📸 TẢI ẢNH CHỤP BIÊN LAI LÊN
          </button>
          <p className="text-xs text-stone-400 mt-4 italic">Sau khi chuyển khoản, sếp nhớ up ảnh màn hình bill để KinVie check lẹ nhé!</p>
        </div>

        <Link href="/petshop" className="text-stone-400 font-bold hover:text-pink-500 underline">Thanh toán sau, quay lại cửa hàng</Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-700 font-sans"><Header /><main className="pt-32 pb-20 container mx-auto relative z-10"><Suspense fallback={<div>Loading...</div>}><PaymentContent /></Suspense></main><Footer /></div>
  );
}