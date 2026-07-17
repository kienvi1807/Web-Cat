"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDateDisplay } from '@/lib/utils';

const RECOMMENDED_REST_DAYS = 240; // 🎯 Khuyến nghị nghỉ 8 tháng giữa 2 lần sinh, có thể chỉnh theo tư vấn bác sĩ thú y
const GESTATION_DAYS = 64; // Thời gian mang thai trung bình của mèo

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default function BreedingLog({ catId, allCatsList }: { catId: number; allCatsList: any[] }) {
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [matingDate, setMatingDate] = useState('');
  const [fatherId, setFatherId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchRecords = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('breeding_records')
      .select('*')
      .eq('mother_id', catId)
      .order('mating_date', { ascending: false });
    if (data) setRecords(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchRecords(); }, [catId]);

  // 🎯 THÊM LỨA MỚI (phối giống)
  const handleAddMating = async () => {
    if (!matingDate) { alert('Chọn ngày phối giống trước đã Sen ơi!'); return; }
    setIsSaving(true);

    const expectedDue = addDays(matingDate, GESTATION_DAYS);

    const { data: { session } } = await supabase.auth.getSession();
    const { data: dbUser } = await supabase.from('users').select('userid').eq('email', session?.user.email).maybeSingle();

    const { error } = await supabase.from('breeding_records').insert({
      mother_id: catId,
      father_id: fatherId,
      mating_date: matingDate,
      expected_due_date: expectedDue,
      status: 'mang_thai',
      created_by: dbUser?.userid || null,
    });

    setIsSaving(false);
    if (!error) {
      setIsFormOpen(false);
      setMatingDate('');
      setFatherId(null);
      fetchRecords();
    } else {
      alert('Có lỗi xảy ra: ' + error.message);
    }
  };

  // 🎯 CẬP NHẬT ĐÃ SINH (nhập ngày đẻ thật + số con)
  const handleMarkBirth = async (recordId: number, birthDate: string, litterSize: number, healthNotes: string) => {
    const { error } = await supabase.from('breeding_records').update({
      actual_birth_date: birthDate,
      litter_size: litterSize,
      health_notes: healthNotes,
      status: 'da_sinh',
    }).eq('id', recordId);

    if (!error) fetchRecords();
    else alert('Có lỗi xảy ra: ' + error.message);
  };

  if (isLoading) return <div className="text-center py-10 text-rose-400 font-bold">Đang tải nhật ký...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-bold text-stone-500">{records.length} lứa đã ghi nhận</p>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black rounded-xl shadow-md transition-colors"
        >
          + Ghi nhận phối giống mới
        </button>
      </div>

      {/* FORM THÊM MỚI */}
      {isFormOpen && (
        <div className="bg-rose-50/70 p-6 rounded-[2rem] border border-rose-100 mb-8 space-y-4">
          <div>
            <label className="block text-xs font-black text-stone-500 uppercase mb-2">Ngày phối giống</label>
            <input type="date" value={matingDate} onChange={e => setMatingDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-rose-200 text-sm font-bold" />
          </div>
          <div>
            <label className="block text-xs font-black text-stone-500 uppercase mb-2">Mèo bố (không bắt buộc)</label>
            <select value={fatherId || ''} onChange={e => setFatherId(e.target.value ? Number(e.target.value) : null)} className="w-full px-4 py-3 rounded-xl border border-rose-200 text-sm font-bold">
              <option value="">-- Chưa rõ / bên ngoài --</option>
              {allCatsList.filter(c => c.gender !== false).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button onClick={handleAddMating} disabled={isSaving} className="w-full py-3 bg-rose-500 text-white font-black rounded-xl disabled:opacity-50">
            {isSaving ? 'Đang lưu...' : 'Lưu lứa mới'}
          </button>
        </div>
      )}

      {/* DANH SÁCH LỨA ĐÃ GHI NHẬN */}
      {records.length === 0 ? (
        <div className="text-center py-16 bg-rose-50/50 rounded-[2rem] border border-rose-100">
          <span className="text-6xl mb-6 inline-block">🐈‍⬛</span>
          <p className="text-rose-500/70 font-bold text-sm">Chưa có lứa đẻ nào được ghi nhận cho bé này.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map(r => {
            const father = allCatsList.find(c => c.id === r.father_id);
            const nextRecommended = addDays(r.actual_birth_date || r.expected_due_date, RECOMMENDED_REST_DAYS);
            return (
              <div key={r.id} className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${r.status === 'da_sinh' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {r.status === 'da_sinh' ? '✓ Đã sinh' : '⏳ Đang mang thai'}
                  </span>
                  <span className="text-xs text-stone-400 font-bold">Phối: {formatDateDisplay(r.mating_date)}</span>
                </div>

                <p className="text-sm font-bold text-stone-700 mb-1">👑 Mèo bố: {father?.name || 'Chưa rõ / bên ngoài'}</p>
                <p className="text-sm font-bold text-stone-700 mb-1">📅 Dự sinh: {formatDateDisplay(r.expected_due_date)}</p>
                {r.actual_birth_date && (
                  <>
                    <p className="text-sm font-bold text-emerald-600 mb-1">🎉 Ngày đẻ thật: {formatDateDisplay(r.actual_birth_date)} — {r.litter_size} bé</p>
                    {r.health_notes && <p className="text-xs text-stone-500 italic mb-1">Ghi chú: {r.health_notes}</p>}
                  </>
                )}
                <p className="text-xs font-black text-rose-500 mt-3 bg-rose-50 inline-block px-3 py-1.5 rounded-lg">
                  💡 Khuyến nghị phối giống lại sớm nhất: {formatDateDisplay(nextRecommended)}
                </p>

                {r.status === 'mang_thai' && (
                  <MarkBirthInline recordId={r.id} onSave={handleMarkBirth} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Form nhỏ nhập ngày đẻ thật khi lứa đã "đến ngày"
function MarkBirthInline({ recordId, onSave }: { recordId: number; onSave: (id: number, date: string, size: number, notes: string) => void }) {
  const [open, setOpen] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [litterSize, setLitterSize] = useState(1);
  const [notes, setNotes] = useState('');

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-4 text-xs font-black text-blue-500 hover:underline">
        ✓ Đánh dấu đã sinh
      </button>
    );
  }

  return (
    <div className="mt-4 p-4 bg-stone-50 rounded-2xl space-y-3">
      <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm" placeholder="Ngày đẻ thật" />
      <input type="number" min={1} value={litterSize} onChange={e => setLitterSize(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm" placeholder="Số con" />
      <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm" placeholder="Ghi chú sức khỏe mẹ/con sau sinh (nếu có)" rows={2} />
      <button
        onClick={() => { if (!birthDate) { alert('Chọn ngày đẻ trước đã!'); return; } onSave(recordId, birthDate, litterSize, notes); }}
        className="w-full py-2 bg-blue-500 text-white text-xs font-black rounded-lg"
      >
        Xác nhận đã sinh
      </button>
    </div>
  );
}