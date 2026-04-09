"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('orderdate', { ascending: false }); // Đổi created_at thành orderdate
    if (!error) setOrders(data || []);
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã đặt hàng': return 'bg-blue-500 text-white';
      case 'Đang vận chuyển': return 'bg-amber-500 text-white';
      case 'Đã giao': return 'bg-emerald-500 text-white';
      default: return 'bg-stone-500 text-white';
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer_phone?.includes(searchQuery)
  );

  return (
    <div className="animate-fade-in max-w-[1600px] mx-auto pb-24 px-4 pt-10">
      {/* BACKGROUND GLOW TÔNG XANH BLUE VẬN HÀNH */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/operations" className="p-3 bg-white rounded-2xl shadow-sm border border-stone-100 hover:bg-blue-50 text-blue-600 transition-all">
            ←
          </Link>
          <h1 className="text-4xl font-black text-stone-800">Quản lý Đơn hàng 📦</h1>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">🔍</span>
            <input 
              type="text" 
              placeholder="Tìm tên khách, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-md border border-stone-200 rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none font-bold text-stone-700"
            />
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-200 hover:scale-105 transition-all">
            + Đơn mới
          </button>
        </div>
      </div>

      {/* DANH SÁCH ĐƠN HÀNG (DẠNG NGANG - HORIZONTAL LIST) */}
      {isLoading ? (
        <div className="text-center py-20 animate-pulse text-blue-500 font-black">Đang quét vận đơn...</div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="group flex flex-col bg-white/70 backdrop-blur-2xl border border-white rounded-[2rem] shadow-sm overflow-hidden transition-all">
              
              {/* PHẦN THANH NGANG (MAIN BAR) */}
              <div 
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                className="flex flex-wrap items-center justify-between p-6 cursor-pointer hover:bg-blue-50/50 transition-colors"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-xl">👤</div>
                  <div>
                    <h3 className="font-black text-stone-800 text-lg">{order.customer_name}</h3>
                    <p className="text-xs font-bold text-stone-400">{order.customer_phone} • {new Date(order.created_at).toLocaleString('vi-VN')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-10">
                  <div className="text-center hidden md:block">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Tổng tiền</p>
                    <p className="font-black text-blue-600">{order.total_price?.toLocaleString()}đ</p>
                  </div>

                  <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>

                  <span className={`text-2xl transition-transform duration-300 ${expandedOrderId === order.id ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </div>

              {/* PHẦN CHI TIẾT SỔ XUỐNG (EXPANDABLE) */}
              {expandedOrderId === order.id && (
                <div className="p-8 bg-stone-50/50 border-t border-dashed border-stone-200 animate-slide-down">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Danh sách sản phẩm */}
                    <div>
                      <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4">Chi tiết giỏ hàng</h4>
                      <div className="space-y-3">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-stone-100">
                            <div className="flex items-center gap-4">
                              <span className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                              <p className="font-bold text-stone-700">{item.name} <span className="text-stone-400">x{item.quantity}</span></p>
                            </div>
                            <p className="font-black text-stone-800">{(item.price * item.quantity).toLocaleString()}đ</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Thông tin giao hàng & Hành động */}
                    <div className="flex flex-col gap-6">
                      <div className="bg-white p-6 rounded-[2rem] border border-stone-100">
                        <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3">📍 Địa chỉ nhận hàng</h4>
                        <p className="font-bold text-stone-700">{order.address || 'Tại cửa hàng'}</p>
                      </div>

                      <div className="flex gap-4">
                        <button className="flex-1 py-4 bg-white border-2 border-blue-500 text-blue-600 rounded-2xl font-black hover:bg-blue-50 transition-all">
                          Cập nhật Trạng thái
                        </button>
                        <button className="flex-1 py-4 bg-stone-900 text-white rounded-2xl font-black hover:bg-black transition-all">
                          In Hóa Đơn 📄
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}