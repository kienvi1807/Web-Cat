import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// 🎯 Nhớ import supabase vào sếp nhé
import { supabase } from '@/lib/supabase'; 

export interface DBCat {
  id: number;
  name: string;
  breed: string;
  color: string;
  price: number;
  status: string;
  images: string;
  likes?: number;
}

// 🎯 BỘ TỪ ĐIỂN DỊCH MÃ MÀU EMS (Sếp có thể tự thêm các mã mới vào đây)
const EMS_COLORS: Record<string, string> = {
  'NS11': 'Black Silver Shaded',
  'NS 11': 'Black Silver Shaded',
  'NS22': 'Black Silver Classic Tabby',
  'NS 22': 'Black Silver Classic Tabby',
  'N22': 'Black Classic Tabby',
  'N 22': 'Black Classic Tabby',
  'D22': 'Red Classic Tabby',
  'D 22': 'Red Classic Tabby',
  'W': 'Solid White (Trắng Tinh)',
  'N': 'Solid Black (Đen)',
  'A': 'Solid Blue (Xám Xanh)',
  'F': 'Black Tortie (Đồi mồi)',
};

// Hàm xử lý dịch màu: Xóa khoảng trắng thừa, viết hoa lên rồi tra từ điển
const getColorName = (code: string) => {
  if (!code) return 'Đang cập nhật';
  const cleanCode = code.trim().toUpperCase();
  return EMS_COLORS[cleanCode] || code; // Nếu ko có trong từ điển thì trả về mã gốc
};

export default function CatteryList({ cats }: { cats: DBCat[] }) {
  const [likedCats, setLikedCats] = useState<number[]>([]);
  const [likesCount, setLikesCount] = useState<Record<number, number>>({});

  const getFirstImage = (imageString: string) => {
    if (!imageString) return "https://images.unsplash.com/photo-1589883661923-6476cb0ae9f2?q=80&w=1000&auto=format&fit=crop";
    try {
      const parsed = JSON.parse(imageString);
      return Array.isArray(parsed) ? parsed[0] : imageString;
    } catch (e) {
      return imageString;
    }
  };

  // 🎯 Lấy dữ liệu tim từ LocalStorage và Database khi load trang
  useEffect(() => {
    // 1. Kiểm tra xem trên máy khách này đã thả tim những bé nào rồi
    const savedLikes = localStorage.getItem('kinvie_likes');
    if (savedLikes) setLikedCats(JSON.parse(savedLikes));

    // 2. Lấy số lượng tim hiện tại của các bé từ Database đổ vào giao diện
    const counts: Record<number, number> = {};
    cats.forEach(cat => {
      counts[cat.id] = cat.likes || 0;
    });
    setLikesCount(counts);
  }, [cats]);

  // 🎯 Hàm xử lý khi khách bấm Tim
  const toggleLike = async (e: React.MouseEvent, catId: number) => {
    e.preventDefault();
    e.stopPropagation();

    const isLiked = likedCats.includes(catId);
    let newLikeCount;

    if (isLiked) {
      // NẾU BỎ TIM (-)
      const newLikedArray = likedCats.filter(id => id !== catId);
      setLikedCats(newLikedArray);
      localStorage.setItem('kinvie_likes', JSON.stringify(newLikedArray)); // Lưu vào trình duyệt
      
      newLikeCount = Math.max(0, (likesCount[catId] || 0) - 1);
      setLikesCount({ ...likesCount, [catId]: newLikeCount }); // Đổi số trên giao diện
    } else {
      // NẾU THẢ TIM (+)
      const newLikedArray = [...likedCats, catId];
      setLikedCats(newLikedArray);
      localStorage.setItem('kinvie_likes', JSON.stringify(newLikedArray)); // Lưu vào trình duyệt
      
      newLikeCount = (likesCount[catId] || 0) + 1;
      setLikesCount({ ...likesCount, [catId]: newLikeCount }); // Đổi số trên giao diện
    }

    // 🎯 LƯU VÀO DATABASE SUPABASE
    try {
      const { error } = await supabase
        .from('cats')
        .update({ likes: newLikeCount })
        .eq('id', catId);
      if (error) console.error("Lỗi khi update database:", error);
    } catch (err) {
      console.error("Lỗi mạng:", err);
    }
  };

  return (
    <section id="kinvie-cattery" className="relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {cats.map((cat) => {
          const isReady = cat.status === 'Sẵn sàng';
          const isLiked = likedCats.includes(cat.id);
          const displayLikes = likesCount[cat.id] || 0;
          
          // 🎯 Gọi hàm dịch màu
          const colorFullName = getColorName(cat.color);

          return (
            <article 
              key={cat.id} 
              className="group relative bg-white rounded-[3rem] p-4 border border-pink-50 shadow-[0_10px_40px_-10px_rgba(236,72,153,0.05)] hover:shadow-[0_20px_50px_-10px_rgba(236,72,153,0.2)] transition-all duration-700 hover:-translate-y-3 flex flex-col h-full"
            >
              {/* --- KHUNG ẢNH --- */}
              <div className="aspect-[4/5] relative overflow-hidden rounded-[2.5rem] bg-pink-50/50 shrink-0">
                <img
                  src={getFirstImage(cat.images)} 
                  alt={`Mèo Maine Coon - ${cat.name}`}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-pink-900/70 via-pink-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* NÚT THẢ TIM (GÓC PHẢI) */}
                <button 
                  onClick={(e) => toggleLike(e, cat.id)}
                  className="absolute top-4 right-4 w-11 h-11 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-pink-50 hover:scale-110 transition-all shadow-md z-20 group/heart"
                >
                  <svg 
                    className={`w-6 h-6 transition-colors duration-300 ${isLiked ? 'text-rose-500 fill-rose-500' : 'text-pink-300 fill-transparent group-hover/heart:text-rose-400'}`} 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={isLiked ? "0" : "2"}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {displayLikes > 0 && (
                     <span className="absolute -bottom-2 -right-1 bg-white border border-pink-100 text-rose-500 text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                       {displayLikes}
                     </span>
                  )}
                </button>

                {/* Nút Xem Hồ Sơ ẩn hiện */}
                <div className="absolute bottom-5 left-5 right-5 opacity-0 group-hover:opacity-100 translate-y-8 group-hover:translate-y-0 transition-all duration-500 delay-75 z-10">
                  <Link href={`/cattery/${cat.id}`} className="w-full bg-white/95 backdrop-blur-xl text-pink-500 font-black py-4 rounded-[1.5rem] hover:bg-pink-500 hover:text-white transition-colors duration-300 shadow-[0_10px_20px_rgba(236,72,153,0.15)] flex items-center justify-center gap-2">
                    Xem Hồ Sơ Bé <span className="text-lg">🌸</span>
                  </Link>
                </div>
              </div>
              
              {/* --- THÔNG TIN CHI TIẾT --- */}
              <div className="px-3 pt-5 pb-2 flex flex-col flex-grow">
                {/* Tên Trại & Giống Mèo */}
                <div className="flex items-center justify-between mb-1.5">
                   <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest">
                     KinVie Cattery
                   </span>
                   <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                     {cat.breed || 'Maine Coon'}
                   </span>
                </div>

                {/* Tên Bé & Màu Lông */}
                <div className="flex flex-col mb-4">
                  <h3 className="text-2xl font-black text-stone-800 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-rose-400 transition-all duration-300 truncate leading-tight">
                    {cat.name}
                  </h3>
                  <span className="text-xs font-bold text-stone-500 mt-1 truncate">
                    Màu: <span className="text-pink-600">{colorFullName}</span> {/* Hiển thị tên màu xịn xò */}
                  </span>
                </div>
                
                {/* Trạng thái */}
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-pink-50/50">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isReady ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${isReady ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  </span>
                  <span className={`text-sm font-bold transition-colors ${isReady ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {cat.status || 'Đang cập nhật'}
                  </span>
                </div>
              </div>

            </article>
          );
        })}
      </div>
    </section>
  );
}