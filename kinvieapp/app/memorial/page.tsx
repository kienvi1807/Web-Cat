"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import VineTimeline from '@/components/memorial/VineTimeline';

export default function MemorialVinePage() {
    const [photos, setPhotos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const [dbUserId, setDbUserId] = useState<number | null>(null);
    const [checkedAuth, setCheckedAuth] = useState(false);

    // 🎯 Pet đang được chọn để lọc dây leo riêng ('all' = xem chung tất cả pet)
    const [selectedPetId, setSelectedPetId] = useState<number | 'all'>('all');

    useEffect(() => {
        const fetchPhotos = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setCheckedAuth(true); setIsLoading(false); return; }

            const { data: dbUser } = await supabase
                .from('users')
                .select('userid')
                .eq('email', user.email)
                .maybeSingle();

            setCheckedAuth(true);
            if (!dbUser) { setIsLoading(false); return; }
            setDbUserId(dbUser.userid);

            const { data, error } = await supabase
                .from('memorial_photos')
                .select('*, memorial_photo_pets(pets(petid, petname, birthdate, status))')
                .eq('status', 'approved')
                .eq('user_id', dbUser.userid)
                .order('taken_date', { ascending: true });
            if (error) console.error('Lỗi tải ảnh kỷ niệm:', error.message);
            if (data) setPhotos(data);
            setIsLoading(false);
        };
        fetchPhotos();
    }, []);

    // 🎯 Danh sách pet duy nhất, gom từ toàn bộ ảnh đã tải
    const petOptions = useMemo(() => {
        const map = new Map<number, string>();
        photos.forEach(photo => {
            (photo.memorial_photo_pets || []).forEach((mp: any) => {
                if (mp.pets?.petid) map.set(mp.pets.petid, mp.pets.petname);
            });
        });
        return Array.from(map.entries()).map(([petid, petname]) => ({ petid, petname }));
    }, [photos]);

    // 🎯 Ảnh đã lọc theo pet đang chọn
    const filteredPhotos = useMemo(() => {
        if (selectedPetId === 'all') return photos;
        return photos.filter(photo =>
            (photo.memorial_photo_pets || []).some((mp: any) => mp.pets?.petid === selectedPetId)
        );
    }, [photos, selectedPetId]);

    const toggleMusic = () => {
        if (!audioRef.current) return;
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play().catch(() => { });
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FFF8FA] to-pink-50/30 text-stone-700 font-sans selection:bg-pink-200">
            <Header />
            <audio ref={audioRef} src="/audio/hoa-ra.mp3" loop />

            <main className="pt-32 pb-24 container mx-auto px-4 max-w-4xl relative z-10">
                <div className="text-center mb-16">
                    <h1 className="text-3xl md:text-4xl font-serif italic font-black text-pink-500 mb-3">🌿 Dây Leo Ký Ức</h1>
                    <p className="text-sm text-stone-400 font-medium max-w-lg mx-auto mb-6">Nơi lưu giữ những khoảnh khắc đáng nhớ của các Boss, được các Sen trân trọng chia sẻ.</p>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        <Link href="/memorial/upload" className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-black text-sm shadow-md hover:from-pink-600 hover:to-rose-600 transition-all">
                            💌 Gửi ảnh kỷ niệm của Sen
                        </Link>
                        <Link href="/profile/memorial" className="px-6 py-3 bg-white border border-pink-200 text-pink-500 rounded-2xl font-black text-sm hover:bg-pink-50 transition-all">
                            📷 Ảnh tôi đã gửi
                        </Link>
                    </div>
                </div>

                {isLoading ? (
                    <p className="text-center text-stone-400 font-bold py-20 animate-pulse">Đang tải ký ức...</p>
                ) : checkedAuth && !dbUserId ? (
                    <div className="bg-white/60 rounded-[2rem] p-16 text-center border border-pink-100">
                        <span className="text-5xl block mb-4">🔒</span>
                        <p className="font-black text-stone-500 mb-4">Sen đăng nhập để xem dây leo ký ức của riêng mình nhé!</p>
                        <Link href="/login" className="inline-block px-6 py-3 bg-pink-500 text-white rounded-full font-bold text-sm">Đăng nhập</Link>
                    </div>
                ) : photos.length === 0 ? (
                    <div className="bg-white/60 rounded-[2rem] p-16 text-center border border-pink-100">
                        <span className="text-5xl block mb-4">🌱</span>
                        <p className="font-black text-stone-500">Sen chưa có ảnh kỷ niệm nào được duyệt cả.</p>
                    </div>
                ) : (
                    <>
                        {/* 🎯 Bộ lọc: xem chung tất cả pet, hoặc riêng từng pet */}
                        {petOptions.length > 0 && (
                            <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
                                <button
                                    onClick={() => setSelectedPetId('all')}
                                    className={`px-4 py-2 rounded-full text-xs font-black transition-all ${selectedPetId === 'all' ? 'bg-pink-500 text-white' : 'bg-white border border-pink-200 text-pink-500'}`}
                                >
                                    🌿 Tất cả Boss
                                </button>
                                {petOptions.map(pet => (
                                    <button
                                        key={pet.petid}
                                        onClick={() => setSelectedPetId(pet.petid)}
                                        className={`px-4 py-2 rounded-full text-xs font-black transition-all ${selectedPetId === pet.petid ? 'bg-pink-500 text-white' : 'bg-white border border-pink-200 text-pink-500'}`}
                                    >
                                        🐾 {pet.petname}
                                    </button>
                                ))}
                            </div>
                        )}

                        {filteredPhotos.length === 0 ? (
                            <div className="bg-white/60 rounded-[2rem] p-16 text-center border border-pink-100">
                                <span className="text-5xl block mb-4">🌱</span>
                                <p className="font-black text-stone-500">Chưa có ảnh kỷ niệm nào của Boss này cả.</p>
                            </div>
                        ) : (
                            <VineTimeline photos={filteredPhotos} />
                        )}
                    </>
                )}
            </main>

            <button
                onClick={toggleMusic}
                className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-white shadow-xl border border-pink-100 flex items-center justify-center text-2xl hover:scale-110 transition-transform"
                title={isPlaying ? 'Tắt nhạc' : 'Bật nhạc "Hoá ra..." - Grey D'}
            >
                {isPlaying ? '🔊' : '🔈'}
            </button>

            <Footer />
        </div>
    );
}