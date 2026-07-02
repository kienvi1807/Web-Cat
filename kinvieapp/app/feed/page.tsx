"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import Link from 'next/link';

// ==========================================
// COMPONENT 1: THẺ BÀI VIẾT (POST CARD)
// ==========================================
function PostCard({ post, currentUser, onDelete }: { post: any, currentUser: any, onDelete: (id: number) => void }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  
  // 🎯 THÊM STATE ĐẾM SỐ BÌNH LUẬN
  const [commentsCount, setCommentsCount] = useState(0);
  
  // 🎯 STATE QUẢN LÝ XEM THÊM CHỮ
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  // 🎯 MỚI: STATE QUẢN LÝ BÌNH LUẬN TRẢ LỜI & PHÂN TRANG
  const [replyingTo, setReplyingTo] = useState<{id: number, name: string} | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [expandedReplyIds, setExpandedReplyIds] = useState<number[]>([]);

  const isOwner = currentUser && currentUser.userid === post.user_id;

  // 🎯 HÀM XÓA BÌNH LUẬN
  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("Sen chắc chắn muốn xóa bình luận này chứ?")) return;

    try {
      // 1. Xóa dưới Database
      const { error } = await supabase.from('post_comments').delete().eq('id', commentId);
      if (error) throw error;

      // 2. Cập nhật lại giao diện (Xóa luôn cả bình luận con nếu đang xóa bình luận cha)
      setComments(prev => prev.filter(c => c.id !== commentId && c.parent_id !== commentId));
      
      // 3. Trừ đi số đếm (Trừ đi số lượng bình luận vừa bị xóa)
      const removedCount = comments.filter(c => c.id === commentId || c.parent_id === commentId).length;
      setCommentsCount(prev => Math.max(0, prev - removedCount));
      
    } catch (error) {
      alert("Lỗi khi xóa bình luận!");
    }
  };

  // EFFECT ĐO CHIỀU CAO CHỮ
  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        setIsOverflowing(textRef.current.scrollHeight > textRef.current.clientHeight);
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [post.content]);

  // 🎯 GOM CHUNG LẤY LIKE VÀ LẤY SỐ BÌNH LUẬN VÀO 1 CHỖ
  useEffect(() => {
    const fetchStats = async () => {
      // 1. Lấy Like
      const { data: likesData } = await supabase.from('post_likes').select('user_id').eq('post_id', post.id);
      if (likesData) {
        setLikesCount(likesData.length);
        if (currentUser) setIsLiked(likesData.some(like => like.user_id === currentUser.userid));
      }

      // 2. Đếm tổng số bình luận (Dùng exact count cho nhẹ, không kéo text về)
      const { count } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);
      if (count !== null) setCommentsCount(count);
    };
    fetchStats();
  }, [post.id, currentUser]);

  const handleLike = async () => {
    if (!currentUser) return alert("Sen vui lòng đăng nhập để thả tim nhé!");
    const newLikeState = !isLiked;
    setIsLiked(newLikeState);
    setLikesCount(prev => newLikeState ? prev + 1 : prev - 1);

    if (newLikeState) {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: currentUser.userid });
    } else {
      await supabase.from('post_likes').delete().match({ post_id: post.id, user_id: currentUser.userid });
    }
  };

  const loadComments = async () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      const { data } = await supabase
        .from('post_comments')
        .select('*, users(cattery_name, fullname, avatarurl)')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
      if (data) setComments(data);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newComment.trim()) return;

    // 🎯 THÊM PARENT_ID VÀO DATA NẾU ĐANG TRẢ LỜI
    const commentData = { 
      post_id: post.id, 
      user_id: currentUser.userid, 
      content: newComment.trim(),
      parent_id: replyingTo ? replyingTo.id : null 
    };

    const optimisticComment = {
      ...commentData, id: Date.now(),
      users: { fullname: currentUser.cattery_name || currentUser.fullname || 'Bạn', avatarurl: currentUser.avatarurl },
      created_at: new Date().toISOString()
    };
    
    setComments([...comments, optimisticComment]);
    setNewComment('');
    setReplyingTo(null); // Reset lại trạng thái sau khi gửi

    await supabase.from('post_comments').insert(commentData);
    setCommentsCount(prev => prev + 1);
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Sen chắc chắn muốn xóa bài viết này chứ?")) return;
    try {
      await supabase.from('posts').delete().eq('id', post.id);
      onDelete(post.id);
    } catch (error) {
      alert("Không thể xóa bài viết!");
    }
  };

  const authorAvatar = post.users?.avatarurl || 'https://ui-avatars.com/api/?name=Sen&background=fce7f3&color=db2777';
  const authorName = post.users?.cattery_name || post.users?.fullname || 'Khách ẩn danh';
  const taggedPets = post.post_pets?.map((pp: any) => pp.pets).filter(Boolean) || [];

  // 🎯 LOGIC GOM BÌNH LUẬN CHA - CON
  const topLevelComments = comments.filter(c => !c.parent_id); // Bình luận gốc
  const displayedComments = showAllComments ? topLevelComments : topLevelComments.slice(0, 5); // Cắt 5 cái nếu chưa bấm Xem thêm
  const hiddenCommentsCount = topLevelComments.length - 5;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-pink-50 overflow-hidden mb-6 hover:shadow-md transition-shadow relative">
      <div className="flex flex-col p-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
              <img src={authorAvatar} alt="avatar" className="w-12 h-12 rounded-full object-cover border-2 border-pink-100" />
              <div>
                <h4 className="font-bold text-stone-800">{authorName}</h4>
                <span className="text-xs text-stone-400">{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
          </div>
          {isOwner && (
            <button onClick={handleDeletePost} className="w-9 h-9 flex items-center justify-center text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          )}
        </div>
        
        {taggedPets.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-1 mb-2">
            <span className="text-xs text-stone-400">Cùng với:</span>
            {taggedPets.map((pet: any) => (
              <Link href={`/pet/${pet.petid}`} key={pet.petid} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-bold border border-pink-100 hover:bg-pink-100 transition">
                <img src={pet.imageurl || 'https://ui-avatars.com/api/?name=Cat'} className="w-4 h-4 rounded-full object-cover" alt="pet" />
                {pet.petname}
              </Link>
            ))}
          </div>
        )}
      </div>

      {post.content && (
        <div className="px-5 pb-3">
          <p 
            ref={textRef}
            className={`text-sm text-stone-700 whitespace-pre-wrap break-words transition-all duration-300 ${!isExpanded ? 'line-clamp-1' : ''}`}
          >
            {post.content}
          </p>
          {isOverflowing && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-stone-400 font-medium text-[13px] mt-1 hover:text-stone-600 transition-colors"
            >
              {isExpanded ? 'Thu gọn' : 'Xem thêm...'}
            </button>
          )}
        </div>
      )}
      
      {post.image_url && (
        <div className="relative w-full border-y border-stone-100 bg-stone-900 flex items-center justify-center max-h-[75vh] overflow-hidden">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center blur-2xl opacity-50 scale-110"
            style={{ backgroundImage: `url(${post.image_url})` }}
          ></div>
          <img 
            src={post.image_url} 
            alt="Post" 
            className="relative z-10 w-full h-auto max-h-[75vh] object-contain drop-shadow-2xl" 
          />
        </div>
      )}

      <div className="flex items-center justify-between p-4 px-6 border-b border-stone-50">
        <div className="flex items-center gap-6">
          <button onClick={handleLike} className="flex items-center gap-2 group">
            <svg className={`w-7 h-7 transition-transform group-active:scale-75 ${isLiked ? 'text-pink-500 fill-current scale-110' : 'text-stone-400 hover:text-pink-400'}`} fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isLiked ? 0 : 2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            <span className={`font-bold ${isLiked ? 'text-pink-500' : 'text-stone-500'}`}>{likesCount > 0 ? likesCount : 'Thích'}</span>
          </button>
          <button onClick={loadComments} className="flex items-center gap-2 text-stone-400 hover:text-blue-400 group">
            <svg className="w-7 h-7 transition-transform group-active:scale-75" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <span className="font-bold text-stone-500">
              {/* 🎯 NẾU CÓ BÌNH LUẬN THÌ HIỆN SỐ (VD: "2"), CHƯA CÓ THÌ HIỆN CHỮ "Bình luận" */}
              {commentsCount > 0 ? commentsCount : 'Bình luận'}
            </span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="p-5 bg-stone-50/50">
          
          {/* NÚT XEM THÊM NẾU > 5 BÌNH LUẬN GỐC */}
          {!showAllComments && hiddenCommentsCount > 0 && (
             <button onClick={() => setShowAllComments(true)} className="text-[13px] font-bold text-stone-400 hover:text-stone-600 mb-4 inline-block">
               Xem thêm {hiddenCommentsCount} bình luận...
             </button>
          )}

          <div className="space-y-5 mb-4 max-h-80 overflow-y-auto custom-scrollbar">
            {displayedComments.map((cmt) => {
              // 🎯 TÌM BÌNH LUẬN CON (REP) CỦA BÌNH LUẬN NÀY
              const replies = comments.filter(c => c.parent_id === cmt.id);
              const commenterName = cmt.users?.cattery_name || cmt.users?.fullname || 'Khách';

              // 🌟 LOGIC MỚI: TÍNH TOÁN HIỂN THỊ 3 BÌNH LUẬN CON
              const isReplyExpanded = expandedReplyIds.includes(cmt.id);
              const displayedReplies = isReplyExpanded ? replies : replies.slice(0, 3);
              const hiddenRepliesCount = replies.length - 3;

              return (
                <div key={cmt.id} className="flex flex-col gap-2">
                  
                  {/* BÌNH LUẬN CHA */}
                  <div className="flex gap-3">
                    <img src={cmt.users?.avatarurl || 'https://ui-avatars.com/api/?name=U&background=f3f4f6'} className="w-8 h-8 rounded-full border border-stone-200 shrink-0" alt="avt" />
                    <div>
                      <div className="bg-white px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm border border-stone-100 w-max max-w-full">
                        <p className="text-xs font-bold text-stone-800 mb-0.5">{commenterName}</p>
                        <p className="text-sm text-stone-600">{cmt.content}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 ml-2">
                        <span className="text-[10px] font-medium text-stone-400">{new Date(cmt.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                        <button 
                          onClick={() => setReplyingTo({id: cmt.id, name: commenterName})} 
                          className="text-[11px] font-bold text-stone-500 hover:text-pink-500"
                        >
                          Trả lời
                        </button>
                        
                        {/* 🌟 NÚT XÓA BÌNH LUẬN CHA (Chỉ hiện nếu đúng là chủ cmt) */}
                        {currentUser && currentUser.userid === cmt.user_id && (
                          <button 
                            onClick={() => handleDeleteComment(cmt.id)}
                            className="text-[11px] font-bold text-stone-400 hover:text-rose-500"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* DANH SÁCH BÌNH LUẬN CON (THỤT VÀO TRONG) */}
                  {replies.length > 0 && (
                    <div className="pl-11 space-y-3 mt-1">
                      
                      {/* Dùng displayedReplies thay vì replies */}
                      {displayedReplies.map(reply => (
                        <div key={reply.id} className="flex gap-2 items-start">
                          <img src={reply.users?.avatarurl || 'https://ui-avatars.com/api/?name=R&background=f3f4f6'} className="w-6 h-6 rounded-full border border-stone-200 shrink-0" alt="avt" />
                          <div>
                            <div className="bg-stone-100/80 px-3 py-2 rounded-2xl rounded-tl-none border border-stone-100 w-max max-w-full">
                              <p className="text-[11px] font-bold text-stone-800 mb-0.5">{reply.users?.cattery_name || reply.users?.fullname || 'Khách'}</p>
                              <p className="text-[13px] text-stone-600">{reply.content}</p>
                            </div>
                            <span className="text-[10px] font-medium text-stone-400 mt-1 ml-2 block">
                              {new Date(reply.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* 🌟 NÚT XEM THÊM BÌNH LUẬN CON (NẰM NGAY DƯỚI BÌNH LUẬN THỨ 3) */}
                      {!isReplyExpanded && hiddenRepliesCount > 0 && (
                        <button 
                          onClick={() => setExpandedReplyIds(prev => [...prev, cmt.id])}
                          className="text-[11px] font-bold text-stone-400 hover:text-stone-600 flex items-center gap-1.5 mt-2 ml-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                          Xem thêm {hiddenRepliesCount} câu trả lời...
                        </button>
                      )}

                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* KHUNG NHẬP BÌNH LUẬN */}
          {currentUser && (
            <div className="relative mt-2">
              {replyingTo && (
                <div className="flex items-center justify-between bg-pink-50/50 px-4 py-2 rounded-t-2xl border-b border-pink-100 text-[12px]">
                  <span className="text-stone-500">Đang trả lời <strong className="text-pink-600">{replyingTo.name}</strong></span>
                  <button onClick={() => setReplyingTo(null)} className="text-stone-400 hover:text-rose-500 font-bold">✕ Hủy</button>
                </div>
              )}
              <form onSubmit={handleSendComment} className={`flex items-center gap-3 bg-white p-2 border border-stone-200 shadow-sm ${replyingTo ? 'rounded-b-2xl' : 'rounded-full'}`}>
                {!replyingTo && <img src={currentUser.avatarurl || 'https://ui-avatars.com/api/?name=Me'} className="w-8 h-8 rounded-full border border-pink-100" alt="me" />}
                <input 
                  type="text" 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  placeholder={replyingTo ? `Viết câu trả lời...` : "Khen Boss một câu đi Sen..."} 
                  className="flex-1 bg-transparent border-none px-2 py-1 text-sm focus:outline-none focus:ring-0 placeholder:text-stone-400" 
                />
                <button type="submit" disabled={!newComment.trim()} className="w-9 h-9 flex items-center justify-center text-white bg-pink-500 disabled:bg-stone-300 rounded-full transition-colors shrink-0">
                  <svg className="w-4 h-4 ml-[-2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ==========================================
// COMPONENT CHÍNH: TRANG FEED VÀ ĐĂNG BÀI
// ==========================================
export default function CommunityFeedPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [myPets, setMyPets] = useState<any[]>([]); // 🎯 MỚI: Chứa danh sách mèo của người dùng
  const [selectedPets, setSelectedPets] = useState<number[]>([]); // 🎯 MỚI: Mèo được chọn để tag
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      let userId = null;
      
      if (session) {
        const { data: dbUser } = await supabase.from('users').select('*').eq('email', session.user.email).single();
        if (dbUser) {
          setCurrentUser(dbUser);
          userId = dbUser.userid;
          
          // Lấy danh sách mèo của user
          const { data: petsData } = await supabase.from('pets').select('*').eq('ownerid', userId);
          if (petsData) setMyPets(petsData);
        }
      }

      // 🎯 JOIN bảng post_pets để lấy thông tin mèo được tag
      const { data } = await supabase
        .from('posts')
        .select(`
          *,
          users(cattery_name, fullname, avatarurl),
          post_pets(pets(petid, petname, imageurl))
        `)
        .order('created_at', { ascending: false });
      
      if (data) setPosts(data);
    };
    initData();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  const togglePetSelection = (petId: number) => {
    setSelectedPets(prev => 
      prev.includes(petId) ? prev.filter(id => id !== petId) : [...prev, petId]
    );
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewCaption('');
    handleRemoveImage();
    setSelectedPets([]); // Xóa tag khi đóng
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || (!newCaption.trim() && !imageFile)) return;

    setIsPosting(true);
    let uploadedImageUrl = null;

    if (imageFile) {
      try {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `user_${currentUser.userid}/${fileName}`;
        await supabase.storage.from('feed_images').upload(filePath, imageFile);
        uploadedImageUrl = supabase.storage.from('feed_images').getPublicUrl(filePath).data.publicUrl;
      } catch (error) {
        alert("Có lỗi xảy ra khi tải ảnh lên!");
        setIsPosting(false);
        return;
      }
    }

    const postData = { user_id: currentUser.userid, content: newCaption.trim(), image_url: uploadedImageUrl };
    
    // 1. Tạo bài viết
    const { data: newPost, error: postError } = await supabase.from('posts').insert(postData).select('*, users(cattery_name, fullname, avatarurl)').single();
    
    if (postError) {
      alert("Lỗi lưu bài viết: " + postError.message);
      setIsPosting(false);
      return;
    }

    // 2. Lưu Tags vào bảng post_pets nếu có chọn mèo
    let attachedPets: any[] = [];
    if (selectedPets.length > 0) {
      const petTags = selectedPets.map(petId => ({ post_id: newPost.id, pet_id: petId }));
      await supabase.from('post_pets').insert(petTags);
      
      // Xây dựng cục data ảo để nối vào bài viết vừa tạo cho nó hiện lên ngay lập tức
      attachedPets = selectedPets.map(id => {
        const petObj = myPets.find(p => p.petid === id);
        return { pets: { petid: petObj.petid, petname: petObj.petname, imageurl: petObj.imageurl } };
      });
    }

    // Gắn mảng tag ảo vào bài viết để render
    const completePost = { ...newPost, post_pets: attachedPets };
    setPosts([completePost, ...posts]); 
    handleCloseModal(); 
    setIsPosting(false);
  };

  const handleRemovePostFromUI = (deletedPostId: number) => {
    setPosts(posts.filter(post => post.id !== deletedPostId));
  };

  return (
    <div className="min-h-screen bg-[#FFF8FA] pt-24 pb-20">
      <Header />
      <main className="container mx-auto px-4 max-w-2xl relative">
        <div className="mb-8 mt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-pink-100 text-pink-500 text-xs font-black uppercase tracking-widest mb-3 shadow-sm">
            <img src="images/logo.jpg" alt="KinVie Logo" className="w-8 h-8 rounded-full object-cover border border-pink-100 shadow-sm" />
            Cộng đồng KinVie
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 tracking-tight drop-shadow-sm pb-1">
            Góc Khoe Boss
          </h1>
        </div>

        {/* THANH BAR THU GỌN */}
        <div className="bg-white rounded-full shadow-sm border border-stone-200 p-2 pl-3 mb-8 flex items-center gap-3">
          {currentUser ? (
            <>
              <img src={currentUser.avatarurl || 'https://ui-avatars.com/api/?name=Me'} className="w-10 h-10 rounded-full object-cover" alt="avt" />
              <button onClick={() => setIsModalOpen(true)} className="flex-1 bg-stone-100 hover:bg-stone-200 rounded-full py-2.5 px-4 text-left text-stone-500 text-sm font-medium">
                Sen ơi, Boss nhà bạn hôm nay thế nào?
              </button>
            </>
          ) : (
             <div className="w-full flex items-center justify-between px-4 py-2">
              <span className="text-stone-500 text-sm font-medium">Đăng nhập để khoe Boss nhé!</span>
              <Link href="/login" className="px-5 py-1.5 bg-pink-500 text-white text-sm font-bold rounded-full hover:bg-pink-600 transition-colors">Đăng Nhập</Link>
            </div>
          )}
        </div>

        {/* MODAL ĐĂNG BÀI */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm cursor-pointer" onClick={handleCloseModal}></div>
            <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between p-4 border-b border-stone-100">
                <div className="w-8"></div>
                <h3 className="text-lg font-black text-stone-800">Tạo bài viết</h3>
                <button onClick={handleCloseModal} className="w-8 h-8 flex items-center justify-center bg-stone-100 rounded-full hover:bg-stone-200">✕</button>
              </div>

              <form onSubmit={handleCreatePost} className="p-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-3 mb-4">
                  <img src={currentUser.avatarurl || 'https://ui-avatars.com/api/?name=Me'} className="w-10 h-10 rounded-full object-cover" alt="avt" />
                  <span className="font-bold text-stone-800">{currentUser.cattery_name || currentUser.fullname}</span>
                </div>

                <textarea 
                  value={newCaption} onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Chia sẻ đôi điều về bức ảnh này..."
                  className="w-full bg-transparent border-none focus:ring-0 resize-none text-lg placeholder:text-stone-400 mb-4 px-2"
                  rows={previewUrl ? 2 : 4}
                />

                {previewUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 mb-4 group">
                    <img src={previewUrl} alt="preview" className="w-full max-h-64 object-contain" />
                    <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 w-8 h-8 bg-white/80 text-stone-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                  </div>
                ) : (
                  <div className="mb-4">
                     <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-pink-100 border-dashed rounded-2xl cursor-pointer bg-pink-50/30 hover:bg-pink-50 transition-colors">
                        <div className="flex flex-col items-center justify-center text-pink-400">
                           <span className="text-2xl font-bold mb-1">+</span><span className="text-sm font-bold">Thêm ảnh Boss</span>
                        </div>
                        <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                     </label>
                  </div>
                )}

                {/* 🎯 GIAO DIỆN CHỌN MÈO GẮN THẺ */}
                {myPets.length > 0 && (
                  <div className="mb-6 pt-4 border-t border-stone-100">
                    <p className="text-sm font-bold text-stone-700 mb-3">Gắn thẻ Boss: {selectedPets.length > 0 && <span className="text-pink-500 font-normal">({selectedPets.length} bé được chọn)</span>}</p>
                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                      {myPets.map(pet => {
                        const isSelected = selectedPets.includes(pet.petid);
                        return (
                          <button
                            key={pet.petid} type="button" onClick={() => togglePetSelection(pet.petid)}
                            className={`flex flex-col items-center gap-1.5 shrink-0 w-16 transition-all ${isSelected ? 'opacity-100 scale-105' : 'opacity-60 hover:opacity-100'}`}
                          >
                            <div className={`w-14 h-14 rounded-full p-1 border-2 ${isSelected ? 'border-pink-500 bg-pink-50' : 'border-transparent'}`}>
                              <img src={pet.imageurl || 'https://ui-avatars.com/api/?name=Cat'} className="w-full h-full rounded-full object-cover" alt="pet" />
                            </div>
                            <span className={`text-[10px] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center ${isSelected ? 'font-bold text-pink-600' : 'text-stone-500'}`}>{pet.petname}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button type="submit" disabled={isPosting || (!newCaption.trim() && !imageFile)} className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-md disabled:bg-stone-200 transition-colors">
                  {isPosting ? 'Đang lên sóng...' : 'Đăng Bài'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* FEED BÀI VIẾT */}
        <div className="space-y-6">
          {posts.map((post) => <PostCard key={post.id} post={post} currentUser={currentUser} onDelete={handleRemovePostFromUI} />)}
        </div>
      </main>
    </div>
  );
}