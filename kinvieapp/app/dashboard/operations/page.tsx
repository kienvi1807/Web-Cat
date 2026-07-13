"use client";

import React from 'react';
import Link from 'next/link';

export default function OperationsHubPage() {
  
  // 🎯 DANH SÁCH 4 CHỨC NĂNG VẬN HÀNH CHÍNH (Đã dọn dẹp các biến thừa của nút bấm)
  const operationModules = [
    {
      name: 'Quản lý Đơn hàng',
      icon: '📦',
      description: 'Theo dõi vòng đời đơn hàng. Xử lý đóng gói, giao hàng, và các yêu cầu hoàn/hủy.',
      path: '/dashboard/operations/orders',
      color: 'blue',
      colorFrom: 'from-blue-400',
      colorHoverFrom: 'group-hover:from-blue-500',
      labelColor: 'text-blue-600 bg-blue-50 border-blue-200',
      labelText: '12 Đơn mới'
    },
    {
      name: 'Quản lý Thu/Chi',
      icon: '💸',
      description: 'Kiểm soát dòng tiền. Ghi nhận hóa đơn nhập hàng, chi phí vận hành và tính toán lợi nhuận.',
      path: '/dashboard/operations/finance',
      color: 'emerald',
      colorFrom: 'from-emerald-400',
      colorHoverFrom: 'group-hover:from-emerald-500',
      labelColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      labelText: 'Cập nhật'
    },
    {
      name: 'Quản lý Nhân sự',
      icon: '👥',
      description: 'Danh sách nhân viên, phân ca làm việc, theo dõi chấm công và tính toán lương thưởng.',
      path: '/dashboard/operations/hr',
      color: 'purple',
      colorFrom: 'from-purple-400',
      colorHoverFrom: 'group-hover:from-purple-500',
      labelColor: 'text-purple-600 bg-purple-50 border-purple-200',
      labelText: '5 Nhân sự'
    },
    {
      name: 'Báo cáo & Phân tích',
      icon: '📈',
      description: 'Biểu đồ trực quan thống kê doanh thu, tỷ lệ chuyển đổi khách hàng, top sản phẩm.',
      path: '/dashboard/operations/reports',
      color: 'amber',
      colorFrom: 'from-amber-400',
      colorHoverFrom: 'group-hover:from-amber-500',
      labelColor: 'text-amber-600 bg-amber-50 border-amber-200',
      labelText: 'Xem báo cáo'
    }
  ];

  return (
    <div className="space-y-10 animate-fade-in max-w-[1300px] mx-auto pb-16">
      
      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-black text-stone-800 flex items-center justify-center gap-3">
          Kinh doanh & Vận hành <span className="text-2xl sm:text-4xl animate-pulse">⚙️</span>
        </h1>
        <p className="text-stone-500 mt-2 sm:mt-3 text-sm sm:text-lg">Hệ thống trung tâm kiểm soát doanh thu, đơn hàng và nhân sự.</p>
      </div>

      {/* 🎯 KHỐI CONTAINER CHÍNH CÓ HIỆU ỨNG GLASSMORPHISM & LASER */}
      <div className="relative group/section">
        
        {/* Lớp Hào Quang Tỏa Ra Phía Sau */}
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/0 via-blue-400/10 to-indigo-500/0 rounded-[3.5rem] blur-2xl opacity-0 group-hover/section:opacity-100 transition-opacity duration-1000 -z-10"></div>

        {/* Khối Container Kính Mờ */}
        <div className="relative bg-white/60 backdrop-blur-2xl rounded-[1.75rem] sm:rounded-[2.5rem] p-4 sm:p-8 md:p-10 border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-500 hover:border-blue-200/80 hover:shadow-[0_8px_50px_rgba(59,130,246,0.1)]">

          {/* Họa tiết Lưới Chấm Bi Mờ */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          {/* Vệt Laser quét ngang viền trên khi hover */}
          <div className="absolute top-0 left-0 w-full h-[3px] opacity-0 group-hover/section:opacity-100 transition-opacity duration-500 overflow-hidden pointer-events-none">
             <div className="w-[100%] h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent -translate-x-full group-hover/section:translate-x-full transition-transform duration-[1500ms] ease-in-out"></div>
          </div>

          {/* GRID CHỨA 4 THẺ (CARDS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
            
            {operationModules.map((item) => (
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
                  <h3 className={`text-[16px] font-black text-${item.color}-600 mb-2 tracking-wide`}>
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