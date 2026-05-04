"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; 
import BackgroundGlow from '@/components/layout/BackgroundGlow';
import { useLayoutStore } from '@/store/useLayoutStore';
import { formatEmsCode } from '@/lib/utils';

export default function BreedersCatsPage() {
  const [catsList, setCatsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('Tất cả');
  const setThemeColor = useLayoutStore(state => state.setThemeColor);

  useEffect(() => {
    setThemeColor('orange'); // 👈 Ra lệnh chuyển tone Cam
  }, [setThemeColor]);

  // 🎯 HÀM LẤY TÊN TRẠI THÔNG MINH
  const getBreederDisplayName = (b: any) => {
    if (!b) return 'Chưa rõ';
    if (b.type_id === 1) return 'KinVie Cattery';
    // Ưu tiên các cột tên thật, nếu không có mới dùng email/phone
    return b.cattery_name || b.fullname || b.full_name || b.name || b.username || b.email || b.phone || `Đối tác #${b.userid}`;
  };

  // 🎯 FETCH DỮ LIỆU TỪ BACK-END SUPABASE
  useEffect(() => {
    fetchCats();
  }, []);

  const fetchCats = async () => {
    setIsLoading(true);
    
    // BƯỚC 1: Chủ động tìm danh sách ID của các Đối tác (type_id = 3)
    const { data: breederUsers } = await supabase
      .from('users')
      .select('userid')
      .eq('type_id', 3);

    const breederIds = breederUsers?.map(u => u.userid) || [];

    if (breederIds.length === 0) {
      setCatsList([]);
      setIsLoading(false);
      return;
    }

    // BƯỚC 2: Chỉ lấy mèo thuộc về các Đối tác này
    // Sửa thành users(*) để lấy được các cột tên (name, fullname...)
    const { data, error } = await supabase
      .from('cats')
      .select(`
        *,
        users ( * ) 
      `)
      .in('breeder_id', breederIds)
      .order('created_at', { ascending: false });

    if (error) console.error("Lỗi tải dữ liệu mèo:", error);
    else setCatsList(data || []);
    
    setIsLoading(false);
  };

  // 🎯 HÀM XỬ LÝ PHÊ DUYỆT
  const handleApprove = async (e: React.MouseEvent, catId: number, catName: string, breederId: number) => {
    e.preventDefault();
    if (!window.confirm(`Duyệt hiển thị bé mèo ${catName} lên cửa hàng?`)) return;

    // Cập nhật cùng lúc Approval và Status
    const { error } = await supabase.from('cats').update({ 
      approval_status: 'Đã duyệt',
      status: 'Sẵn sàng' // Tự động chuyển trạng thái
    }).eq('id', catId);
    
    if (!error) {
      alert('Đã phê duyệt thành công!');
      await supabase.from('notifications').insert([{
        user_id: breederId,
        title: 'Mèo đã được duyệt',
        content: `Hồ sơ bé mèo ${catName} của trại bạn đã được kiểm duyệt và hiển thị lên cửa hàng.`
      }]);
      fetchCats(); // Refresh lại danh sách
    } else {
      alert('Lỗi phê duyệt: ' + error.message);
    }
  };

  // 🎯 HÀM XỬ LÝ TỪ CHỐI
  const handleReject = async (e: React.MouseEvent, catId: number, catName: string, breederId: number) => {
    e.preventDefault();
    const reason = window.prompt(`Nhập lý do từ chối bé mèo ${catName} để gửi cho Đối tác:`);
    if (reason === null) return; 

    const { error } = await supabase.from('cats').update({ approval_status: 'Từ chối' }).eq('id', catId);
    
    if (!error) {
      alert('Đã từ chối và gửi thông báo cho Đối tác!');
      await supabase.from('notifications').insert([{
        user_id: breederId,
        title: 'Hồ sơ mèo bị từ chối',
        content: `Đơn xin duyệt của bé mèo ${catName} đã bị từ chối. Lý do: ${reason || 'Không đáp ứng đủ tiêu chuẩn hệ thống.'}`
      }]);
      fetchCats();
    } else {
      alert('Lỗi từ chối: ' + error.message);
    }
  };

  const getApprovalStyle = (status: string) => {
    switch(status) {
      case 'Đã duyệt': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'Từ chối': return 'bg-rose-500/10 text-rose-600 border-rose-200';
      case 'Chờ duyệt': default: return 'bg-amber-500/10 text-amber-600 border-amber-200 animate-pulse';
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

  // 🎯 HÀM LẤY MÀU TRẠNG THÁI CHO CARD
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Sẵn sàng': return 'bg-emerald-500 text-white shadow-md'; // Xanh
      case 'Đã cọc': return 'bg-amber-500 text-white shadow-md';     // Vàng
      case 'Đã về nhà mới': return 'bg-rose-500 text-white shadow-md';// Đỏ
      case 'Chưa sẵn sàng': default: return 'bg-stone-800 text-white shadow-md'; // Đen
    }
  };

  const filteredCats = filterStatus === 'Tất cả' 
    ? catsList 
    : catsList.filter(c => c.approval_status === filterStatus);

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto pb-16 relative">
      {/* 🎯 GỌI COMPONENT NỀN THÔNG MINH */}
      <BackgroundGlow />

      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
        <div>
          <Link 
              href="/dashboard/cats" 
              className="cursor-pointer group inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white text-orange-600 hover:bg-white hover:text-orange-700 px-5 py-2.5 rounded-full font-black text-sm mb-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(249,115,22,0.15)] hover:-translate-y-0.5 active:scale-95 w-fit"
            >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span> Quay lại Cattery
          </Link>
          {/* Đã gõ chuẩn unicode chống lỗi tách dấu */}
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-red-900 to-stone-800 tracking-tight drop-shadow-sm">
              Kiểm duyệt đối tác
          </h1>
          <p className="text-stone-500 mt-2">Quản lý và phê duyệt hồ sơ mèo từ các trại giống đối tác.</p>
        </div>

        <div className="flex bg-white rounded-2xl shadow-sm border border-stone-200 p-1.5">
          {['Tất cả', 'Chờ duyệt', 'Đã duyệt', 'Từ chối'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${filterStatus === status ? 'bg-orange-800 text-white shadow-md' : 'text-stone-500 hover:bg-stone-50'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
           <span className="text-4xl animate-spin inline-block mb-4">⚙️</span>
           <p className="text-orange-500 font-bold animate-pulse uppercase tracking-widest text-sm">Đang tải dữ liệu kiểm duyệt...</p>
        </div>
      ) : filteredCats.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-stone-100 shadow-sm">
           <span className="text-5xl inline-block mb-4 opacity-50">📭</span>
           <p className="text-stone-400 font-bold text-lg">Không có bé mèo nào trong danh sách này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {filteredCats.map((cat) => (
            <Link 
              href={`/dashboard/cats/breeders/${cat.id}`} 
              key={cat.id} 
              className="group block relative bg-white p-3 rounded-[2.5rem] border border-stone-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(251,146,60,0.2)] hover:border-orange-300 transition-all duration-500 hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col"
            >
              <div className="relative h-56 rounded-[2rem] overflow-hidden mb-4 bg-stone-100 z-10 shadow-inner shrink-0">
                <img 
                  src={cat.images && cat.images.length > 0 ? cat.images[0] : 'https://via.placeholder.com/500'} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[800ms]" 
                />
                
                <div className="absolute top-4 left-4 z-10">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-widest backdrop-blur-md ${getStatusStyle(cat.status)}`}>
                    {cat.status || 'Chưa sẵn sàng'}
                  </span>
                </div>

                <div className="absolute top-4 right-4 z-10">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-widest border backdrop-blur-xl ${getApprovalStyle(cat.approval_status || 'Chờ duyệt')}`}>
                    {cat.approval_status || 'Chờ duyệt'}
                  </span>
                </div>
              </div>

              <div className="px-3 flex-1 flex flex-col relative z-10">
                <div className="mb-3">
                   <h3 className="text-xl font-black text-stone-800 group-hover:text-orange-600 transition-colors truncate" title={cat.name}>
                     {cat.name} <span className="text-sm">{cat.gender === false ? '♀' : '♂'}</span>
                   </h3>
                   <p className="text-xs font-bold text-stone-500 mt-1 flex items-center gap-1.5 truncate">
                     <span className="text-orange-500">🏠</span> Trại: {getBreederDisplayName(cat.users)}
                   </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-stone-100/80 border border-stone-200 text-stone-600 text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 truncate max-w-[120px]">
                    🧬 {cat.breed}
                  </span>
                  <span className="bg-stone-100/80 border border-stone-200 text-stone-600 text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 truncate max-w-[120px]" title={formatEmsCode(cat.color)}>
                    🎨 {formatEmsCode(cat.color)}
                  </span>
                </div>
                
                <div className="mt-auto pt-3 border-t border-dashed border-stone-200 mb-4">
                  <p className="text-[10px] uppercase font-black text-stone-400 tracking-widest mb-0.5">Giá chuyển nhượng</p>
                  <p className="text-xl font-black text-stone-800">
                    {formatPrice(cat.price)}<span className="text-xs font-bold text-stone-500 ml-1">đ</span>
                  </p>
                </div>

                {(cat.approval_status === 'Chờ duyệt' || !cat.approval_status) && (
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <button 
                      onClick={(e) => handleReject(e, cat.id, cat.name, cat.breeder_id)}
                      className="cursor-pointer py-2.5 rounded-xl text-xs font-black text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white transition-colors border border-rose-100"
                    >
                      ✕ Từ Chối
                    </button>
                    <button 
                      onClick={(e) => handleApprove(e, cat.id, cat.name, cat.breeder_id)}
                      className="cursor-pointer py-2.5 rounded-xl text-xs font-black text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20"
                    >
                      ✓ Phê Duyệt
                    </button>
                  </div>
                )}
                
                {cat.approval_status === 'Đã duyệt' && (
                  <button onClick={(e) => handleReject(e, cat.id, cat.name, cat.breeder_id)} className="cursor-pointer w-full mt-auto py-2 rounded-xl text-xs font-bold text-stone-400 bg-stone-50 hover:bg-rose-50 hover:text-rose-500 transition-colors">
                    Hủy duyệt & Gỡ xuống
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}