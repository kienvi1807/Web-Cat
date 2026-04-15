"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase'; 
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE QUẢN LÝ BÀI ĐĂNG ---
  const [isPostManagerOpen, setIsPostManagerOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [editSelectedPets, setEditSelectedPets] = useState<number[]>([]);

  // --- STATE QUẢN LÝ ĐƠN HÀNG ---
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null); // Theo dõi đơn nào đang mở
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  // State chứa dữ liệu thật từ Database
  const [userData, setUserData] = useState({
    userid: null, 
    name: '',
    rank: 'Đồng',
    phone: 'Chưa cập nhật',
    age: 'Chưa cập nhật', 
    birthdate: '', 
    address: 'Chưa cập nhật', 
    avatarUrl: '',
    pets: [] as any[], 
    orders: [] as any[],
    myPosts: [] as any[] 
  });

  const calculateAge = (dobString: string) => {
    if (!dobString) return 'Chưa cập nhật';
    const dob = new Date(dobString);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) { age--; }
    return age > 0 ? `${age} tuổi` : 'Dưới 1 tuổi';
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const { data: dbUser } = await supabase
        .from('users')
        .select(`*, type_users (role, rank_name)`)
        .eq('email', session.user.email)
        .single();

      if (dbUser) {
        const rawName = dbUser.fullname || session.user.user_metadata?.full_name || 'Khách Hàng Bí Ẩn';
        const cleanName = rawName.normalize('NFC'); 

        let hdAvatarUrl = dbUser.avatarurl || session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '';
        if (hdAvatarUrl) {
          if (hdAvatarUrl.includes('fbcdn.net')) hdAvatarUrl = hdAvatarUrl.replace(/\/[sp]\d+x\d+\//, '/');
          else if (hdAvatarUrl.includes('graph.facebook.com')) hdAvatarUrl = `${hdAvatarUrl}${hdAvatarUrl.includes('?') ? '&' : '?'}width=400&height=400`;
          else if (hdAvatarUrl.includes('googleusercontent.com')) hdAvatarUrl = hdAvatarUrl.replace('s96-c', 's400-c'); 
        }

        const { data: userPets } = await supabase.from('pets').select('*').eq('ownerid', dbUser.userid);
        const { data: userPosts } = await supabase.from('posts').select('*, post_pets(pets(petid, petname, imageurl))').eq('user_id', dbUser.userid).order('created_at', { ascending: false });

        // 🎯 LẤY ĐƠN HÀNG THẬT TỪ BẢNG ORDERS
        const { data: userOrders } = await supabase
          .from('orders')
          .select('*')
          .eq('userid', dbUser.userid)
          .order('orderdate', { ascending: false }); // Mới nhất lên đầu

        setUserData({
          userid: dbUser.userid,
          name: cleanName,
          rank: dbUser.type_users?.rank_name || 'Đồng', 
          phone: dbUser.phone || 'Chưa cập nhật',
          age: dbUser.age || 'Chưa cập nhật', 
          birthdate: dbUser.birthdate || '', 
          address: dbUser.address || 'Chưa cập nhật',
          avatarUrl: hdAvatarUrl, 
          pets: userPets || [],
          orders: userOrders || [],
          myPosts: userPosts || [] 
        });
      }
      setIsLoading(false);
    };
    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    if (window.confirm("Boss muốn đăng xuất tài khoản à?")) {
      await supabase.auth.signOut(); 
      localStorage.removeItem('kinvie_user'); 
      router.push('/login'); 
    }
  };

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setEditImageFile(file);
    setEditPreviewUrl(URL.createObjectURL(file));
  };

  // --- LOGIC PHÂN TRANG ĐƠN HÀNG ---
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = userData.orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(userData.orders.length / ordersPerPage);

  const statusConfig: { [key: string]: { label: string, class: string } } = {
    'Đã đặt hàng': { label: 'Chờ xác nhận', class: 'bg-orange-100 text-orange-600' },
    'Đã thanh toán': { label: 'Đã thanh toán', class: 'bg-blue-100 text-blue-600' },
    'Đang vận chuyển': { label: 'Đang giao', class: 'bg-indigo-100 text-indigo-600' },
    'Đã giao hàng': { label: 'Thành công', class: 'bg-green-100 text-green-600' },
    'Đã hủy': { label: 'Đã hủy', class: 'bg-stone-200 text-stone-500' },
  };

  // ==========================================
  // 🎯 LOGIC XỬ LÝ POSTS (GIỮ NGUYÊN NHƯ FILE CŨ)
  // ==========================================
  const handleDeletePost = async (postId: number) => {
    if (!window.confirm("Sen chắc chắn muốn xóa bài này?")) return;
    try {
      await supabase.from('posts').delete().eq('id', postId);
      setUserData(prev => ({ ...prev, myPosts: prev.myPosts.filter(p => p.id !== postId) }));
    } catch (err) { alert("Lỗi xóa bài!"); }
  };

  const startEditing = (post: any) => {
    setEditingPostId(post.id);
    setEditCaption(post.content || '');
    setEditPreviewUrl(post.image_url || null);
    setEditSelectedPets(post.post_pets?.map((pp: any) => pp.pets?.petid).filter(Boolean) || []);
  };

  const cancelEditing = () => {
    setEditingPostId(null);
    setEditCaption('');
    setEditPreviewUrl(null);
    setEditSelectedPets([]);
  };

  const handleUpdatePost = async (postId: number) => {
    setIsSavingPost(true);
    let finalImageUrl = editPreviewUrl;
    try {
      if (editImageFile) {
        const fileName = `user_${userData.userid}/${Date.now()}.jpg`;
        await supabase.storage.from('feed_images').upload(fileName, editImageFile);
        finalImageUrl = supabase.storage.from('feed_images').getPublicUrl(fileName).data.publicUrl;
      }
      await supabase.from('posts').update({ content: editCaption.trim(), image_url: finalImageUrl }).eq('id', postId);
      await supabase.from('post_pets').delete().eq('post_id', postId);
      if (editSelectedPets.length > 0) {
        await supabase.from('post_pets').insert(editSelectedPets.map(pid => ({ post_id: postId, pet_id: pid })));
      }
      const updatedTaggedPets = editSelectedPets.map(id => {
         const p = userData.pets.find(p => p.petid === id);
         return { pets: { petid: p.petid, petname: p.petname, imageurl: p.imageurl } };
      });
      setUserData(prev => ({ ...prev, myPosts: prev.myPosts.map(p => p.id === postId ? { ...p, content: editCaption, image_url: finalImageUrl, post_pets: updatedTaggedPets } : p) }));
      cancelEditing();
    } catch (err) { alert("Lỗi lưu bài!"); } finally { setIsSavingPost(false); }
  };

  if (isLoading) return <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center"><div className="text-4xl animate-bounce">🐾</div></div>;

  const getRankStyle = (rank: string) => {
    if (rank === 'Kim Cương') return 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-cyan-200';
    return 'bg-gradient-to-r from-pink-400 to-rose-400 text-white';
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-700 font-sans">
      <Header />

      <main className="pt-32 pb-20 container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR TÓM TẮT */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100 text-center sticky top-28">
              <div className="w-32 h-32 bg-pink-100 rounded-full mx-auto mb-6 border-4 border-white overflow-hidden shadow-inner flex items-center justify-center text-5xl">
                {userData.avatarUrl ? <img src={userData.avatarUrl} className="w-full h-full object-cover" /> : '👤'}
              </div>
              <h1 className="text-2xl font-bold text-stone-800 mb-2">{userData.name}</h1>
              <div className={`inline-block px-5 py-1.5 rounded-full text-xs uppercase font-black tracking-widest ${getRankStyle(userData.rank)}`}>Thành viên {userData.rank}</div>
              <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-stone-50">
                <div><p className="text-[10px] text-stone-400 uppercase font-black">Số Boss</p><p className="text-2xl font-black text-pink-500">{userData.pets.length}</p></div>
                <div><p className="text-[10px] text-stone-400 uppercase font-black">Đơn hàng</p><p className="text-2xl font-black text-stone-800">{userData.orders.length}</p></div>
              </div>
              <button onClick={handleLogout} className="mt-8 w-full py-4 bg-stone-50 text-rose-500 font-bold rounded-2xl border-2 border-rose-50 hover:bg-rose-50 transition-all flex items-center justify-center gap-2">🚪 Đăng xuất</button>
            </div>
          </div>

          {/* NỘI DUNG CHI TIẾT */}
          <div className="lg:w-2/3 space-y-8">
            
            {/* Khối 1: Thông tin cá nhân */}
            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black flex items-center gap-3">📝 Thông tin Sen</h3>
                <button onClick={() => router.push('/profile/edit')} className="text-xs font-bold text-pink-500 bg-pink-50 px-4 py-2 rounded-xl hover:bg-pink-100 transition-all">✏️ Sửa hồ sơ</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                {[ {l: 'Họ và tên', v: userData.name}, {l: 'Tuổi', v: userData.birthdate ? calculateAge(userData.birthdate) : userData.age}, {l: 'Số điện thoại', v: userData.phone}, {l: 'Địa chỉ', v: userData.address} ].map((item, i) => (
                  <div key={i} className="border-b border-stone-50 pb-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{item.l}</label>
                    <p className="text-sm font-bold text-stone-700 mt-1">{item.v}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Khối 2: Boss nhà mình */}
            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3">🐱 Boss nhà mình</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userData.pets.map(pet => (
                  <Link href={`/pet/${pet.petid}`} key={pet.petid}>
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex items-center gap-4 hover:border-pink-300 transition-all group">
                      <div className="w-14 h-14 bg-pink-100 rounded-xl overflow-hidden shrink-0 border-2 border-white shadow-sm">
                        {pet.imageurl ? <img src={pet.imageurl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">😺</div>}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-stone-800 group-hover:text-pink-600 transition-colors truncate">{pet.petname}</h4>
                        <p className="text-[11px] text-stone-400 font-bold uppercase">{pet.breed}</p>
                      </div>
                    </div>
                  </Link>
                ))}
                <Link href="/profile/add-pet" className="border-2 border-dashed border-stone-200 rounded-2xl p-4 text-stone-400 font-bold hover:bg-pink-50 hover:border-pink-200 hover:text-pink-400 transition-all flex items-center justify-center">+ Thêm Boss</Link>
              </div>
            </section>

            {/* Khối 3: Nhật ký cộng đồng */}
            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-2xl">🌟</div>
                <div>
                  <h3 className="text-lg font-black text-stone-800">Nhật ký cộng đồng</h3>
                  <p className="text-sm text-stone-400 font-medium">Sen đã đăng <span className="text-pink-500 font-bold">{userData.myPosts.length}</span> bài viết</p>
                </div>
              </div>
              <button onClick={() => setIsPostManagerOpen(true)} className="bg-pink-500 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-lg shadow-pink-100 hover:scale-105 transition-transform">Quản lý bài đăng</button>
            </section>

            {/* ==============================================
                🎯 KHỐI 4: LỊCH SỬ MUA HÀNG (THIẾT KẾ LẠI)
                ============================================== */}
            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3">📦 Lịch sử mua hàng</h3>
              
              <div className="space-y-4">
                {userData.orders.length === 0 ? (
                  <p className="text-center py-10 text-stone-400 font-medium italic">Sen chưa mua đơn hàng nào. Hãy ghé Petshop nhé! 🛒</p>
                ) : (
                  currentOrders.map((order, idx) => {
                    const currentStatus = statusConfig[order.orderstatus] || { 
                      label: order.orderstatus, 
                      class: 'bg-stone-100 text-stone-600' 
                    };
                    const isOpen = expandedOrderId === order.orderid;
                    const displayNo = userData.orders.length - (indexOfFirstOrder + idx);
                    return (
                      <div key={order.orderid} className={`border rounded-3xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-pink-200 ring-4 ring-pink-50/50 shadow-md' : 'border-stone-100 bg-stone-50/30'}`}>
                        {/* Header của Đơn hàng (Cái bấm vào để sổ) */}
                        <div 
                          onClick={() => setExpandedOrderId(isOpen ? null : order.orderid)}
                          className="p-5 flex items-center justify-between cursor-pointer hover:bg-white transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${order.orderstatus === 'Cancelled' ? 'bg-stone-200 text-stone-500' : 'bg-pink-100 text-pink-600'}`}>
                              #{displayNo}
                            </div>
                            <div>
                              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">{new Date(order.orderdate).toLocaleDateString('vi-VN')}</p>
                              <p className="text-sm font-black text-stone-700 mt-0.5">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalamount)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${currentStatus.class}`}>
                              {currentStatus.label}
                            </span>
                            <span className={`text-stone-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-pink-500' : ''}`}>▼</span>
                          </div>
                        </div>

                        {/* Chi tiết Đơn hàng (Phần sổ xuống) */}
                        <div className={`transition-all duration-500 ease-in-out bg-white overflow-hidden ${isOpen ? 'max-h-[1000px] border-t border-pink-50' : 'max-h-0'}`}>
                          <div className="p-6 space-y-4">
                            <h4 className="text-[11px] font-black text-stone-400 uppercase border-b pb-2">Danh sách sản phẩm</h4>
                            {order.items && Array.isArray(order.items) ? (
                              order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-stone-100 rounded-xl overflow-hidden border border-stone-100">
                                      {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-stone-800 line-clamp-1">{item.name || item.product_name}</p>
                                      <p className="text-xs text-stone-400">Số lượng: <span className="text-stone-600 font-bold">{item.quantity}</span></p>
                                    </div>
                                  </div>
                                  <p className="text-sm font-black text-stone-700">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-stone-400 italic">Không có thông tin chi tiết món hàng.</p>
                            )}
                            
                            <div className="pt-4 mt-2 border-t border-dashed border-stone-100 grid grid-cols-2 gap-4">
                               <div>
                                  <p className="text-[10px] text-stone-400 uppercase font-black mb-1">Phương thức thanh toán</p>
                                  <p className="text-xs font-bold text-stone-600">{order.paymentmethod || 'COD'}</p>
                               </div>
                               <div className="text-right">
                                  <p className="text-[10px] text-stone-400 uppercase font-black mb-1">Địa chỉ nhận</p>
                                  <p className="text-[11px] font-bold text-stone-600 line-clamp-1">{order.address || userData.address}</p>
                               </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* PHÂN TRANG 1, 2, 3... */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${currentPage === page ? 'bg-pink-500 text-white shadow-lg shadow-pink-200 scale-110' : 'bg-stone-100 text-stone-400 hover:bg-pink-50 hover:text-pink-500'}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </section>

          </div>
        </div>
      </main>

      {/* MODAL QUẢN LÝ BÀI ĐĂNG (GIỮ NGUYÊN CODE CŨ CỦA SẾP DƯỚI ĐÂY) */}
      {isPostManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-sm" onClick={() => setIsPostManagerOpen(false)}></div>
          <div className="relative bg-[#FFF8FA] w-full max-w-2xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 bg-white border-b border-pink-100 shrink-0 shadow-sm z-10">
              <h3 className="text-xl font-black text-stone-800 flex items-center gap-2"><span className="text-pink-500">📸</span> Quản lý bài đăng của bạn</h3>
              <button onClick={() => setIsPostManagerOpen(false)} className="w-10 h-10 flex items-center justify-center bg-stone-100 text-stone-500 rounded-full hover:bg-rose-100 hover:text-rose-500 transition-colors">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {userData.myPosts.length === 0 ? (
                <div className="text-center py-20"><div className="text-5xl mb-4 opacity-50">📭</div><p className="text-stone-500 font-medium">Sen chưa có bài viết nào trên bảng Feed cả.</p></div>
              ) : (
                userData.myPosts.map((post) => {
                  const taggedPets = post.post_pets?.map((pp: any) => pp.pets).filter(Boolean) || [];
                  return (
                    <div key={post.id} className="bg-white p-5 rounded-2xl shadow-sm border border-pink-50 relative group">
                      {editingPostId === post.id ? (
                        <div className="space-y-4">
                          <textarea value={editCaption} onChange={(e) => setEditCaption(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-700 focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none" rows={3}></textarea>
                          <div className="flex items-start gap-4">
                            {editPreviewUrl ? (
                              <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-100">
                                <img src={editPreviewUrl} className="w-full h-full object-cover" />
                                <button onClick={() => { setEditPreviewUrl(null); setEditImageFile(null); }} className="absolute top-1 right-1 bg-white/80 w-6 h-6 rounded-full text-rose-500 shadow hover:bg-white text-[10px]">✕</button>
                              </div>
                            ) : (
                              <label className="w-32 h-32 border-2 border-dashed border-pink-200 rounded-xl flex flex-col items-center justify-center text-pink-400 cursor-pointer hover:bg-pink-50 transition shrink-0 bg-stone-50"><span className="text-2xl mb-1">+</span><span className="text-xs font-bold">Thay ảnh</span><input type="file" accept="image/*" onChange={handleEditImageSelect} className="hidden" /></label>
                            )}
                            <div className="flex-1 flex flex-col gap-2 pt-2">
                              {userData.pets.length > 0 && (
                                <div className="mb-2"><p className="text-[11px] font-bold text-stone-400 uppercase mb-1.5">Gắn thẻ Boss</p>
                                  <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                                    {userData.pets.map(pet => {
                                      const isSel = editSelectedPets.includes(pet.petid);
                                      return (<button key={pet.petid} type="button" onClick={() => setEditSelectedPets(prev => isSel ? prev.filter(id => id !== pet.petid) : [...prev, pet.petid])} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors whitespace-nowrap ${isSel ? 'bg-pink-500 border-pink-500 text-white' : 'bg-white border-stone-200 text-stone-500 hover:border-pink-300'}`}><img src={pet.imageurl || 'https://ui-avatars.com/api/?name=Cat'} className="w-4 h-4 rounded-full object-cover" alt="pet" />{pet.petname}</button>);
                                    })}
                                  </div>
                                </div>
                              )}
                              <button onClick={() => handleUpdatePost(post.id)} disabled={isSavingPost} className="w-full py-2.5 bg-pink-500 text-white font-bold rounded-xl shadow-md disabled:opacity-50 hover:bg-pink-600 transition">{isSavingPost ? 'Đang lưu...' : '💾 Lưu thay đổi'}</button>
                              <button onClick={cancelEditing} className="w-full py-2.5 bg-stone-100 text-stone-600 font-bold rounded-xl hover:bg-stone-200 transition">Hủy</button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-4">
                          <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-stone-100 border border-stone-100">{post.image_url ? <img src={post.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl text-stone-300">📝</div>}</div>
                          <div className="flex-1 flex flex-col min-w-0">
                            <span className="text-[11px] text-stone-400 mb-1">{new Date(post.created_at).toLocaleString('vi-VN')}</span>
                            {taggedPets.length > 0 && (<div className="flex flex-wrap items-center gap-1.5 mb-2"><span className="text-[10px] text-stone-400">Cùng với:</span>{taggedPets.map((pet: any) => (<span key={pet.petid} className="inline-flex items-center gap-1 px-2 py-0.5 bg-pink-50 text-pink-600 rounded-full text-[10px] font-bold border border-pink-100"><img src={pet.imageurl || 'https://ui-avatars.com/api/?name=Cat'} className="w-3 h-3 rounded-full object-cover" />{pet.petname}</span>))}</div>)}
                            <p className="text-sm text-stone-700 line-clamp-2 mb-3 whitespace-pre-wrap flex-1">{post.content || <i className="text-stone-400">(Chỉ có ảnh)</i>}</p>
                            <div className="flex gap-2 mt-auto"><button onClick={() => startEditing(post)} className="px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition">Sửa bài</button><button onClick={() => handleDeletePost(post.id)} className="px-4 py-1.5 bg-rose-50 text-rose-500 text-xs font-bold rounded-lg hover:bg-rose-100 transition">Xóa</button></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}