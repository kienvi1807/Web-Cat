"use client";

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

function MemorialCard({ photo, index }: { photo: any; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const isLeft = index % 2 === 0;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
            { threshold: 0.15 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    const catNames = (photo.memorial_photo_pets || []).map((mp: any) => mp.pets?.petname).filter(Boolean);

    return (
        <div
            ref={ref}
            className={`relative w-full md:w-1/2 ${isLeft ? 'md:pr-12 md:mr-auto' : 'md:pl-12 md:ml-auto'} mb-10 transition-all duration-700 motion-reduce:transition-none ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 motion-reduce:opacity-100 motion-reduce:translate-y-0'
                }`}
        >
            <div className="bg-white rounded-[2rem] shadow-lg border border-pink-50 overflow-hidden">
                <img src={photo.image_url} loading="lazy" className="w-full h-64 object-cover" alt={catNames.join(', ') || 'Kỷ niệm'} />
                <div className="p-5">
                    {catNames.length > 0 && <p className="text-xs font-black text-pink-500 mb-1.5">🐾 Boss {catNames.join(', ')}</p>}
                    {photo.caption && <p className="text-sm text-stone-600 mb-2">{photo.caption}</p>}
                    <p className="text-[11px] text-stone-400 font-bold">{new Date(photo.taken_date).toLocaleDateString('vi-VN')}</p>
                </div>
            </div>
        </div>
    );
}

export default function MemorialVinePage() {
    const [photos, setPhotos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const fetchPhotos = async () => {
            const { data } = await supabase
                .from('memorial_photos')
                .select('*, memorial_photo_cats(cats(id, name))')
                .eq('status', 'approved')
                .order('taken_date', { ascending: true });
            if (data) setPhotos(data);
            setIsLoading(false);
        };
        fetchPhotos();
    }, []);

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
                ) : photos.length === 0 ? (
                    <div className="bg-white/60 rounded-[2rem] p-16 text-center border border-pink-100">
                        <span className="text-5xl block mb-4">🌱</span>
                        <p className="font-black text-stone-500">Chưa có ảnh kỷ niệm nào được duyệt cả.</p>
                    </div>
                ) : (
                    <div className="relative flex flex-col md:block">
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-200 via-pink-300 to-pink-200 -translate-x-1/2 rounded-full"></div>
                        {photos.map((photo, index) => (
                            <MemorialCard key={photo.id} photo={photo} index={index} />
                        ))}
                    </div>
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