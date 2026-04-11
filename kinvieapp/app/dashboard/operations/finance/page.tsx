"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Danh mục chi phí chuẩn
const EXPENSE_CATEGORIES = [
  '📦 Nhập hàng (Hạt, Pate, Cát...)', 
  '🏥 Y tế & Tiêm phòng', 
  '💡 Vận hành (Điện, Nước, Mặt bằng)', 
  '📢 Marketing & Quảng cáo', 
  '⚙️ Khác'
];

export default function FinancePage() {
  const [isLoading, setIsLoading] = useState(true);
  
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  // State Thêm mới
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', category: EXPENSE_CATEGORIES[0] });

  // 🎯 State cho việc Chỉnh sửa / Xóa dòng chi phí
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', amount: '', category: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    setIsLoading(true);
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('orderid, customer_name, totalamount, orderdate')
        .in('orderstatus', ['Đã thanh toán', 'Đã giao hàng']);

      const { data: expenses } = await supabase.from('expenses').select('*');

      let revenueSum = 0;
      let formattedTransactions: any[] = [];

      if (orders) {
        orders.forEach(order => {
          revenueSum += Number(order.totalamount || 0);
          formattedTransactions.push({
            id: order.orderid,
            type: 'IN', 
            title: `Đơn hàng: ${order.customer_name}`,
            amount: Number(order.totalamount || 0),
            date: order.orderdate || new Date().toISOString(),
            category: 'Doanh thu bán hàng'
          });
        });
      }

      let expenseSum = 0;
      if (expenses) {
        expenses.forEach(exp => {
          expenseSum += Number(exp.amount || 0);
          formattedTransactions.push({
            id: exp.id,
            type: 'OUT', 
            title: exp.title,
            amount: Number(exp.amount || 0),
            date: exp.expense_date,
            category: exp.category
          });
        });
      }

      formattedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setTotalRevenue(revenueSum);
      setTotalExpense(expenseSum);
      setTransactions(formattedTransactions);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amount) return alert("Nhập đủ thông tin sếp ơi!");
    setIsSaving(true);
    const { error } = await supabase.from('expenses').insert([{ title: newExpense.title, amount: Number(newExpense.amount), category: newExpense.category }]);
    setIsSaving(false);
    if (!error) {
      setIsExpenseModalOpen(false);
      setNewExpense({ title: '', amount: '', category: EXPENSE_CATEGORIES[0] });
      fetchFinancialData(); 
    } else alert("Lỗi: " + error.message);
  };

  // 🎯 HÀM CẬP NHẬT CHI PHÍ
  const handleUpdateExpense = async () => {
    if (!editForm.title || !editForm.amount) return alert("Không được để trống thông tin!");
    setIsUpdating(true);
    const { error } = await supabase
      .from('expenses')
      .update({ title: editForm.title, amount: Number(editForm.amount), category: editForm.category })
      .eq('id', editingExpenseId);
    
    setIsUpdating(false);
    if (!error) {
      setEditingExpenseId(null);
      fetchFinancialData();
    } else alert("Lỗi cập nhật: " + error.message);
  };

  // 🎯 HÀM XÓA CHI PHÍ
  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm("Sếp có chắc chắn muốn xóa vĩnh viễn khoản chi này không?")) return;
    setIsUpdating(true);
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    setIsUpdating(false);
    if (!error) {
      setEditingExpenseId(null);
      fetchFinancialData();
    } else alert("Lỗi khi xóa: " + error.message);
  };

  const netProfit = totalRevenue - totalExpense;

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 pb-24 relative overflow-hidden">
      {/* HIỆU ỨNG NỀN */}
      <div className="fixed top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/20 mix-blend-multiply filter blur-[120px] animate-blob z-0"></div>
      <div className="fixed top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000 z-0"></div>
      <div className="fixed bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-emerald-300/20 mix-blend-multiply filter blur-[150px] animate-blob animation-delay-4000 z-0"></div>

      <div className="max-w-[1400px] mx-auto px-6 pt-12 relative z-10 animate-fade-in">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <Link 
              href="/dashboard/operations" 
              className="cursor-pointer group inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white text-emerald-600 hover:bg-white hover:text-emerald-700 px-5 py-2.5 rounded-full font-black text-sm mb-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] hover:-translate-y-0.5 active:scale-95 w-fit"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span> Quay lại Kinh doanh & Vận hành
            </Link>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-emerald-900 to-stone-800 tracking-tight drop-shadow-sm">
              Quản lý Thu/Chi 💸
            </h1>
            <p className="font-medium text-stone-500 mt-2">Theo dõi dòng tiền từ Beam Petshop & KinVie Cattery</p>
          </div>
          
          <button 
            onClick={() => setIsExpenseModalOpen(true)} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-[0_8px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
          >
            Thêm chi phí 💸
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* ... GIỮ NGUYÊN 3 THẺ METRICS NHƯ CŨ ... */}
          <div className="bg-white/80 backdrop-blur-xl border border-stone-200/60 rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl"></div>
            <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Tổng Doanh Thu</p>
            <h2 className="text-4xl font-black text-stone-800">{isLoading ? '...' : totalRevenue.toLocaleString()} <span className="text-xl text-stone-400 font-bold">đ</span></h2>
            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-lg"><span>↗</span> Từ đơn hàng thành công</div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-stone-200/60 rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-400/10 rounded-full blur-2xl"></div>
            <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Tổng Chi Phí</p>
            <h2 className="text-4xl font-black text-stone-800">{isLoading ? '...' : totalExpense.toLocaleString()} <span className="text-xl text-stone-400 font-bold">đ</span></h2>
            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-rose-600 bg-rose-50 w-fit px-3 py-1 rounded-lg"><span>↘</span> Chi phí vận hành & nhập hàng</div>
          </div>

          <div className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-stone-900 to-stone-800' : 'from-rose-900 to-rose-800'} border border-stone-700 rounded-[2rem] p-8 shadow-xl relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Lợi Nhuận Thuần</p>
            <h2 className={`text-4xl font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{isLoading ? '...' : netProfit.toLocaleString()} <span className="text-xl text-stone-500 font-bold">đ</span></h2>
            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-stone-300">Thực nhận sau khi trừ chi phí</div>
          </div>
        </div>

        {/* LỊCH SỬ DÒNG TIỀN */}
        <div className="bg-white/70 backdrop-blur-xl border border-stone-200/60 rounded-[2.5rem] shadow-sm p-8">
          <h2 className="text-xl font-black text-stone-800 mb-8 flex items-center gap-2">📊 Lịch sử Dòng Tiền (Cashflow)</h2>

          {isLoading ? (
             <div className="flex justify-center py-10 opacity-50"><div className="w-8 h-8 border-4 border-stone-300 border-t-stone-800 rounded-full animate-spin"></div></div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-stone-400 font-bold py-10">Chưa có giao dịch thu/chi nào được ghi nhận.</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((t, idx) => {
                const isIncome = t.type === 'IN';
                const isEditing = editingExpenseId === t.id;

                return (
                  <div key={idx} className={`bg-white border rounded-2xl transition-all duration-300 overflow-hidden ${isEditing ? 'border-rose-300 shadow-md ring-4 ring-rose-50' : 'border-stone-100 hover:shadow-md'}`}>
                    
                    {/* 🎯 HEADER CỦA DÒNG (Click để mở nếu là Chi phí) */}
                    <div 
                      onClick={() => {
                        if (!isIncome) {
                          setEditingExpenseId(isEditing ? null : t.id);
                          if (!isEditing) setEditForm({ title: t.title, amount: t.amount.toString(), category: t.category });
                        }
                      }}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 ${!isIncome ? 'cursor-pointer hover:bg-stone-50 group' : ''}`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {isIncome ? '💵' : '💳'}
                        </div>
                        <div>
                          <h3 className="font-bold text-stone-800 text-base flex items-center gap-2">
                            {t.title} 
                            {!isIncome && <span className="text-stone-300 group-hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100">✏️</span>}
                          </h3>
                          <div className="flex items-center gap-2 text-xs font-medium text-stone-500 mt-1">
                            <span className={`px-2 py-0.5 rounded-md ${isIncome ? 'bg-emerald-100/50 text-emerald-700' : 'bg-rose-100/50 text-rose-700'}`}>{t.category}</span>
                            <span>•</span>
                            <span>{new Date(t.date).toLocaleString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 sm:text-right w-full sm:w-auto pl-17 sm:pl-0 flex items-center justify-end gap-4">
                        <p className={`font-black text-xl ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isIncome ? '+' : '-'}{t.amount.toLocaleString()}đ
                        </p>
                        {!isIncome && (
                           <span className={`text-stone-300 transition-transform duration-300 ${isEditing ? 'rotate-180 text-rose-500' : ''}`}>▼</span>
                        )}
                      </div>
                    </div>

                    {/* 🎯 FORM CHỈNH SỬA XỔ XUỐNG */}
                    {isEditing && !isIncome && (
                      <div className="p-6 bg-stone-50/50 border-t border-stone-100 animate-slide-down">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-1 block">Tên khoản chi</label>
                            <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 font-bold text-sm outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400" />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-1 block">Số tiền (VNĐ)</label>
                            <input type="number" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 font-black text-rose-600 text-sm outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400" />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-1 block">Danh mục</label>
                            <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 font-bold text-sm text-stone-700 outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 cursor-pointer">
                              {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-3 justify-end border-t border-stone-200 pt-4">
                          <button onClick={() => handleDeleteExpense(t.id)} disabled={isUpdating} className="px-5 py-2.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-sm transition-all disabled:opacity-50">
                            🗑 Xóa bỏ
                          </button>
                          <button onClick={() => setEditingExpenseId(null)} disabled={isUpdating} className="px-5 py-2.5 bg-stone-100 text-stone-600 hover:bg-stone-200 rounded-xl font-bold text-sm transition-all disabled:opacity-50">
                            Hủy
                          </button>
                          <button onClick={handleUpdateExpense} disabled={isUpdating} className="px-6 py-2.5 bg-stone-900 text-white hover:bg-black rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center gap-2">
                            {isUpdating ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ... MODAL THÊM MỚI GIỮ NGUYÊN ... */}
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsExpenseModalOpen(false)}></div>
            <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative z-10 border border-white/50">
              <div className="mb-8">
                <h3 className="text-2xl font-black text-stone-800 tracking-tight">Ghi nhận Chi Phí 📉</h3>
              </div>
              <div className="space-y-5 mb-8">
                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-2 mb-1 block">Tên khoản chi</label>
                  <input type="text" value={newExpense.title} onChange={e => setNewExpense({...newExpense, title: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-3.5 font-bold text-sm text-stone-800 outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-2 mb-1 block">Số tiền (VNĐ)</label>
                  <input type="number" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-3.5 font-black text-lg text-rose-600 outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-2 mb-1 block">Danh mục</label>
                  <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})} className="w-full bg-stone-50 border border-stone-200 text-stone-700 rounded-2xl px-5 py-3.5 font-bold text-sm outline-none focus:ring-2 focus:ring-rose-400/20 cursor-pointer">
                    {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsExpenseModalOpen(false)} className="flex-1 py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all">Hủy bỏ</button>
                <button onClick={handleAddExpense} disabled={isSaving} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 shadow-lg hover:shadow-rose-500/30 transition-all active:scale-95 disabled:opacity-70">
                  {isSaving ? 'Đang lưu...' : 'Lưu khoản chi'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .animate-slide-down { animation: slideDown 0.3s ease-out forwards; transform-origin: top; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: scaleY(0.95); } to { opacity: 1; transform: scaleY(1); } }
      `}} />
    </div>
  );
}