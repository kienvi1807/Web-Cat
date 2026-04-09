"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const PIE_COLORS = ['#f59e0b', '#f97316', '#ef4444', '#8b5cf6', '#10b981', '#3b82f6'];

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  const [rawData, setRawData] = useState({ orders: [] as any[], expenses: [] as any[], users: [] as any[], products: [] as any[] });

  // 🎯 LỌC TỔNG QUAN
  const [pieType, setPieType] = useState<'expense' | 'revenue'>('expense');
  const [dateFilter, setDateFilter] = useState<'this_month' | 'last_month' | 'this_year' | 'last_year' | 'all' | 'custom'>('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 🎯 LỌC CỘT (TREND)
  const [barFilter, setBarFilter] = useState<'3m' | '6m' | '12m' | 'custom'>('3m');
  const [barStartDate, setBarStartDate] = useState('');
  const [barEndDate, setBarEndDate] = useState('');

  const [pieChartData, setPieChartData] = useState<any[]>([]);
  const [barChartData, setBarChartData] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalThu: 0, totalChi: 0, newUsers: 0 });
  const [topProducts, setTopProducts] = useState({ merch: [] as any[], pate: [] as any[] });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (rawData.orders.length > 0 || rawData.expenses.length > 0 || rawData.users.length > 0) {
      processData();
    }
  }, [rawData, pieType, dateFilter, startDate, endDate, barFilter, barStartDate, barEndDate]);

  const fetchData = async () => {
    setIsLoading(true);
    
    // Kéo toàn bộ data (select '*') để không bỏ sót bất kỳ tên cột nào
    const { data: orders } = await supabase.from('orders').select('*').in('orderstatus', ['Đã thanh toán', 'Đã giao hàng']);
    const { data: expenses } = await supabase.from('expenses').select('*');
    const { data: users } = await supabase.from('users').select('*');
    const { data: products } = await supabase.from('products').select('*');

    setRawData({ 
      orders: orders || [], 
      expenses: expenses || [],
      users: users || [],
      products: products || []
    });
    
    setIsLoading(false);
  };

  const isDateInRange = (dateStr: string | null | undefined, filterType: string, customStart: string, customEnd: string) => {
    if (!dateStr) return false;
    if (filterType === 'all') return true;
    
    // Đảm bảo parse Date chuẩn
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false; // Bỏ qua nếu data bị lỗi không phải ngày tháng

    const now = new Date();
    
    if (filterType === 'this_month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (filterType === 'last_month') {
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return d.getMonth() === lastMonth && d.getFullYear() === year;
    }
    if (filterType === 'this_year') return d.getFullYear() === now.getFullYear();
    if (filterType === 'last_year') return d.getFullYear() === now.getFullYear() - 1;
    if (filterType === 'custom') {
      const time = d.getTime();
      const start = customStart ? new Date(customStart).setHours(0, 0, 0, 0) : 0;
      const end = customEnd ? new Date(customEnd).setHours(23, 59, 59, 999) : Infinity;
      return time >= start && time <= end;
    }
    return true;
  };

  const processData = () => {
    let pieResult: Record<string, number> = {};
    let tongThu = 0; let tongChi = 0; let khachMoi = 0;
    let productStats: Record<string, any> = {};

    // 🎯 1. ĐẾM KHÁCH HÀNG (Quét sạch mọi khả năng tên cột)
    khachMoi = rawData.users.filter(u => {
      const uDate = u.createdat || u.created_at || u.createdAt;
      return isDateInRange(uDate, dateFilter, startDate, endDate);
    }).length;

    // 🎯 2. TÍNH DOANH THU & SẢN PHẨM
    const validOrders = rawData.orders.filter(o => {
      const oDate = o.orderdate || o.orderDate || o.created_at || o.createdat || o.createdAt;
      return isDateInRange(oDate, dateFilter, startDate, endDate);
    });
    
    validOrders.forEach(o => {
      tongThu += Number(o.totalamount || 0);
      if (pieType === 'revenue') {
        const cat = o.orderstatus || 'Không rõ';
        pieResult[cat] = (pieResult[cat] || 0) + Number(o.totalamount || 0);
      }

      if (o.items && Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          let cat = item.name?.toLowerCase().includes('pate') ? 'Pate tươi' : 'Hàng hóa';
          const prodDb = rawData.products.find(p => p.id === item.productid);
          if (prodDb && prodDb.category) {
            cat = prodDb.category.toLowerCase().includes('pate') ? 'Pate tươi' : 'Hàng hóa';
          }

          if (!productStats[item.productid]) {
            productStats[item.productid] = { name: item.name, category: cat, qty: 0, rev: 0 };
          }
          productStats[item.productid].qty += Number(item.quantity || 1);
          productStats[item.productid].rev += Number((item.price || 0) * (item.quantity || 1));
        });
      }
    });

    // 🎯 3. TÍNH CHI PHÍ
    rawData.expenses.filter(e => {
      const eDate = e.expense_date || e.expenseDate || e.created_at || e.createdat || e.createdAt;
      return isDateInRange(eDate, dateFilter, startDate, endDate);
    }).forEach(e => {
      tongChi += Number(e.amount || 0);
      if (pieType === 'expense') {
        const cat = e.category || 'Khác';
        pieResult[cat] = (pieResult[cat] || 0) + Number(e.amount || 0);
      }
    });

    // Cập nhật State Tổng quan
    setSummary({ totalThu: tongThu, totalChi: tongChi, newUsers: khachMoi });
    setPieChartData(Object.keys(pieResult).map(key => ({ name: key, value: pieResult[key] })).sort((a, b) => b.value - a.value));

    // Cập nhật State Top Sản phẩm
    const sortedProducts = Object.values(productStats).sort((a, b) => b.qty - a.qty);
    setTopProducts({
      merch: sortedProducts.filter(p => p.category === 'Hàng hóa').slice(0, 3),
      pate: sortedProducts.filter(p => p.category === 'Pate tươi').slice(0, 3)
    });

    // 🎯 4. BIỂU ĐỒ CỘT DÒNG TIỀN
    const now = new Date();
    const barDataMap: Record<string, { name: string, Thu: number, Chi: number, timestamp: number }> = {};
    
    if (barFilter === 'custom' && barStartDate && barEndDate) {
      let start = new Date(barStartDate);
      let end = new Date(barEndDate);
      let current = new Date(start.getFullYear(), start.getMonth(), 1); 
      while (current <= end) {
        const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        barDataMap[monthKey] = { name: `T${current.getMonth() + 1}/${String(current.getFullYear()).slice(2)}`, Thu: 0, Chi: 0, timestamp: current.getTime() };
        current.setMonth(current.getMonth() + 1);
      }
    } else {
      const months = barFilter === '12m' ? 12 : barFilter === '6m' ? 6 : 3;
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        barDataMap[monthKey] = { name: `Tháng ${d.getMonth() + 1}`, Thu: 0, Chi: 0, timestamp: d.getTime() };
      }
    }

    rawData.orders.forEach(o => {
      const oDate = o.orderdate || o.orderDate || o.created_at || o.createdat || o.createdAt;
      if (barFilter === 'custom' && !isDateInRange(oDate, 'custom', barStartDate, barEndDate)) return;
      if (!oDate) return;
      const d = new Date(oDate);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (barDataMap[monthKey]) barDataMap[monthKey].Thu += Number(o.totalamount || 0);
    });

    rawData.expenses.forEach(e => {
      const eDate = e.expense_date || e.expenseDate || e.created_at || e.createdat || e.createdAt;
      if (barFilter === 'custom' && !isDateInRange(eDate, 'custom', barStartDate, barEndDate)) return;
      if (!eDate) return;
      const d = new Date(eDate);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (barDataMap[monthKey]) barDataMap[monthKey].Chi += Number(e.amount || 0);
    });

    setBarChartData(Object.values(barDataMap).sort((a, b) => a.timestamp - b.timestamp));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md border border-stone-200 p-4 rounded-2xl shadow-xl">
          <p className="font-black text-stone-800 mb-2 border-b border-stone-100 pb-2">{label || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-bold flex items-center justify-between gap-4" style={{ color: entry.color }}>
              <span>{entry.name === 'Thu' ? '📈 Doanh thu' : entry.name === 'Chi' ? '📉 Chi phí' : entry.name}:</span>
              <span>{entry.value.toLocaleString()} đ</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 relative overflow-hidden selection:bg-amber-200">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-400/20 mix-blend-multiply filter blur-[120px] animate-blob z-0"></div>
      <div className="fixed top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-400/15 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000 z-0"></div>
      
      <div className="max-w-[1400px] mx-auto px-6 pt-12 relative z-10 animate-fade-in-up">
        
        {/* HEADER SECTION */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <Link 
              href="/dashboard/operations" 
              className="cursor-pointer group inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white text-orange-600 hover:bg-white hover:text-orange-700 px-5 py-2.5 rounded-full font-black text-sm mb-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(249,115,22,0.15)] hover:-translate-y-0.5 active:scale-95 w-fit"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span> Quay lại Vận Hành
            </Link>
            
            <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-orange-800 to-amber-700 tracking-tight drop-shadow-sm flex items-center gap-3">
              Báo cáo & Phân tích 
              <svg className="w-10 h-10 text-orange-600 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            </h1>
            <p className="font-bold text-stone-500 mt-2">Phân tích cơ cấu chi tiêu, sản phẩm bán chạy và xu hướng</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
            <p className="font-black text-stone-400 tracking-widest text-sm uppercase animate-pulse">Đang nạp dữ liệu thống kê...</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* 🎯 PHẦN 1: PIE CHART & METRICS TỔNG QUAN */}
            <div className="bg-white/60 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8">
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6 border-b border-stone-200/50 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-stone-800">Tổng quan Giao dịch</h2>
                  <p className="text-stone-500 font-medium text-sm mt-1">Cơ cấu thu chi và tốc độ tăng trưởng khách hàng.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-stone-100/80 p-1 rounded-2xl flex border border-stone-200">
                    <button onClick={() => setPieType('expense')} className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-black transition-all ${pieType === 'expense' ? 'bg-white text-rose-500 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>📉 Chi Phí</button>
                    <button onClick={() => setPieType('revenue')} className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-black transition-all ${pieType === 'revenue' ? 'bg-white text-emerald-500 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>📈 Doanh Thu</button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select 
                      value={dateFilter} onChange={e => setDateFilter(e.target.value as any)}
                      className="cursor-pointer bg-white border border-stone-200 rounded-2xl px-5 py-2.5 font-bold text-sm text-stone-700 outline-none hover:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all appearance-none pr-10 relative"
                      style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23f97316%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                    >
                      <option value="this_month">Tháng này</option>
                      <option value="last_month">Tháng trước</option>
                      <option value="this_year">Năm nay</option>
                      <option value="last_year">Năm ngoái</option>
                      <option value="all">Tất cả thời gian</option>
                      <option value="custom">Tuỳ chọn ngày...</option>
                    </select>

                    {dateFilter === 'custom' && (
                      <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-2xl p-1 animate-fade-in-up">
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="cursor-text px-3 py-1.5 font-bold text-sm text-stone-700 outline-none rounded-xl hover:bg-stone-50" />
                        <span className="text-stone-300 font-black">→</span>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="cursor-text px-3 py-1.5 font-bold text-sm text-stone-700 outline-none rounded-xl hover:bg-stone-50" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 h-[350px] w-full">
                  {pieChartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-stone-400 font-bold bg-stone-50/50 rounded-3xl border border-dashed border-stone-200">Không có giao dịch trong thời gian này</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={80} outerRadius={130} paddingAngle={5} dataKey="value" stroke="none">
                          {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none" />)}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: 800, fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-[2rem] hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mb-1 flex items-center gap-2"><span className="text-emerald-500">📈</span> Tổng Doanh Thu</p>
                    <h3 className="text-4xl font-black text-stone-800">{summary.totalThu.toLocaleString()} <span className="text-xl text-stone-400">đ</span></h3>
                  </div>
                  
                  <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-[2rem] hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-black text-rose-600/70 uppercase tracking-widest mb-1 flex items-center gap-2"><span className="text-rose-500">📉</span> Tổng Chi Phí</p>
                    <h3 className="text-4xl font-black text-stone-800">{summary.totalChi.toLocaleString()} <span className="text-xl text-stone-400">đ</span></h3>
                  </div>

                  <div className="bg-purple-50/50 border border-purple-100 p-6 rounded-[2rem] hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-black text-purple-600/70 uppercase tracking-widest mb-1 flex items-center gap-2"><span className="text-purple-500">👥</span> Khách hàng đăng ký</p>
                    <h3 className="text-4xl font-black text-stone-800">+{summary.newUsers} <span className="text-xl text-stone-400">tài khoản</span></h3>
                  </div>
                </div>
              </div>
            </div>

            {/* 🎯 PHẦN 2: BẢNG VÀNG SẢN PHẨM (TOP 3) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* TOP HÀNG HÓA */}
              <div className="bg-white/60 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8 hover:-translate-y-1 transition-transform duration-300">
                <h3 className="text-xl font-black text-stone-800 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl">🛍️</span>
                  Top 3 Hàng Hóa Bán Chạy
                </h3>
                {topProducts.merch.length === 0 ? (
                  <p className="text-stone-400 font-bold text-center py-6">Chưa có dữ liệu</p>
                ) : (
                  <div className="space-y-4">
                    {topProducts.merch.map((prod, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-white border border-stone-100 p-4 rounded-2xl shadow-sm">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-stone-200 text-stone-500' : 'bg-orange-100 text-orange-600'}`}>
                          #{idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-stone-800 truncate">{prod.name}</h4>
                          <p className="text-xs font-bold text-emerald-600">{prod.rev.toLocaleString()} đ</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Đã Bán</p>
                          <p className="font-black text-lg text-blue-600">{prod.qty}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* TOP PATE TƯƠI */}
              <div className="bg-white/60 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8 hover:-translate-y-1 transition-transform duration-300">
                <h3 className="text-xl font-black text-stone-800 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center text-xl">🥫</span>
                  Top 3 Pate Tươi Đỉnh Nhất
                </h3>
                {topProducts.pate.length === 0 ? (
                  <p className="text-stone-400 font-bold text-center py-6">Chưa có dữ liệu</p>
                ) : (
                  <div className="space-y-4">
                    {topProducts.pate.map((prod, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-white border border-stone-100 p-4 rounded-2xl shadow-sm">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-stone-200 text-stone-500' : 'bg-orange-100 text-orange-600'}`}>
                          #{idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-stone-800 truncate">{prod.name}</h4>
                          <p className="text-xs font-bold text-emerald-600">{prod.rev.toLocaleString()} đ</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Đã Bán</p>
                          <p className="font-black text-lg text-rose-600">{prod.qty}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 🎯 PHẦN 3: BAR CHART (XU HƯỚNG DÒNG TIỀN) */}
            <div className="bg-white/60 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-stone-200/50 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-stone-800">Xu hướng Dòng Tiền</h2>
                  <p className="text-stone-500 font-medium text-sm mt-1">Biểu đồ so sánh cột Doanh thu và Chi phí.</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <select 
                    value={barFilter} onChange={e => setBarFilter(e.target.value as any)}
                    className="cursor-pointer bg-white border border-stone-200 rounded-2xl px-5 py-2.5 font-bold text-sm text-stone-700 outline-none hover:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all appearance-none pr-10 relative"
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23f97316%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                  >
                    <option value="3m">3 Tháng gần nhất</option>
                    <option value="6m">6 Tháng gần nhất</option>
                    <option value="12m">12 Tháng gần nhất</option>
                    <option value="custom">Tuỳ chọn ngày...</option>
                  </select>

                  {barFilter === 'custom' && (
                    <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-2xl p-1 animate-fade-in-up">
                      <input type="date" value={barStartDate} onChange={e => setBarStartDate(e.target.value)} className="cursor-text px-3 py-1.5 font-bold text-sm text-stone-700 outline-none rounded-xl hover:bg-stone-50" />
                      <span className="text-stone-300 font-black">→</span>
                      <input type="date" value={barEndDate} onChange={e => setBarEndDate(e.target.value)} className="cursor-text px-3 py-1.5 font-bold text-sm text-stone-700 outline-none rounded-xl hover:bg-stone-50" />
                    </div>
                  )}
                </div>
              </div>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontWeight: 700, fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontWeight: 700, fontSize: 12 }} tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${value / 1000}k`} dx={-10} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f5f5f4' }} />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontWeight: 800, fontSize: '12px', paddingBottom: '20px' }} />
                    <Bar dataKey="Chi" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="Thu" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-blob { animation: blob 10s infinite alternate; }
        .animation-delay-2000 { animation-delay: 2s; }
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
      `}} />
    </div>
  );
}