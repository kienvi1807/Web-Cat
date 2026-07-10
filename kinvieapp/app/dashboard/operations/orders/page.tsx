"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import BackgroundGlow from '@/components/layout/BackgroundGlow';
import { useLayoutStore } from '@/store/useLayoutStore';

const ORDER_STATUSES = ['Tất cả', 'Chờ xác nhận', 'Đã đặt hàng', 'Đã thanh toán', 'Đang vận chuyển', 'Đã giao hàng', 'Đã hủy'];

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-rose-500', 'bg-lime-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-purple-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500'
  ];
  const charCode = (name || 'A').charCodeAt(0);
  return colors[charCode % colors.length];
};

const setThemeColor = useLayoutStore(state => state.setThemeColor);
useEffect(() => { setThemeColor('blue'); }, [setThemeColor]);

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Các state cho bộ lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterStatus, setSelectedFilterStatus] = useState('Tất cả');
  // 🎯 State lọc theo Ngày giao hàng (Pate)
  const [deliveryDateFilter, setDeliveryDateFilter] = useState('');

  const [expandedOrderId, setExpandedOrderId] = useState<any>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    // 🎯 JOIN thêm orderdetails + products để lấy sản phẩm cho những đơn khách tự đặt
    // (những đơn này lưu sản phẩm ở bảng orderdetails, không phải cột items)
    const { data, error } = await supabase
      .from('orders')
      .select('*, orderdetails(quantity, unitprice, variant, products(id, name, price, imageurl, images))')
      .order('orderdate', { ascending: false, nullsFirst: false });

    if (!error && data) {
      const normalized = data.map((o: any) => {
        // Nếu đơn chưa có sẵn cột items (JSON) thì tự build từ orderdetails
        if ((!o.items || o.items.length === 0) && o.orderdetails && o.orderdetails.length > 0) {
          return {
            ...o,
            items: o.orderdetails.map((d: any) => ({
              productid: d.products?.id,
              name: d.products?.name || 'Sản phẩm',
              price: d.unitprice,
              quantity: d.quantity,
              image: d.products?.imageurl || d.products?.images?.[0] || ''
            }))
          };
        }
        return o;
      });
      setOrders(normalized);
    }
    setIsLoading(false);
  };

  const handleUpdateStatus = async () => {
    if (!activeOrder) return;

    const { error } = await supabase
      .from('orders')
      .update({ orderstatus: newStatus })
      .eq('orderid', activeOrder.orderid);

    if (!error) {
      // 🎯 CỘNG DỒN "ĐÃ BÁN" (sales_count) CHO SẢN PHẨM KHI ĐƠN CHUYỂN SANG "ĐÃ GIAO HÀNG"
      // Chỉ cộng khi trạng thái TRƯỚC ĐÓ chưa phải "Đã giao hàng" -> tránh cộng lặp nếu sếp lỡ lưu lại 2 lần
      if (newStatus === 'Đã giao hàng' && activeOrder.orderstatus !== 'Đã giao hàng') {
        await incrementSalesCount(activeOrder.items);
      }

      if (newStatus === 'Đã giao hàng' && activeOrder.orderstatus !== 'Đã giao hàng') {
        await incrementSalesCount(activeOrder.items);

        // 🔔 BÁO CHO KHÁCH BIẾT ĐƠN ĐÃ GIAO XONG, KÈM LINK QUA ĐÁNH GIÁ
        await supabase.from('notifications').insert([{
          user_id: activeOrder.userid,
          title: '🎉 Đơn hàng đã giao thành công!',
          content: `Đơn hàng #${activeOrder.orderid} đã giao thành công. Sen đánh giá sản phẩm giúp shop nhé!`,
          type: 'order_success',
          link: `/order-tracking/${activeOrder.orderid}#review`,
          related_id: String(activeOrder.orderid)
        }]);
      }

      setOrders(orders.map(o => o.orderid === activeOrder.orderid ? { ...o, orderstatus: newStatus } : o));
      setIsStatusModalOpen(false);
      alert("✅ Đã cập nhật trạng thái đơn hàng!");
    } else {
      alert("Lỗi khi cập nhật: " + error.message);
    }
  };

  // 🎯 HÀM CỘNG "ĐÃ BÁN" CHO TỪNG SẢN PHẨM TRONG ĐƠN (chạy khi đơn giao thành công)
  const incrementSalesCount = async (items: any[]) => {
    if (!items || items.length === 0) return;

    for (const item of items) {
      if (!item.productid) continue;

      const { data: prod, error: fetchErr } = await supabase
        .from('products')
        .select('sales_count')
        .eq('id', item.productid)
        .maybeSingle();

      if (fetchErr || !prod) continue;

      await supabase
        .from('products')
        .update({ sales_count: (prod.sales_count || 0) + Number(item.quantity || 1) })
        .eq('id', item.productid);
    }
  };

  // 🎯 DUYỆT ĐƠN NHANH: Chờ xác nhận -> Đang vận chuyển
  const handleApproveOrder = async (order: any) => {
    if (!window.confirm(`Duyệt đơn #${order.orderid} và chuyển sang "Đang vận chuyển"?`)) return;

    const { error } = await supabase
      .from('orders')
      .update({ orderstatus: 'Đang vận chuyển' })
      .eq('orderid', order.orderid);

    if (!error) {
      setOrders(orders.map(o => o.orderid === order.orderid ? { ...o, orderstatus: 'Đang vận chuyển' } : o));

      // 🔔 BÁO CHO KHÁCH BIẾT ĐƠN ĐÃ ĐƯỢC DUYỆT VÀ ĐANG GIAO
      await supabase.from('notifications').insert([{
        user_id: order.userid,
        title: '🚚 Đơn hàng đã được phê duyệt!',
        content: `Đơn hàng #${order.orderid} của bạn đã được duyệt và đang trên đường tới ngay.`,
        type: 'order_approved',
        link: `/order-tracking/${order.orderid}`,
        related_id: String(order.orderid)
      }]);

      alert("✅ Đã duyệt đơn! Đơn hàng chuyển sang Đang vận chuyển.");
    } else {
      alert("Lỗi khi duyệt đơn: " + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm";
    switch (status) {
      case 'Chờ xác nhận': return <span className={`${baseClasses} bg-sky-100/80 text-sky-700 border border-sky-200/50 animate-pulse`}>{status}</span>;
      case 'Đã đặt hàng': return <span className={`${baseClasses} bg-lime-100/80 text-lime-700 border border-lime-200/50`}>{status}</span>;
      case 'Đã thanh toán': return <span className={`${baseClasses} bg-purple-100/80 text-purple-700 border border-purple-200/50`}>{status}</span>;
      case 'Đang vận chuyển': return <span className={`${baseClasses} bg-amber-100/80 text-amber-700 border border-amber-200/50`}>{status}</span>;
      case 'Đã giao hàng': return <span className={`${baseClasses} bg-emerald-100/80 text-emerald-700 border border-emerald-200/50`}>{status}</span>;
      case 'Đã hủy': return <span className={`${baseClasses} bg-rose-100/80 text-rose-700 border border-rose-200/50`}>{status}</span>;
      default: return <span className={`${baseClasses} bg-stone-100/80 text-stone-600 border border-stone-200/50`}>{status || 'Chưa rõ'}</span>;
    }
  };

  // 🎯 LOGIC LỌC ĐƠN HÀNG
  const filteredOrders = orders.filter(o => {
    const matchesSearch = (o.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customer_phone || '').includes(searchQuery) ||
      (o.orderid?.toString() || '').includes(searchQuery);

    const matchesStatus = selectedFilterStatus === 'Tất cả' || o.orderstatus === selectedFilterStatus;

    // Logic lọc theo Ngày giao hàng
    let matchesDeliveryDate = true;
    if (deliveryDateFilter) {
      const orderDelDate = o.delivery_date || o.deliverydate;
      if (!orderDelDate) {
        matchesDeliveryDate = false;
      } else {
        matchesDeliveryDate = orderDelDate.startsWith(deliveryDateFilter);
      }
    }

    return matchesSearch && matchesStatus && matchesDeliveryDate;
  });

  // 🎯 LOGIC TỔNG HỢP PATE TỪ CÁC ĐƠN HÀNG ĐÃ LỌC
  const pateSummary: Record<string, number> = {};
  let totalPateBoxes = 0;

  filteredOrders.forEach(order => {
    // Chỉ tính pate cho những đơn chưa Hủy
    if (order.orderstatus !== 'Đã hủy' && order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        // Quét các sản phẩm có chữ "Pate" trong tên
        if (item.name && item.name.toLowerCase().includes('pate')) {
          const qty = Number(item.quantity || 1);
          pateSummary[item.name] = (pateSummary[item.name] || 0) + qty;
          totalPateBoxes += qty;
        }
      });
    }
  });

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 pb-24 relative overflow-hidden">
      {/* HIỆU ỨNG NỀN */}
      <BackgroundGlow />
      <div className="max-w-[1400px] mx-auto px-6 pt-12 relative z-10 animate-fade-in">

        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-6">
          <div>
            <Link
              href="/dashboard/operations"
              className="cursor-pointer group inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white text-blue-600 hover:bg-white hover:text-blue-700 px-5 py-2.5 rounded-full font-black text-sm mb-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(37,99,235,0.15)] hover:-translate-y-0.5 active:scale-95 w-fit"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span> Quay lại Kinh doanh & Vận hành
            </Link>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-blue-900 to-stone-800 tracking-tight drop-shadow-sm">
              Đơn hàng & vận chuyển
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Thanh tìm kiếm Text */}
            <div className="relative flex-1 lg:w-72 group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-blue-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </span>
              <input
                type="text"
                placeholder="Tìm mã đơn, tên, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-stone-200/80 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-stone-700 shadow-sm transition-all cursor-text"
              />
            </div>

            {/* 🎯 BỘ LỌC TÌM NGÀY GIAO HÀNG */}
            <div className="relative lg:w-48 group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-blue-500 transition-colors">
                🗓️
              </span>
              <input
                type="date"
                value={deliveryDateFilter}
                onChange={(e) => setDeliveryDateFilter(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-stone-200/80 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-stone-700 shadow-sm transition-all cursor-pointer"
              />
              {deliveryDateFilter && (
                <button onClick={() => setDeliveryDateFilter('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-rose-500 font-bold text-xs cursor-pointer">Xóa</button>
              )}
            </div>

            <Link href="/dashboard/operations/orders/add" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_25px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer">
              <span>+</span> Tạo đơn thủ công
            </Link>
          </div>
        </div>

        {/* LỌC TRẠNG THÁI */}
        <div className="flex items-center gap-2 p-1.5 bg-white border border-stone-200/60 rounded-2xl shadow-sm mb-6 overflow-x-auto custom-scrollbar w-fit">
          {ORDER_STATUSES.map(status => (
            <button
              key={status}
              onClick={() => setSelectedFilterStatus(status)}
              className={`cursor-pointer px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${selectedFilterStatus === status
                ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-500/20'
                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* 🎯 BẢNG TỔNG HỢP PATE TƯƠI */}
        {(totalPateBoxes > 0 || deliveryDateFilter) && (
          <div className="mb-8 p-6 bg-gradient-to-br from-orange-50 to-rose-50 rounded-[2rem] border border-orange-100 shadow-[0_8px_30px_rgb(249,115,22,0.06)] flex flex-col md:flex-row items-start md:items-center gap-6 animate-fade-in">
            <div className="w-16 h-16 bg-white border-2 border-orange-100 text-orange-500 rounded-full flex items-center justify-center text-3xl shadow-sm shrink-0">🥫</div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-stone-800 mb-3 flex items-center gap-2">
                Tổng hợp Pate cần làm
                {deliveryDateFilter && <span className="text-sm font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-lg">Ngày giao: {new Date(deliveryDateFilter).toLocaleDateString('vi-VN')}</span>}
              </h3>

              {totalPateBoxes === 0 ? (
                <p className="text-stone-500 font-bold text-sm">Không có đơn Pate nào trong khoảng thời gian này.</p>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-4 py-2 bg-orange-500 text-white font-black text-sm rounded-xl shadow-md">
                    Tổng cộng: {totalPateBoxes} hộp
                  </span>
                  <span className="text-stone-300">|</span>
                  {Object.entries(pateSummary).map(([name, qty]) => (
                    <span key={name} className="px-4 py-2 bg-white border border-orange-200 text-orange-700 font-bold text-sm rounded-xl shadow-sm">
                      {name}: <span className="font-black text-lg">{qty}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DANH SÁCH ĐƠN HÀNG */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-60">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-stone-500 tracking-widest text-sm uppercase">Đang đồng bộ dữ liệu...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-32 bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-stone-200/50 shadow-sm">
            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">📭</div>
            <h3 className="text-xl font-black text-stone-700 mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-stone-500">Hãy thử thay đổi bộ lọc hoặc tạo đơn hàng mới.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {filteredOrders.map((order) => {
              const rawDate = order.orderdate || order.created_at;
              const displayDate = rawDate ? new Date(rawDate).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '---';

              // Lấy ngày giao hàng để hiển thị
              const rawDeliveryDate = order.delivery_date || order.deliverydate;
              const displayDeliveryDate = rawDeliveryDate ? new Date(rawDeliveryDate).toLocaleDateString('vi-VN') : null;

              const amount = order.totalamount || 0;
              const isExpanded = expandedOrderId === order.orderid;
              const customerInitial = (order.customer_name || '?').charAt(0).toUpperCase();

              // Kiểm tra xem đơn này có Pate không để highlight icon
              const hasPate = order.items?.some((item: any) => item.name?.toLowerCase().includes('pate'));

              // 🎯 Trích link ảnh bill khách up (nếu có) từ paymentmethod
              const billMatch = order.paymentmethod?.match(/BILL:\s*(\S+)/);
              const billUrl = billMatch ? billMatch[1] : null;

              return (
                <div
                  key={order.orderid}
                  className={`bg-white rounded-[2rem] border transition-all duration-300 ${isExpanded ? 'border-blue-300 shadow-[0_20px_40px_rgba(59,130,246,0.08)]' : 'border-stone-200/60 shadow-sm hover:border-blue-200 hover:shadow-md'
                    }`}
                >
                  <div
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.orderid)}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 cursor-pointer gap-4"
                  >
                    <div className="flex items-center gap-5 w-full md:w-auto">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-inner relative ${getAvatarColor(order.customer_name)}`}>
                        {customerInitial}
                        {hasPate && <span className="absolute -top-2 -right-2 text-xl filter drop-shadow-md">🥫</span>}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-stone-800 text-lg">{order.customer_name}</h3>
                          <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">ID: #{String(order.orderid).substring(0, 6).toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-stone-500">
                          <span className="font-medium">{order.customer_phone}</span>
                          <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                          <span>Đặt: {displayDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full md:w-auto gap-4 md:gap-8 pl-17 md:pl-0">

                      {/* Hiển thị ngày hẹn giao nếu có */}
                      {displayDeliveryDate && (
                        <div className="bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-xl">
                          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-0.5">Ngày hẹn giao</p>
                          <p className="font-bold text-orange-700 text-sm">{displayDeliveryDate}</p>
                        </div>
                      )}

                      <div className="text-left md:text-right">
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Tổng tiền</p>
                        <p className="font-black text-stone-800 text-lg">{amount.toLocaleString()} <span className="text-stone-400 text-sm font-bold">VNĐ</span></p>
                      </div>
                      <div className="flex items-center gap-6">
                        {getStatusBadge(order.orderstatus)}
                        <div className={`w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-blue-50 text-blue-600' : ''}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-6 pt-0 border-t border-stone-100 bg-stone-50/50 rounded-b-[2rem] mt-2">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
                        <div className="lg:col-span-7">
                          <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                            Sản phẩm đặt mua
                          </h4>
                          <div className="space-y-3 bg-white p-2 rounded-3xl border border-stone-200/60 shadow-sm">
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center p-3 rounded-2xl hover:bg-stone-50 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-sm font-bold text-stone-500">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <p className="font-bold text-stone-700">
                                      {item.name}
                                      {item.name?.toLowerCase().includes('pate') && <span className="ml-2 text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md font-black">PATE</span>}
                                    </p>
                                    <p className="text-xs text-stone-500 font-medium">SL: {item.quantity} x {item.price.toLocaleString()}đ</p>
                                  </div>
                                </div>
                                <p className="font-black text-stone-800">{(item.price * item.quantity).toLocaleString()}đ</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="lg:col-span-5 flex flex-col gap-6">
                          <div className="bg-white p-6 rounded-3xl border border-stone-200/60 shadow-sm">
                            <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                              Địa chỉ nhận hàng
                            </h4>
                            <p className="font-bold text-stone-700 leading-relaxed">
                              {order.address ? order.address : <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">Nhận tại Shop</span>}
                            </p>
                          </div>

                          {/* 🎯 ẢNH BILL CHUYỂN KHOẢN CỦA KHÁCH */}
                          {billUrl && (
                            <div className="bg-white p-6 rounded-3xl border border-stone-200/60 shadow-sm">
                              <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                📸 Ảnh biên lai khách gửi
                              </h4>
                              <a href={billUrl} target="_blank" rel="noopener noreferrer" className="block">
                                <img
                                  src={billUrl}
                                  alt="Biên lai chuyển khoản"
                                  className="w-full max-h-64 object-contain rounded-2xl border border-stone-200 hover:opacity-80 transition-opacity cursor-pointer bg-stone-50"
                                />
                              </a>
                              <p className="text-[10px] text-stone-400 mt-2 text-center">Bấm vào ảnh để xem full size</p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3 mt-auto">
                            {order.orderstatus === 'Chờ xác nhận' && (
                              <button
                                onClick={() => handleApproveOrder(order)}
                                className="cursor-pointer col-span-2 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-md"
                              >
                                ✅ Duyệt đơn & Chuyển vận chuyển
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setActiveOrder(order);
                                setNewStatus(order.orderstatus || 'Đã đặt hàng');
                                setIsStatusModalOpen(true);
                              }}
                              className="cursor-pointer col-span-2 py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border border-blue-200/50"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                              Cập nhật trạng thái
                            </button>

                            <Link
                              href={`/dashboard/operations/orders/${order.orderid}/edit`}
                              className="cursor-pointer py-3.5 bg-white border border-stone-200 text-stone-700 rounded-2xl font-bold hover:border-stone-300 hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
                            >
                              Sửa đơn
                            </Link>

                            <button className="cursor-pointer py-3.5 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-md flex items-center justify-center gap-2">
                              In Hóa Đơn
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 🎯 MODAL CẬP NHẬT TRẠNG THÁI */}
        {isStatusModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
            <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-md cursor-pointer" onClick={() => setIsStatusModalOpen(false)}></div>

            <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative z-10 border border-white/50">
              <div className="mb-8">
                <h3 className="text-2xl font-black text-stone-800 tracking-tight">Cập nhật đơn hàng</h3>
                <p className="text-stone-500 font-medium mt-1">
                  Khách hàng: <span className="text-blue-600 font-bold">{activeOrder?.customer_name}</span>
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {ORDER_STATUSES.filter(s => s !== 'Tất cả').map(status => (
                  <label
                    key={status}
                    onClick={() => setNewStatus(status)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${newStatus === status
                      ? 'border-blue-500 bg-blue-50 shadow-[0_4px_20px_rgba(59,130,246,0.15)] transform scale-[1.02]'
                      : 'border-stone-100 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${newStatus === status ? 'border-blue-500' : 'border-stone-300'}`}>
                      {newStatus === status && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}
                    </div>
                    <span className={`font-bold ${newStatus === status ? 'text-blue-700' : 'text-stone-600'}`}>{status}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsStatusModalOpen(false)}
                  className="cursor-pointer flex-1 py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all"
                >
                  Đóng
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="cursor-pointer flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
                >
                  Xác nhận lưu
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}