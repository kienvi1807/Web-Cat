"use client";

import React from 'react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function CatsHubPage() {
  const [counts, setCounts] = useState({
    kinvie: null as number | null,
    breederPending: null as number | null,
    pedigreeMissing: null as number | null,
    healthAlerts: null as number | null,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      const { data: bossUsers } = await supabase.from('users').select('userid').eq('type_id', 1);
      const { data: breederUsers } = await supabase.from('users').select('userid').eq('type_id', 3);
      const bossIds = bossUsers?.map(u => u.userid) || [];
      const breederIds = breederUsers?.map(u => u.userid) || [];

      const { count: kinvieCount } = await supabase
        .from('cats').select('id', { count: 'exact', head: true }).in('breeder_id', bossIds.length ? bossIds : [-1]);

      let breederPendingCount = 0;
      if (breederIds.length) {
        const { data: breederCats } = await supabase.from('cats').select('approval_status').in('breeder_id', breederIds);
        breederPendingCount = (breederCats || []).filter(c => !c.approval_status || c.approval_status === 'Chờ duyệt').length;
      }

      const { data: pedigreeCats } = await supabase.from('cats').select('has_pedigree, father_id, mother_id');
      const pedigreeMissing = (pedigreeCats || []).filter(c => !c.has_pedigree || !c.father_id || !c.mother_id).length;

      const today = new Date().toISOString().split('T')[0];
      const { count: healthAlertCount } = await supabase
        .from('medicalrecords').select('recordid', { count: 'exact', head: true }).lt('nextduedate', today);

      setCounts({
        kinvie: kinvieCount || 0,
        breederPending: breederPendingCount,
        pedigreeMissing,
        healthAlerts: healthAlertCount || 0,
      });
    };
    fetchCounts();
  }, []);

  // 🎯 DANH SÁCH 4 CHỨC NĂNG CHÍNH CỦA CATTERY
  const catModules = [
    {
      name: 'Mèo KinVie Cattery',
      icon: '🦁',
      description: 'Quản lý đàn mèo thuần chủng của trại giống. Thêm mèo mới, cập nhật giá, trạng thái.',
      path: '/dashboard/cats/kinvie',
      color: 'red',
      colorFrom: 'from-red-400',
      colorHoverFrom: 'group-hover:from-red-500',
      labelColor: 'text-red-600 bg-red-50 border-red-200',
      labelText: counts.kinvie === null ? '...' : `${String(counts.kinvie).padStart(2, '0')} bé`
    },
    {
      name: 'Mèo của Breeder',
      icon: '🤝',
      description: 'Kiểm duyệt bài đăng bán mèo của các trại nhân giống đối tác liên kết.',
      path: '/dashboard/cats/breeders',
      color: 'orange',
      colorFrom: 'from-orange-400',
      colorHoverFrom: 'group-hover:from-orange-500',
      labelColor: `text-orange-500 bg-orange-50 border-orange-200${counts.breederPending ? ' animate-pulse' : ''}`,
      labelText: counts.breederPending === null ? '...' : `${counts.breederPending} bài chờ duyệt`
    },
    {
      name: 'Quản lý Phả hệ',
      icon: '🌳',
      description: 'Cập nhật, tra cứu phả hệ (Pedigree) cho từng bé mèo trong trại.',
      path: '/dashboard/cats/pedigree',
      color: 'teal',
      colorFrom: 'from-teal-400',
      colorHoverFrom: 'group-hover:from-teal-500',
      labelColor: `text-teal-500 bg-teal-50 border-teal-200${counts.pedigreeMissing ? ' animate-pulse' : ''}`,
      labelText: counts.pedigreeMissing === null ? '...' : counts.pedigreeMissing > 0 ? `${counts.pedigreeMissing} thiếu phả hệ` : 'Đầy đủ'
    },
    {
      name: 'Sức khỏe & Sinh sản',
      icon: '🏥',
      description: 'Theo dõi lịch tiêm, phối giống, sức khỏe bầy đàn và ca phối giống dự kiến.',
      path: '/dashboard/cats/health',
      color: 'rose',
      colorFrom: 'from-rose-400',
      colorHoverFrom: 'group-hover:from-rose-500',
      labelColor: `text-rose-600 bg-rose-50 border-rose-200${counts.healthAlerts ? ' animate-pulse' : ''}`,
      labelText: counts.healthAlerts === null ? '...' : `${counts.healthAlerts} cảnh báo`
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in max-w-[1300px] mx-auto pb-16">

      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-4xl font-serif font-black text-stone-800 flex items-center justify-center gap-3">
          Quản lý Mèo (Cattery) <span className="text-4xl animate-bounce">😻</span>
        </h1>
        <p className="text-stone-500 mt-2 sm:mt-3 text-sm sm:text-lg">Lựa chọn khu vực làm việc bạn muốn thao tác.</p>
      </div>

      {/* 🎯 KHỐI CONTAINER CHÍNH CÓ HIỆU ỨNG GLASSMORPHISM & LASER */}
      <div className="relative group/section">

        {/* Lớp Hào Quang Tỏa Ra Phía Sau */}
        <div className="absolute -inset-4 bg-gradient-to-r from-red-500/0 via-red-400/10 to-amber-500/0 rounded-[3.5rem] blur-2xl opacity-0 group-hover/section:opacity-100 transition-opacity duration-1000 -z-10"></div>

        {/* Khối Container Kính Mờ */}
        <div className="relative bg-white/60 backdrop-blur-2xl rounded-[1.75rem] sm:rounded-[2.5rem] p-4 sm:p-8 md:p-10 border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-500 hover:border-red-200/80 hover:shadow-[0_8px_50px_rgba(249,115,22,0.1)]">

          {/* Họa tiết Lưới Chấm Bi Mờ */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          {/* Vệt Laser quét ngang viền trên khi hover */}
          <div className="absolute top-0 left-0 w-full h-[3px] opacity-0 group-hover/section:opacity-100 transition-opacity duration-500 overflow-hidden pointer-events-none">
            <div className="w-[100%] h-full bg-gradient-to-r from-transparent via-red-500 to-transparent -translate-x-full group-hover/section:translate-x-full transition-transform duration-[1500ms] ease-in-out"></div>
          </div>

          {/* GRID CHỨA 4 THẺ (CARDS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">

            {catModules.map((item) => (
              <Link href={item.path} key={item.name} className="relative group block h-full">

                {/* Lớp sáng neon tỏa ra từ thẻ con */}
                <div className={`absolute -inset-[2px] bg-gradient-to-b ${item.colorFrom} via-transparent to-transparent rounded-3xl blur-[10px] opacity-20 group-hover:opacity-100 ${item.colorHoverFrom} transition-all duration-500`}></div>
                <div className={`absolute -inset-[1px] bg-gradient-to-b ${item.colorFrom} to-stone-200/50 rounded-3xl z-0`}></div>

                {/* Nội dung thẻ con */}
                <div className="relative h-full bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col items-center text-center z-10 shadow-[0_8px_20px_rgb(0,0,0,0.02)] border border-white">

                  {/* Icon */}
                  <div className="text-4xl sm:text-5xl mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-500 drop-shadow-sm">
                    {item.icon}
                  </div>

                  {/* Tiêu đề */}
                  <h3 className={`text-[16px] font-black ${item.name === 'Mèo của Breeder' ? 'text-orange-700' : `text-${item.color}-600`} mb-2 tracking-wide`}>
                    {item.name}
                  </h3>

                  {/* Mô tả */}
                  <p className="text-xs text-stone-500 mb-3 sm:mb-6 flex-1 leading-relaxed px-1">
                    {item.description}
                  </p>

                  {/* Khu vực Nhãn (Badge) Căn Giữa - Xóa Nút Bấm */}
                  <div className="w-full flex justify-center items-center mt-auto pt-5 border-t border-stone-100/80">
                    <span className={`${item.labelColor} border font-black px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[10px] uppercase tracking-widest shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                      {item.labelText}
                    </span>
                  </div>

                </div>
              </Link>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}