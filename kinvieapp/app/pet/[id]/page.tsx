"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function PetDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pet, setPet] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);

  // STATE MỚI: CHỨA THÔNG TIN BỐ MẸ
  const [parents, setParents] = useState<{ father: any, mother: any }>({ father: null, mother: null });

  const [isLoading, setIsLoading] = useState(true);

  // STATE CHO MODAL NHẬT KÝ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logType, setLogType] = useState('Tiêm chủng');
  const [logDate, setLogDate] = useState('');
  const [logNote, setLogNote] = useState('');
  const [isSavingLog, setIsSavingLog] = useState(false);

  // HÀM TÍNH TUỔI TỪ CỘT 'birthdate'
  // 🎯 endDateString: nếu bé đã mất, truyền death_date vào đây để tuổi DỪNG LẠI ở ngày mất, không tính đến hiện tại nữa
  const calculateAge = (dobString: string, endDateString?: string | null) => {
    if (!dobString) return 'Chưa cập nhật';
    const dob = new Date(dobString);
    const now = endDateString ? new Date(endDateString) : new Date();
    const diffMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());

    if (diffMonths < 1) return 'Dưới 1 tháng tuổi';
    if (diffMonths < 12) return `${diffMonths} tháng tuổi`;

    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    return `${years} năm ${months > 0 ? `${months} tháng` : ''} tuổi`;
  };

  // 🎯 CẤU HÌNH HIỂN THỊ THEO TÌNH TRẠNG (dùng chung màu/emoji với PET_STATUS_OPTIONS ở trang edit-pet)
  const STATUS_DISPLAY: Record<string, { label: string; emoji: string; className: string }> = {
    'Khỏe mạnh': { label: 'Đang ở nhà', emoji: '🏠', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    'Đang mất tích': { label: 'Đang mất tích', emoji: '📢', className: 'bg-amber-500 text-white border-amber-500' },
    'Đã lên thiên đường mèo': { label: 'Đã lên thiên đường mèo', emoji: '🌈', className: 'bg-stone-700 text-white border-stone-700' },
  };

  const fetchPetData = async () => {
    // 1. Lấy thông tin mèo bằng cột 'petid'
    const { data: petData, error: petError } = await supabase
      .from('pets')
      .select('*')
      .eq('petid', id)
      .maybeSingle();

    if (petError || !petData) {
      alert("Không tìm thấy thông tin Boss!");
      router.push('/profile');
      return;
    }

    // 1.5. LẤY THÔNG TIN MÈO BỐ VÀ MẸ (NẾU CÓ)
    let fatherData = null;
    let motherData = null;

    if (petData.father_id) {
      if (petData.father_source === 'cat') {
        const { data } = await supabase.from('cats').select('id, name, images').eq('id', petData.father_id).maybeSingle();
        fatherData = data ? { petid: data.id, petname: data.name, imageurl: data.images?.[0] } : null;
      } else {
        const { data } = await supabase.from('pets').select('petid, petname, imageurl').eq('petid', petData.father_id).maybeSingle();
        fatherData = data;
      }
    }
    if (petData.mother_id) {
      if (petData.mother_source === 'cat') {
        const { data } = await supabase.from('cats').select('id, name, images').eq('id', petData.mother_id).maybeSingle();
        motherData = data ? { petid: data.id, petname: data.name, imageurl: data.images?.[0] } : null;
      } else {
        const { data } = await supabase.from('pets').select('petid, petname, imageurl').eq('petid', petData.mother_id).maybeSingle();
        motherData = data;
      }
    }

    // 2. Kéo sổ khám bệnh từ bảng 'health_records'
    const { data: recordData } = await supabase
      .from('health_records')
      .select('*')
      .eq('petid', id)
      .order('record_date', { ascending: false });

    setPet(petData);
    setParents({ father: fatherData, mother: motherData }); // Lưu thông tin Bố Mẹ
    setRecords(recordData || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPetData();
  }, [id, router]);

  // HÀM LƯU NHẬT KÝ TỪ MODAL
  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logDate) { alert("Sếp ơi chọn ngày thực hiện đi!"); return; }

    setIsSavingLog(true);

    const { error } = await supabase.from('health_records').insert([
      {
        petid: id,
        record_type: logType,
        record_date: logDate,
        note: logNote.trim()
      }
    ]);

    setIsSavingLog(false);

    if (error) {
      alert("Lỗi lưu nhật ký: " + error.message);
    } else {
      setIsModalOpen(false);
      setLogType('Tiêm chủng');
      setLogDate('');
      setLogNote('');
      fetchPetData();
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Đang lôi sổ y bạ của Boss ra..." />;
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-700 font-sans">
      <Header />

      <main className="pt-32 pb-20 container mx-auto px-4 relative z-10 max-w-4xl">

        {/* Nút Back */}
        <Link href="/profile" className="inline-flex items-center gap-2 text-sm font-bold text-stone-400 hover:text-pink-500 transition-colors mb-6">
          <span>❮</span> Quay lại Hồ sơ
        </Link>

        {/* BAO NGOÀI CÙNG GIỮ NGUYÊN LAYOUT */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-100 overflow-hidden">

          {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
          <div className="p-8 sm:p-12 border-b border-stone-100 relative overflow-hidden">
            <Link href={`/profile/edit-pet/${pet.petid}`} className="absolute top-8 right-8 flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-pink-500 transition-colors bg-white hover:bg-pink-50 px-3 py-2 rounded-xl border border-stone-200 hover:border-pink-200 z-20 shadow-sm">
              <span>✏️</span> Chỉnh sửa
            </Link>

            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

            <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start relative z-10 mt-6 sm:mt-0">
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-pink-100 rounded-full border-4 border-white shadow-md flex items-center justify-center text-6xl overflow-hidden shrink-0">
                {pet.imageurl ? (
                  <img src={pet.imageurl} alt={pet.petname} className="w-full h-full object-cover" />
                ) : (
                  <span>🐱</span>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                  <div className="inline-block px-3 py-1 bg-pink-50 text-pink-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-pink-100">
                    {pet.has_pedigree ? 'KINVIE CATTERY (CÓ PHẢ)' : 'THÚ CƯNG'}
                  </div>
                  {/* 🎯 BADGE TÌNH TRẠNG: Đang ở nhà / Đang mất tích / Đã lên thiên đường mèo */}
                  {pet.status && (
                    <div className={`inline-flex items-center gap-1 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${(STATUS_DISPLAY[pet.status] || STATUS_DISPLAY['Khỏe mạnh']).className}`}>
                      <span>{(STATUS_DISPLAY[pet.status] || STATUS_DISPLAY['Khỏe mạnh']).emoji}</span>
                      {(STATUS_DISPLAY[pet.status] || STATUS_DISPLAY['Khỏe mạnh']).label}
                    </div>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-800 mb-4">{pet.petname}</h1>

                <div className={`grid grid-cols-2 gap-4 text-sm ${pet.status === 'Đã lên thiên đường mèo' && pet.death_date ? 'sm:grid-cols-5' : 'sm:grid-cols-4'}`}>
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
                  {/* 🎯 CHỈ HIỆN "Ngày mất" KHI BÉ ĐÃ LÊN THIÊN ĐƯỜNG VÀ CÓ death_date */}
                  {pet.status === 'Đã lên thiên đường mèo' && pet.death_date && (
                    <div>
                      <p className="text-stone-400 text-xs font-bold uppercase mb-1">Ngày mất</p>
                      <p className="font-medium text-stone-700">{new Date(pet.death_date).toLocaleDateString('vi-VN')}</p>
                    </div>
                  )}
                  <div>
                    {/* 🎯 Nếu đã mất: nhãn đổi thành "Tuổi lúc mất" và tuổi tính dừng lại ở death_date, KHÔNG tính tới hiện tại nữa */}
                    <p className="text-stone-400 text-xs font-bold uppercase mb-1">{pet.status === 'Đã lên thiên đường mèo' ? 'Tuổi lúc mất' : 'Tuổi'}</p>
                    <p className="font-bold text-pink-500">
                      {calculateAge(pet.birthdate, pet.status === 'Đã lên thiên đường mèo' ? pet.death_date : null)}
                    </p>
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

          {/* PHẦN 1.5: CÂY GIA ĐÌNH (PHẢ HỆ) - CHỈ HIỆN KHI CÓ BỐ HOẶC MẸ */}
          {(parents.father || parents.mother) && (
            <div className="p-8 sm:p-12 border-b border-stone-100 relative overflow-hidden bg-white text-center">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#fdf2f8_2px,transparent_2px)] [background-size:20px_20px] opacity-50"></div>
              <h2 className="text-xl font-serif font-bold text-stone-800 mb-8 relative z-10">🌳 Phả hệ gia đình</h2>

              <div className="flex items-center justify-center gap-6 sm:gap-16 relative z-10">
                {/* BỐ */}
                <div className="flex flex-col items-center">
                  <div className="text-[10px] font-black text-blue-400 mb-2 uppercase tracking-widest">Mèo Bố</div>
                  {parents.father ? (
                    <Link href={`/pet/${parents.father.petid}`} className="group relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-50 rounded-full border-4 border-white shadow-md overflow-hidden group-hover:scale-105 transition-transform group-hover:border-blue-200">
                        {parents.father.imageurl ? <img src={parents.father.imageurl} className="w-full h-full object-cover" /> : <span className="text-3xl flex h-full items-center justify-center">🐱</span>}
                      </div>
                      <p className="font-bold text-sm mt-3 text-stone-700 group-hover:text-blue-500 transition-colors">♂ {parents.father.petname}</p>
                    </Link>
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-stone-50 rounded-full border-4 border-dashed border-stone-200 flex items-center justify-center text-xs text-stone-400 font-bold">Chưa rõ</div>
                  )}
                </div>

                {/* ICON NỐI */}
                <div className="text-2xl animate-pulse text-pink-300">❤️</div>

                {/* MẸ */}
                <div className="flex flex-col items-center">
                  <div className="text-[10px] font-black text-pink-400 mb-2 uppercase tracking-widest">Mèo Mẹ</div>
                  {parents.mother ? (
                    <Link href={`/pet/${parents.mother.petid}`} className="group relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-pink-50 rounded-full border-4 border-white shadow-md overflow-hidden group-hover:scale-105 transition-transform group-hover:border-pink-200">
                        {parents.mother.imageurl ? <img src={parents.mother.imageurl} className="w-full h-full object-cover" /> : <span className="text-3xl flex h-full items-center justify-center">🐱</span>}
                      </div>
                      <p className="font-bold text-sm mt-3 text-stone-700 group-hover:text-pink-500 transition-colors">♀ {parents.mother.petname}</p>
                    </Link>
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-stone-50 rounded-full border-4 border-dashed border-stone-200 flex items-center justify-center text-xs text-stone-400 font-bold">Chưa rõ</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PHẦN 2: SỔ THEO DÕI SỨC KHỎE */}
          <div className="p-8 sm:p-12 bg-stone-50/50">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <span className="w-10 h-10 bg-white shadow-sm flex items-center justify-center rounded-xl text-xl border border-stone-100">🏥</span>
                Sổ theo dõi sức khỏe
              </h2>

              <button onClick={() => setIsModalOpen(true)} className="text-sm font-bold text-white bg-pink-500 hover:bg-pink-600 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-pink-200 flex items-center gap-2">
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

      {/* ==========================================
          MODAL (LAYER HIỆN LÊN) ĐỂ NHẬP NHẬT KÝ
          ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm cursor-pointer" onClick={() => setIsModalOpen(false)}></div>

          <div className="bg-white rounded-[2rem] shadow-2xl border border-stone-100 w-full max-w-md relative z-10 overflow-hidden transform transition-all">
            <div className="bg-stone-50 px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-stone-800">Thêm nhật ký sức khỏe</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-rose-500 w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-50 transition-colors font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveLog} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Loại ghi chép</label>
                <select value={logType} onChange={(e) => setLogType(e.target.value)} className="w-full bg-stone-50 border border-stone-200 px-4 py-3.5 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10 transition-all font-bold text-stone-700 cursor-pointer hover:border-pink-300 shadow-sm">
                  <option value="Tiêm chủng">💉 Tiêm chủng</option>
                  <option value="Sổ giun">💊 Sổ giun</option>
                  <option value="Khám bệnh">🩺 Khám bệnh</option>
                  <option value="Khác">📝 Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Ngày thực hiện</label>
                <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} required className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400" />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Ghi chú (Tên thuốc, tình trạng...)</label>
                <textarea value={logNote} onChange={(e) => setLogNote(e.target.value)} rows={3} placeholder="Ví dụ: Vaccine 4 bệnh, Broadline..." className="w-full bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-pink-400 resize-none"></textarea>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isSavingLog} className={`w-full text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center ${isSavingLog ? 'bg-pink-300 cursor-not-allowed shadow-none' : 'bg-pink-500 hover:bg-pink-600 shadow-pink-200'}`}>
                  {isSavingLog ? 'Đang lưu vào sổ...' : 'Lưu Nhật Ký'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}