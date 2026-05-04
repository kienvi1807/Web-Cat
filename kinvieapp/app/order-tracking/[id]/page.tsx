"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data } = await supabase.from('orders').select('*, orderdetails(products(name, imageurl, images), quantity, unitprice)').eq('orderid', orderId).maybeSingle();
      if (data) setOrderData(data);
      setIsLoading(false);
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  if (isLoading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center text-4xl text-pink-300 animate-spin">🐾</div>;
  if (!orderData) return <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center"><h1 className="text-2xl font-black">Không tìm thấy đơn hàng</h1></div>;

  // LOGIC TIMELINE TIẾN TRÌNH
  const statusFlow = ['Chờ thanh toán', 'Chờ xác nhận', 'Đã thanh toán', 'Đã giao hàng'];
  const currentStep = statusFlow.indexOf(orderData.orderstatus);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-700 font-sans">
      <Header />
      <main className="pt-32 pb-20 container mx-auto px-4 max-w-4xl relative z-10">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-stone-800 tracking-tight">Theo dõi đơn hàng</h1>
            <p className="text-stone-500 font-bold">Mã đơn: <span className="text-pink-500">#{orderId}</span></p>
          </div>
          <Link href="/petshop" className="px-5 py-2.5 bg-white border border-stone-200 rounded-xl font-bold text-sm shadow-sm hover:border-pink-300 hover:text-pink-500 transition-colors">Tiếp tục mua sắm</Link>
        </div>

        {/* 🎯 BẢNG TIẾN TRÌNH (TIMELINE) */}
        <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm p-8 md:p-12 mb-8">
          <div className="relative flex justify-between items-center max-w-2xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-1.5 bg-stone-100 -translate-y-1/2 z-0 rounded-full"></div>
            
            {/* Thanh màu chạy (Progress Bar) */}
            <div 
              className="absolute top-1/2 left-0 h-1.5 bg-pink-500 -translate-y-1/2 z-0 rounded-full transition-all duration-1000"
              style={{ width: `${(Math.max(0, currentStep) / (statusFlow.length - 1)) * 100}%` }}
            ></div>

            {statusFlow.map((status, index) => {
              const isActive = index <= currentStep;
              const isCurrent = index === currentStep;
              return (
                <div key={status} className="relative z-10 flex flex-col items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500 ${isActive ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' : 'bg-white border-4 border-stone-100 text-stone-300'} ${isCurrent ? 'ring-4 ring-pink-100 scale-110' : ''}`}>
                    {isActive ? '✓' : index + 1}
                  </div>
                  <p className={`text-[10px] sm:text-xs font-black uppercase tracking-widest absolute -bottom-8 whitespace-nowrap ${isActive ? 'text-pink-600' : 'text-stone-400'}`}>
                    {status}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🎯 THÔNG TIN CHI TIẾT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm p-8">
            <h3 className="text-sm font-black text-stone-400 uppercase tracking-widest mb-6">📦 Sản phẩm đã đặt</h3>
            <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              {orderData.orderdetails?.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 items-center bg-stone-50 p-3 rounded-2xl border border-stone-100">
                  <img src={item.products?.imageurl || item.products?.images?.[0] || 'https://via.placeholder.com/100'} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-stone-700 line-clamp-1">{item.products?.name}</p>
                    <p className="text-[10px] text-stone-500 mt-1">SL: {item.quantity}</p>
                  </div>
                  <p className="font-black text-rose-500">{item.unitprice?.toLocaleString()}đ</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-dashed border-stone-200 flex justify-between items-center">
              <span className="font-bold text-stone-500">Tổng thanh toán</span>
              <span className="text-2xl font-black text-rose-500">{orderData.totalamount?.toLocaleString()}đ</span>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm p-8">
            <h3 className="text-sm font-black text-stone-400 uppercase tracking-widest mb-6">📍 Thông tin nhận hàng</h3>
            <div className="space-y-4 text-sm bg-stone-50 p-5 rounded-2xl border border-stone-100">
              <p><span className="text-stone-400 font-bold w-20 inline-block">Người nhận:</span> <span className="font-black">{orderData.customer_name}</span></p>
              <p><span className="text-stone-400 font-bold w-20 inline-block">Điện thoại:</span> <span className="font-black">{orderData.customer_phone}</span></p>
              <p><span className="text-stone-400 font-bold w-20 inline-block">Địa chỉ:</span> <span className="font-bold">{orderData.address}</span></p>
              <p className="pt-3 mt-3 border-t border-stone-200">
                <span className="text-stone-400 font-bold w-20 inline-block">Thanh toán:</span> 
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{orderData.paymentmethod.split('|')[0]}</span>
              </p>
            </div>
            
            {orderData.orderstatus === 'Chờ thanh toán' && orderData.paymentmethod !== 'COD' && (
              <div className="mt-6">
                <Link href={`/checkout/success?orderid=${orderId}`} className="w-full block text-center bg-pink-500 text-white font-black py-4 rounded-xl shadow-md hover:bg-pink-600 transition-colors">
                  Tiến hành Thanh Toán Ngay
                </Link>
              </div>
            )}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}