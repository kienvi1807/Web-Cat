"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PetDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pet, setPet] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // HÀM TÍNH TUỔI TỪ CỘT 'birthdate'
  const calculateAge = (dobString: string) => {
    if (!dobString) return 'Chưa cập nhật';
    const dob = new Date(dobString);
    const now = new Date();
    const diffMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    
    if (diffMonths < 1) return 'Dưới 1 tháng tuổi';
    if (diffMonths < 12) return `${diffMonths} tháng tuổi`;
    
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    return `${years} năm ${months > 0 ? `${months} tháng` : ''} tuổi`;
  };

  useEffect(() => {
    const fetchPetData = async () => {
      // 1. Kéo thông tin Boss theo cột 'petid'
      const { data: petData, error: petError } = await supabase
        .from('pets')
        .select('*')
        .eq('petid', id)
        .single();

      if (petError || !petData) {
        alert("Không tìm thấy thông tin Boss!");
        router.push('/profile');
        return;
      }

      // 2. Kéo sổ khám bệnh từ bảng 'health_records'
      const { data: recordData } = await supabase
        .from('health_records')
        .select('*')
        .eq('petid', id)
        .order('record_date', { ascending: false });

      setPet(petData);
      setRecords(recordData || []);
      setIsLoading(false);
    };

    fetchPetData();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center font-sans">
        <div className="text-4xl text-pink-300 animate-[spin_2s_linear_infinite] mb-4">🐾</div>
        <p className="text-stone-400 font-medium text-sm animate-pulse">Đang lôi sổ y bạ của Boss ra...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-700 font-sans">
      <Header />

      <main className="pt-32 pb-20 container mx-auto px-4 relative z-10 max-w-4xl">
        
        {/* Nút Back */}
        <Link href="/profile" className="inline-flex items-center gap-2 text-sm font-bold text-stone-400 hover:text-pink-500 transition-colors mb-6">
          <span>❮</span> Quay lại Profile
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden">
          
          {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
          <div className="p-8 sm:p-12 border-b border-stone-100 relative overflow-hidden">
            {/* Decor background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start relative z-10">
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-pink-100 rounded-full border-4 border-white shadow-md flex items-center justify-center text-6xl overflow-hidden shrink-0">
                {pet.imageurl ? (
                  <img src={pet.imageurl} alt={pet.petname} className="w-full h-full object-cover" />
                ) : (
                  <span>🐱</span>
                )}
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <div className="inline-block px-3 py-1 bg-pink-50 text-pink-600 text-[10px] font-black uppercase tracking-widest rounded-full mb-3 border border-pink-100">
                  KINVIE CATTERY
                </div>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-800 mb-4">{pet.petname}</h1>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-stone-400 text-xs font-bold uppercase mb-1">Giới tính</p>
                    <p className="font-bold text-stone-700">{pet.gender ? '♂ Đực' : '♀ Cái'}</p>
                  </div>
                  <div>
                    <p className="text-stone-400 text-xs font-bold uppercase mb-1">Giống</p>
                    <p className="font-medium text-stone-700">{pet.breed || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <p className="text-stone-400 text-xs font-bold uppercase mb-1">Ngày sinh</p>
                    <p className="font-medium text-stone-700">{pet.birthdate ? new Date(pet.birthdate).toLocaleDateString('vi-VN') : 'Chưa rõ'}</p>
                  </div>
                  <div>
                    <p className="text-stone-400 text-xs font-bold uppercase mb-1">Tuổi</p>
                    <p className="font-bold text-pink-500">{calculateAge(pet.birthdate)}</p>
                  </div>
                </div>
                
                {pet.description && (
                  <div className="mt-6 p-4 bg-stone-50 rounded-2xl border border-stone-100 text-sm text-stone-600 italic">
                    "{pet.description}"
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PHẦN 2: SỔ THEO DÕI SỨC KHỎE */}
          <div className="p-8 sm:p-12 bg-stone-50/50">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <span className="w-10 h-10 bg-white shadow-sm flex items-center justify-center rounded-xl text-xl border border-stone-100">🏥</span>
                Sổ theo dõi sức khỏe
              </h2>
              
              <button className="text-sm font-bold text-white bg-pink-500 hover:bg-pink-600 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-pink-200 flex items-center gap-2">
                <span>+</span> Thêm nhật ký
              </button>
            </div>

            {records.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-stone-200">
                <span className="text-4xl mb-3 block opacity-50">📋</span>
                <p className="text-stone-400 text-sm">Chưa có ghi chép nào trong sổ y bạ của {pet.petname}.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-pink-100 ml-4 space-y-8 pb-4">
                {records.map((record) => (
                  <div key={record.id} className="relative pl-8">
                    {/* Chấm tròn Timeline */}
                    <div className="absolute w-4 h-4 bg-white border-4 border-pink-400 rounded-full -left-[9px] top-1"></div>
                    
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 hover:border-pink-200 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full 
                          ${record.record_type === 'Tiêm chủng' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                            record.record_type === 'Sổ giun' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 
                            'bg-green-50 text-green-600 border border-green-100'}`}>
                          {record.record_type}
                        </span>
                        <span className="text-xs font-bold text-stone-400">
                          {new Date(record.record_date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-stone-600 text-sm leading-relaxed mt-3">{record.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}