"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface BannerManagerProps {
    groupId: number;
    title: string;
    colorClass: string; // ví dụ 'pink', 'orange', 'blue', 'emerald'
}

export default function BannerManager({ groupId, title, colorClass }: BannerManagerProps) {
    const [images, setImages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [draggedId, setDraggedId] = useState<number | null>(null);

    const handleDrop = async (targetId: number) => {
        if (draggedId === null || draggedId === targetId) return;

        const draggedIndex = images.findIndex(img => img.id === draggedId);
        const targetIndex = images.findIndex(img => img.id === targetId);
        if (draggedIndex === -1 || targetIndex === -1) return;

        const newImages = [...images];
        const [movedItem] = newImages.splice(draggedIndex, 1);
        newImages.splice(targetIndex, 0, movedItem);

        setImages(newImages); // Cập nhật UI ngay lập tức
        setDraggedId(null);

        // Lưu lại thứ tự mới xuống DB
        try {
            await Promise.all(
                newImages.map((img, index) =>
                    supabase.from('page_banners').update({ sort_order: index + 1 }).eq('id', img.id)
                )
            );
        } catch (err) {
            console.error('Lỗi lưu thứ tự ảnh:', err);
        }
    };

    const fetchImages = async () => {
        setIsLoading(true);
        const { data } = await supabase
            .from('page_banners')
            .select('*')
            .eq('group_id', groupId)
            .order('sort_order', { ascending: true, nullsFirst: false });
        setImages(data || []);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchImages();
    }, [groupId]);

    // Nén ảnh về webp trước khi upload (giống chuẩn nén ảnh memorial của dự án)
    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxSize = 1600;
                    let { width, height } = img;
                    if (width > height && width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    } else if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => blob ? resolve(blob) : reject('Lỗi nén ảnh'), 'image/webp', 0.85);
                };
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const maxOrder = images.length > 0 ? Math.max(...images.map(i => i.sort_order || 0)) : 0;
            let nextOrder = maxOrder;
            for (const file of Array.from(files)) {
                nextOrder += 1;
                const compressedBlob = await compressImage(file);
                const fileName = `group-${groupId}-${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

                const { error: uploadError } = await supabase.storage
                    .from('page-banners')
                    .upload(fileName, compressedBlob, { contentType: 'image/webp' });

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('page-banners')
                    .getPublicUrl(fileName);

                const { error: insertError } = await supabase.from('page_banners').insert({
                    group_id: groupId,
                    image_url: publicUrlData.publicUrl,
                    sort_order: nextOrder,
                });

                if (insertError) throw insertError;
            }
            await fetchImages();
        } catch (err) {
            console.error('Lỗi upload banner:', err);
            alert('❌ Lỗi khi tải ảnh lên!');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async (id: number, imageUrl: string) => {
        if (!confirm('Xoá ảnh này khỏi banner?')) return;
        try {
            // Xoá file trong Storage (lấy tên file từ cuối URL)
            const fileName = imageUrl.split('/').pop();
            if (fileName) {
                await supabase.storage.from('page-banners').remove([fileName]);
            }
            await supabase.from('page_banners').delete().eq('id', id);
            setImages(prev => prev.filter(img => img.id !== id));
        } catch (err) {
            console.error(err);
            alert('❌ Lỗi khi xoá ảnh!');
        }
    };

    return (
        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-black text-stone-800">{title}</h4>
                <label className={`cursor-pointer px-4 py-2 rounded-full text-xs font-black text-white bg-${colorClass}-500 hover:bg-${colorClass}-600 transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {isUploading ? 'Đang tải...' : '+ Thêm ảnh'}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={isUploading} />
                </label>
            </div>

            {isLoading ? (
                <div className="py-8 text-center text-xs font-bold text-stone-400">Đang tải danh sách ảnh...</div>
            ) : images.length === 0 ? (
                <div className="py-8 text-center text-xs font-bold text-stone-400">Chưa có ảnh nào, bấm &quot;+ Thêm ảnh&quot; để tải lên.</div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((img, index) => (
                        <div
                            key={img.id}
                            draggable
                            onDragStart={() => setDraggedId(img.id)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(img.id)}
                            className={`relative aspect-square rounded-2xl overflow-hidden group border-2 cursor-move transition-all ${draggedId === img.id ? 'opacity-40 border-pink-400' : 'border-stone-200'}`}
                        >
                            <Image src={img.image_url} alt="Banner" fill className="object-cover pointer-events-none" sizes="200px" />
                            <span className="absolute top-2 left-2 w-6 h-6 bg-black/60 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                                {index + 1}
                            </span>
                            <button
                                onClick={() => handleDelete(img.id, img.image_url)}
                                className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}