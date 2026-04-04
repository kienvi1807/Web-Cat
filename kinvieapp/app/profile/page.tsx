"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase'; // Bắt buộc import Supabase
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // State chứa dữ liệu thật từ Database
  const [userData, setUserData] = useState({
    name: '',
    rank: 'Đồng',
    phone: 'Chưa cập nhật',
    age: 'Chưa cập nhật', 
    address: 'Chưa cập nhật', 
    avatarUrl: '',
    pets: [] as any[], 
    orders: [] as any[] 
  });

  // HÀM KÉO DỮ LIỆU TỪ DATABASE SUPABASE LÊN
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // 🎯 ĐÂY LÀ PHÉP THUẬT CỦA SUPABASE: 
      // Gọi bảng 'users', đồng thời chui qua bảng 'type_users' lôi cấu hình rank về
      const { data: dbUser, error } = await supabase
        .from('users')
        .select(`
          *,
          type_users (
            role,
            rank_name
          )
        `)
        .eq('email', user.email)
        .single();

      if (dbUser) {
        // 1. Xử lý lỗi chữ bị cách (Trầ n -> Trần)
        const rawName = dbUser.fullname || user.user_metadata?.full_name || 'Khách Hàng Bí Ẩn';
        const cleanName = rawName.normalize('NFC'); // Ép font chuẩn

        // 2. XỬ LÝ ẢNH ĐẠI DIỆN (Trị tận gốc mờ ảnh - ĐỒNG BỘ 100% VỚI HEADER)
        // 👈 BƯỚC 1: XỬ LÝ LÀM NÉT ẢNH VÀO BIẾN `hdAvatarUrl`
        let hdAvatarUrl = dbUser.avatarurl || user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
        
        if (hdAvatarUrl) {
          if (hdAvatarUrl.includes('fbcdn.net')) {
            // Mẹo giải mã Facebook: Xóa cái thư mục ép size nhỏ (thường là s50x50 hoặc p50x50) trên link CDN để lòi ra ảnh gốc nét căng
            hdAvatarUrl = hdAvatarUrl.replace(/\/[sp]\d+x\d+\//, '/');
          } 
          else if (hdAvatarUrl.includes('graph.facebook.com')) {
            // Nếu hên nó trả link graph thì nối thêm param width
            const separator = hdAvatarUrl.includes('?') ? '&' : '?';
            hdAvatarUrl = `${hdAvatarUrl}${separator}width=400&height=400`;
          }
          else if (hdAvatarUrl.includes('googleusercontent.com')) {
            // Mẹo giải mã Google: Đổi s96 (size 96) thành s400 (size 400)
            hdAvatarUrl = hdAvatarUrl.replace('s96-c', 's400-c'); 
          }
        }

        // 🎯 KÉO DANH SÁCH MÈO CỦA KHÁCH TỪ BẢNG 'pets'
        const { data: userPets } = await supabase
          .from('pets')
          .select('*')
          .eq('ownerid', dbUser.userid); // Tìm mèo dựa theo ID của chủ

        // 👈 BƯỚC 2: ĐỔ DỮ LIỆU THẬT VÀO GIAO DIỆN (CHỖ NÀY CỰC KỲ QUAN TRỌNG)
        setUserData({
          name: cleanName,
          // 🎯 Bắt dữ liệu Rank từ bảng type_users (nếu không có thì mặc định là Đồng)
          rank: dbUser.type_users?.rank_name || 'Đồng', 
          phone: dbUser.phone || 'Chưa cập nhật',
          age: dbUser.age || 'Chưa cập nhật', 
          address: dbUser.address || 'Chưa cập nhật',

          // 👇👇👇 ÔNG CHÚ Ý CHỖ NÀY !!! 👇👇👇
          // Phải gán bằng cái biến `hdAvatarUrl` xịn mà mình vừa xử lý ở trên
          avatarUrl: hdAvatarUrl, // 👈 ĐÂY CHÍNH LÀ DÒNG LÀM NÉT ẢNH!
          // ☝️☝️☝️ ÔNG CHÚ Ý CHỖ NÀY !!! ☝️☝️☝️

          // Data mẫu cho Pets và Orders
          pets: userPets || [],
          orders: [
            { id: '#KV1029', date: '03/04/2026', total: '1,250,000đ', status: 'Đang giao' }
          ]
        });
      }
      
      setIsLoading(false);
    };

    fetchUserData();
  }, [router]);

  // HÀM ĐĂNG XUẤT (Sử dụng Supabase chuẩn)
  const handleLogout = async () => {
    if (window.confirm("Boss muốn đăng xuất tài khoản à?")) {
      await supabase.auth.signOut(); // Báo cho Supabase biết là thoát
      localStorage.removeItem('kinvie_user'); // Xóa bộ nhớ tạm
      router.push('/login'); 
    }
  };

  // MÀN CHE LÚC ĐANG KÉO DỮ LIỆU
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center font-sans">
        <div className="text-4xl text-pink-300 animate-[spin_2s_linear_infinite] mb-4">🐾</div>
        <p className="text-stone-400 font-medium text-sm animate-pulse">Đang tải hồ sơ của Sen...</p>
      </div>
    );
  }

  // Hàm tạo hiệu ứng màu sắc cho Rank
  const getRankStyle = (rankName: string) => {
    switch (rankName) {
      case 'Đồng':
        return 'bg-gradient-to-r from-orange-300 via-amber-600 to-orange-400 text-white shadow-orange-200 shadow-md border border-orange-200';
      case 'Bạc':
        return 'bg-gradient-to-r from-slate-200 via-gray-100 to-slate-300 text-slate-700 shadow-slate-200 shadow-md border border-white';
      case 'Vàng':
        return 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 text-white shadow-yellow-200 shadow-md border border-yellow-200';
      case 'Bạch Kim':
        return 'bg-gradient-to-r from-gray-50 via-blue-50 to-gray-200 text-slate-800 shadow-blue-100 shadow-md border border-white font-extrabold';
      case 'Lục Bảo':
        return 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-white shadow-emerald-200 shadow-lg border border-emerald-300';
      case 'Kim Cương':
        return 'bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-400 text-white shadow-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.6)] border border-cyan-200 font-black';
      default:
        return 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-pink-200 shadow-md';
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-700 font-sans">
      <Header />

      <main className="pt-32 pb-20 container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR TÓM TẮT (1/3) */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100 text-center">
              
              {/* KHU VỰC AVATAR (Có ảnh Google thì hiện, không thì hiện Icon) */}
              <div className="w-32 h-32 bg-pink-100 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl shadow-inner border-4 border-white overflow-hidden">
                {userData.avatarUrl ? (
                  <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>👤</span>
                )}
              </div>
              
              <h1 className="text-[1.65rem] font-sans text-stone-600 font-medium tracking-wide mb-2">
                {userData.name}
              </h1>
              {/* Giao diện hiển thị Rank áp dụng hàm màu */}
              <div className={`inline-block px-5 py-1.5 rounded-full text-xs uppercase tracking-widest transition-all ${getRankStyle(userData.rank)}`}>
                {userData.rank === 'Kim Cương' ? '💎 ' : ''} 
                {userData.rank === 'Lục Bảo' ? '❇️ ' : ''}
                {userData.rank === 'Bạch Kim' ? '❄️ ' : ''}
                Thành viên {userData.rank}
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-stone-50 pt-6">
                <div className="text-center">
                  <p className="text-xs text-stone-400 uppercase font-bold">Số Boss</p>
                  <p className="text-xl font-black text-pink-500">{userData.pets.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-stone-400 uppercase font-bold">Đơn hàng</p>
                  <p className="text-xl font-black text-stone-800">{userData.orders.length}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-pink-50 rounded-3xl p-6 border border-pink-100">
               <h4 className="font-bold text-pink-600 mb-2 flex items-center gap-2">
                 <span>⭐</span> Đặc quyền {userData.rank}
               </h4>
               <ul className="text-xs text-stone-600 space-y-2">
                 <li>• Miễn phí vận chuyển mọi đơn hàng Petshop.</li>
                 <li>• Giảm 5% khi đón bé mèo tiếp theo tại Cattery.</li>
                 <li>• Ưu tiên tư vấn sức khỏe Boss 24/7.</li>
               </ul>
            </div>

            {/* NÚT ĐĂNG XUẤT */}
            <button 
              onClick={handleLogout}
              className="mt-6 w-full py-3.5 px-4 bg-white border-2 border-rose-100 text-rose-500 font-bold rounded-2xl hover:bg-rose-50 hover:border-rose-200 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="text-xl">🚪</span> Đăng xuất tài khoản
            </button>
          </div>

          {/* NỘI DUNG CHI TIẾT (2/3) */}
          <div className="lg:w-2/3 space-y-8">
            
            {/* Khối 1: Thông tin cá nhân */}
            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <span className="w-8 h-8 bg-stone-50 flex items-center justify-center rounded-lg">📝</span>
                  Thông tin tài khoản
                </h3>
                
                <button 
                  onClick={() => router.push('/profile/edit')}
                  className="text-sm font-bold text-pink-500 hover:text-pink-600 hover:bg-pink-50 px-4 py-2 rounded-xl transition-all border border-pink-100 flex items-center gap-2 shadow-sm"
                >
                  <span>✏️</span> Bổ sung thông tin
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-stone-400 uppercase">Họ và tên</label>
                  <p className="text-stone-700 font-medium border-b border-stone-50 pb-2">{userData.name}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-400 uppercase">Tuổi</label>
                  <p className="text-stone-700 font-medium border-b border-stone-50 pb-2">{userData.age}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-400 uppercase">Số điện thoại</label>
                  <p className="text-stone-700 font-medium border-b border-stone-50 pb-2">{userData.phone}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-400 uppercase">Địa chỉ nhận hàng</label>
                  <p className="text-stone-700 font-medium border-b border-stone-50 pb-2">{userData.address}</p>
                </div>
              </div>
            </section>

            {/* Khối 2: Danh sách Boss */}
            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-stone-50 flex items-center justify-center rounded-lg">🐱</span>
                Boss nhà mình
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userData.pets.map(pet => (
                  <Link href={`/pet/${pet.petid}`} key={pet.petid}>
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex items-center gap-4 group hover:border-pink-300 hover:shadow-md transition-all cursor-pointer h-full">
                      <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-xl shadow-sm overflow-hidden shrink-0">
                        {pet.imageurl ? (
                          <img src={pet.imageurl} alt={pet.petname} className="w-full h-full object-cover" />
                        ) : (
                          <span>😺</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-800 group-hover:text-pink-600 transition-colors">{pet.petname}</h4>
                        <p className="text-xs text-stone-400">{pet.breed} • {pet.gender ? 'Đực' : 'Cái'}</p>
                        <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase mt-1 inline-block">
                          {pet.status || 'Khỏe mạnh'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
                {/* Nút Thêm Boss */}
                <button className="border-2 border-dashed border-stone-200 rounded-2xl p-4 text-stone-400 font-bold hover:bg-stone-50 hover:border-pink-200 hover:text-pink-400 transition-all min-h-[80px]">
                  + Thêm Boss mới
                </button>
              </div>
            </section>

            {/* Khối 3: Lịch sử đơn hàng */}
            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-stone-50 flex items-center justify-center rounded-lg">📦</span>
                Lịch sử mua hàng
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-stone-400 text-xs uppercase border-b border-stone-50">
                      <th className="pb-4 font-bold">Mã ĐH</th>
                      <th className="pb-4 font-bold">Ngày mua</th>
                      <th className="pb-4 font-bold">Tổng tiền</th>
                      <th className="pb-4 font-bold">Trạng thái</th>
                      <th className="pb-4"></th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {userData.orders.map(order => (
                      <tr key={order.id} className="border-b border-stone-50 last:border-0">
                        <td className="py-4 font-bold text-stone-800">{order.id}</td>
                        <td className="py-4 text-stone-500">{order.date}</td>
                        <td className="py-4 font-bold text-rose-500">{order.total}</td>
                        <td className="py-4">
                          <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button className="text-pink-500 font-bold hover:underline">Chi tiết</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}