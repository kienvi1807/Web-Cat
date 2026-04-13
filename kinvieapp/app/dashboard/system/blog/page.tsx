"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import BackgroundGlow from '@/components/layout/BackgroundGlow';
import { useLayoutStore } from '@/store/useLayoutStore';
import GlassSelect from '@/components/ui/GlassSelect';

// 🎯 DANH MỤC BLOG CỦA SẾP
const CATEGORIES = [
  'Kiến thức đi Show',
  'Kiến thức về Mèo',
  'Dinh dưỡng & Chăm sóc',
  'Tin tức Cattery',
];

export default function BlogManagementPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // 🎯 STATES CHO TRÌNH SOẠN THẢO (MODAL)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formCoverImage, setFormCoverImage] = useState('');
  
  // Trái tim của bài viết: Mảng chứa các khối (Block)
  const [contentBlocks, setContentBlocks] = useState<{ id: string, type: 'text' | 'image', value: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // 🎯 STATE QUẢN LÝ TRẠNG THÁI UP ẢNH (Hiển thị loading)
  const [isUploading, setIsUploading] = useState<string | null>(null); 

  const setThemeColor = useLayoutStore(state => state.setThemeColor);

  useEffect(() => {
    setThemeColor('blue'); // Tone màu Xanh Blue của mục Blog
    fetchBlogs();
  }, [setThemeColor]);

  const fetchBlogs = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
    if (!error && data) setBlogs(data);
    setIsLoading(false);
  };

  // 🎯 HÀM XỬ LÝ UP ẢNH LÊN SUPABASE STORAGE
  const handleFileUpload = async (file: File, blockId: string | 'cover') => {
    if (!file) return;
    setIsUploading(blockId); // Bật trạng thái đang up cho khối tương ứng
    
    try {
      // Đổi tên file ngẫu nhiên để không bị trùng
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `public/${fileName}`;

      // 1. Đẩy ảnh lên Bucket 'blog-media'
      const { error: uploadError } = await supabase.storage
        .from('blog-media')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Lỗi Upload Supabase:", uploadError);
        throw uploadError;
      }

      // 2. Lấy link công khai của ảnh vừa up
      const { data } = supabase.storage.from('blog-media').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // 3. Gắn link vào Form hoặc Block tương ứng
      if (blockId === 'cover') {
        setFormCoverImage(publicUrl);
      } else {
        setContentBlocks(prev => prev.map(b => b.id === blockId ? { ...b, value: publicUrl } : b));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi tải ảnh lên. Sếp kiểm tra lại quyền Storage (Policies) nhé!");
    } finally {
      setIsUploading(null); // Tắt trạng thái loading
    }
  };


  // 🎯 LOGIC LƯU BÀI VIẾT
  const handleSaveBlog = async () => {
    if (!formTitle.trim()) return alert("Sếp chưa nhập tiêu đề bài viết!");
    if (contentBlocks.length === 0) return alert("Bài viết không được để trống!");
    
    setIsSaving(true);
    const blogData = {
      title: formTitle,
      category: formCategory,
      cover_image: formCoverImage,
      content: contentBlocks,
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('blogs').update(blogData).eq('id', editingId);
        if (error) throw error;
        setBlogs(prev => prev.map(b => b.id === editingId ? { ...b, ...blogData } : b));
      } else {
        const { data, error } = await supabase.from('blogs').insert([blogData]).select();
        if (error) throw error;
        if (data) setBlogs([data[0], ...blogs]);
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu bài viết!");
    }
    setIsSaving(false);
  };

  // 🎯 LOGIC XÓA
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Sếp muốn xóa bài viết "${title}"? Hành động này không thể hoàn tác!`)) return;
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (!error) setBlogs(prev => prev.filter(b => b.id !== id));
  };

  // CÁC HÀM QUẢN LÝ KHỐI
  const addBlock = (type: 'text' | 'image') => setContentBlocks([...contentBlocks, { id: Date.now().toString(), type, value: '' }]);
  const updateBlock = (id: string, newValue: string) => setContentBlocks(contentBlocks.map(b => b.id === id ? { ...b, value: newValue } : b));
  const removeBlock = (id: string) => setContentBlocks(contentBlocks.filter(b => b.id !== id));

  const openEditModal = (blog: any) => {
    setEditingId(blog.id); setFormTitle(blog.title); setFormCategory(blog.category); setFormCoverImage(blog.cover_image || ''); setContentBlocks(blog.content || []); setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingId(null); setFormTitle(''); setFormCategory(CATEGORIES[0]); setFormCoverImage(''); setContentBlocks([{ id: Date.now().toString(), type: 'text', value: '' }]); setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const filteredBlogs = useMemo(() => {
    return blogs.filter(b => {
      const matchCat = filterCategory === 'All' || b.category === filterCategory;
      const matchSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [blogs, filterCategory, searchQuery]);

  const catOptions = [{ value: 'All', label: 'Tất cả danh mục' }, ...CATEGORIES.map(c => ({ value: c, label: c }))];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 relative overflow-hidden selection:bg-blue-200">
      <BackgroundGlow />

      <div className="max-w-[1400px] mx-auto px-6 pt-12 relative z-10 animate-fade-in-up">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <Link href="/dashboard/system" className="cursor-pointer group inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white text-blue-600 hover:bg-white px-5 py-2.5 rounded-full font-black text-sm mb-6 transition-all hover:shadow-md w-fit">
              <span className="transition-transform group-hover:-translate-x-1">←</span> Quay lại Hệ thống
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-blue-600 to-indigo-800 tracking-tight flex items-center gap-3">
              Quản lý Blog <span className="text-blue-500">✍️</span>
            </h1>
            <p className="font-bold text-stone-500 mt-3 text-lg">Soạn thảo bài viết, chia sẻ kiến thức Cattery.</p>
          </div>

          <button onClick={openCreateModal} className="cursor-pointer px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl font-black text-sm shadow-[0_8px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_25px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all flex items-center gap-2 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
            VIẾT BÀI MỚI
          </button>
        </div>

        {/* THANH LỌC */}
        <div className="bg-white/60 backdrop-blur-2xl p-4 md:p-6 rounded-[2rem] border border-blue-100 shadow-sm mb-8 flex flex-col lg:flex-row gap-4 items-center relative z-20">
          <div className="relative flex-1 w-full group">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-blue-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></span>
            <input type="text" placeholder="Tìm tên bài viết..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-14 pr-5 py-4 bg-white/70 border border-stone-200 rounded-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 outline-none font-bold text-stone-800 transition-all" />
          </div>
          <div className="w-full lg:w-64">
            <GlassSelect id="blog-cat-filter" options={catOptions} selectedValue={filterCategory} onChange={setFilterCategory} themeColor="cyan" />
          </div>
        </div>

        {/* LƯỚI BÀI VIẾT */}
        {isLoading ? (
          <div className="py-40 text-center"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div><p className="font-black text-blue-600 animate-pulse uppercase">Đang tải...</p></div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-32 bg-white/40 rounded-[3rem] border border-white"><div className="text-5xl mb-4 opacity-50">📰</div><h3 className="text-2xl font-black text-stone-800">Chưa có bài viết!</h3><p className="text-stone-500 font-medium">Bấm "Viết bài mới" để lên bài đầu tiên nhé sếp.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {filteredBlogs.map((blog) => (
              <div key={blog.id} className="bg-white/80 backdrop-blur-xl border border-white shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-[0_20px_40px_rgba(59,130,246,0.1)] hover:-translate-y-2 transition-all duration-300 flex flex-col">
                <div className="h-48 bg-stone-200 relative overflow-hidden">
                  {blog.cover_image ? (
                    <img src={blog.cover_image} alt="cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 font-black text-xl bg-gradient-to-br from-blue-50 to-indigo-100">KINVIE BLOG</div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase text-blue-600 shadow-sm border border-white">{blog.category}</div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-black text-stone-800 text-lg mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{blog.title}</h3>
                  <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-400">{new Date(blog.created_at).toLocaleDateString('vi-VN')}</span>
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(blog)} className="cursor-pointer w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors" title="Sửa bài"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                      <button onClick={() => handleDelete(blog.id, blog.title)} className="cursor-pointer w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors" title="Xóa bài"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🎯 MODAL SOẠN THẢO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm cursor-pointer" onClick={closeModal}></div>
          
          <div className="relative bg-[#F8F9FA] border border-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-up overflow-hidden">
            
            <div className="p-6 md:p-8 bg-white border-b border-stone-100 flex justify-between items-center shrink-0">
              <h3 className="text-2xl font-black text-blue-600">{editingId ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}</h3>
              <button onClick={closeModal} className="cursor-pointer text-stone-400 hover:text-rose-500 w-10 h-10 flex justify-end items-center"><svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest block mb-2">Tiêu đề bài viết <span className="text-rose-500">*</span></label>
                  <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Nhập tiêu đề thật kêu..." className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 text-base font-bold focus:ring-2 focus:ring-blue-400 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest block mb-2">Danh mục <span className="text-rose-500">*</span></label>
                  <div className="relative z-[110]">
                    <GlassSelect id="modal-cat" options={CATEGORIES.map(c => ({value: c, label: c}))} selectedValue={formCategory} onChange={setFormCategory} themeColor="cyan" />
                  </div>
                </div>

                {/* 🎯 TẢI ẢNH BÌA TỪ MÁY TÍNH */}
                <div>
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest block mb-2">Ảnh Bìa Bài Viết (Cover)</label>
                  <div className="relative group/cover">
                    {formCoverImage ? (
                      <div className="relative w-full h-14 rounded-2xl border border-stone-200 overflow-hidden bg-stone-100 flex items-center justify-between px-2">
                        <img src={formCoverImage} className="h-10 w-16 object-cover rounded-lg" />
                        <span className="text-xs font-bold text-stone-500 truncate px-2">Đã chọn ảnh bìa</span>
                        <button onClick={() => setFormCoverImage('')} className="text-rose-500 font-bold px-2 py-1 hover:bg-rose-50 rounded-lg cursor-pointer">Xóa</button>
                      </div>
                    ) : (
                      <label className="cursor-pointer w-full h-14 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-center text-sm font-bold text-stone-500 hover:border-blue-400 hover:text-blue-500 transition-colors">
                        {isUploading === 'cover' ? '⏳ Đang tải lên...' : '📸 Bấm để Chọn Ảnh Bìa'}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cover')} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* 🎯 TRÌNH SOẠN THẢO KHỐI (BLOCK BUILDER) */}
              <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                <h4 className="font-black text-stone-800 mb-6 flex items-center gap-2">Nội dung bài viết <span className="text-stone-400 text-sm font-medium">(Lắp ghép các khối Text và Ảnh)</span></h4>
                
                <div className="space-y-4 mb-6">
                  {contentBlocks.map((block) => (
                    <div key={block.id} className="relative group border border-stone-200 hover:border-blue-300 rounded-2xl p-4 bg-stone-50/50 transition-colors">
                      <button onClick={() => removeBlock(block.id)} className="cursor-pointer absolute -top-3 -right-3 w-8 h-8 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white shadow-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>

                      {block.type === 'text' ? (
                        <div>
                          <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-1">📝 Đoạn văn bản</div>
                          <textarea 
                            value={block.value} 
                            onChange={(e) => updateBlock(block.id, e.target.value)} 
                            placeholder="Gõ nội dung vào đây... (Có thể xuống dòng thoải mái)"
                            className="w-full bg-transparent outline-none resize-none min-h-[100px] text-stone-700 font-medium leading-relaxed custom-scrollbar"
                          ></textarea>
                        </div>
                      ) : (
                        <div>
                          <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-1">🖼️ Hình ảnh</div>
                          
                          {/* 🎯 TẢI ẢNH VÀO TRONG BÀI VIẾT (BLOCK IMAGE) */}
                          {block.value ? (
                            <div className="relative w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                              <img src={block.value} alt="Preview" className="w-full max-h-[400px] object-contain" />
                              <div className="absolute inset-0 bg-stone-900/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => updateBlock(block.id, '')} className="px-6 py-2 bg-rose-500 text-white rounded-xl font-bold cursor-pointer hover:bg-rose-600">Thay ảnh khác</button>
                              </div>
                            </div>
                          ) : (
                            <label className="cursor-pointer w-full py-12 bg-white border-2 border-dashed border-stone-300 hover:border-indigo-400 rounded-xl flex flex-col items-center justify-center text-stone-400 hover:text-indigo-500 transition-colors">
                              <span className="text-3xl mb-2">📸</span>
                              <span className="font-bold text-sm">
                                {isUploading === block.id ? '⏳ Đang tải ảnh lên máy chủ...' : 'Bấm để Tải ảnh từ máy tính'}
                              </span>
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], block.id)} />
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Các nút Thêm Khối */}
                <div className="flex flex-wrap gap-3 p-4 bg-stone-100 rounded-2xl border border-dashed border-stone-300 justify-center">
                  <button onClick={() => addBlock('text')} className="cursor-pointer px-5 py-2.5 bg-white border border-stone-200 rounded-xl font-black text-sm text-blue-600 hover:shadow-md hover:border-blue-300 transition-all flex items-center gap-2">
                    + Thêm Chữ
                  </button>
                  <button onClick={() => addBlock('image')} className="cursor-pointer px-5 py-2.5 bg-white border border-stone-200 rounded-xl font-black text-sm text-indigo-600 hover:shadow-md hover:border-indigo-300 transition-all flex items-center gap-2">
                    + Chèn Ảnh
                  </button>
                </div>
              </div>

            </div>

            {/* Footer Modal (Nút Lưu) */}
            <div className="p-6 bg-white border-t border-stone-100 shrink-0 flex justify-end gap-4">
              <button onClick={closeModal} className="cursor-pointer px-8 py-4 rounded-2xl font-black text-stone-500 bg-stone-100 hover:bg-stone-200 transition-colors">
                HỦY
              </button>
              <button onClick={handleSaveBlog} disabled={isSaving} className="cursor-pointer px-10 py-4 rounded-2xl font-black text-white bg-blue-500 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50">
                {isSaving ? 'ĐANG LƯU...' : 'LƯU BÀI VIẾT'}
              </button>
            </div>
            
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .animate-fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}