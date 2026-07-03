"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getAffiliatePlatform, AFFILIATE_PLATFORM_META } from '@/lib/utils';

export default function ProductCard({ product }: { product: any }) {
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 🌟 STATE CHO QUICK ADD MODAL
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('Mặc định'); // Demo phân loại
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: dbUser } = await supabase
          .from('users')
          .select('userid')
          .eq('email', session.user.email)
          .single();
        if (dbUser) setCurrentUserId(dbUser.userid);
      }
    };
    checkUser();
  }, []);

  const handleViewDetail = () => {
    router.push(`/petshop/${product.id}`); // Hoặc /shop tùy route của sếp
  };

  // 🌟 XỬ LÝ CLICK SẢN PHẨM AFFILIATE (MỚI)
  const handleAffiliateClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.affiliate_url) return;

    // Gọi hàm đếm click ngầm (không await để chuyển trang mượt mà)
    supabase.rpc('increment_affiliate_click', { product_id: product.id });

    // Mở liên kết ở tab mới
    window.open(product.affiliate_url, '_blank');
  };

  // 🌟 XỬ LÝ SỰ KIỆN CLICK TRÊN TOÀN BỘ CARD (MỚI)
  const handleCardClick = (e: React.MouseEvent) => {
    if (product.is_affiliate) {
      handleAffiliateClick(e); // Hàng Affiliate -> Qua sàn
    } else {
      handleViewDetail(); // Hàng thường -> Xem chi tiết
    }
  };

  // 🌟 MỞ BẢNG CHỌN (MODAL) THAY VÌ THÊM LUÔN
  const handleOpenQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickAdd(true);
    setQuantity(1); // Reset lại số lượng mỗi lần mở
  };

  // 🌟 ĐÓNG BẢNG
  const handleCloseQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickAdd(false);
  };

  // 🌟 XÁC NHẬN THÊM VÀO GIỎ HÀNG (ĐÃ FIX TÁCH RIÊNG TỪNG PHÂN LOẠI)
  const handleConfirmAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
      alert("Sen vui lòng đăng nhập để thêm món này vào giỏ hàng nhé! 🛒");
      router.push('/login');
      return;
    }

    setIsAdding(true);
    try {
      // 🎯 ĐIỂM MẤU CHỐT: Check cả ID sản phẩm VÀ Phân loại (variant)
      const { data: existingCartItem, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', currentUserId)
        .eq('product_id', product.id)
        .eq('variant', selectedVariant) // Cùng vị thì mới gộp!
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingCartItem) {
        // Có rồi và cùng vị -> Cộng dồn
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: existingCartItem.quantity + quantity })
          .eq('id', existingCartItem.id);
        if (updateError) throw updateError;
      } else {
        // Chưa có hoặc khác vị -> Tạo dòng mới
        const { error: insertError } = await supabase.from('cart_items').insert({
          user_id: currentUserId,
          product_id: product.id,
          quantity: quantity,
          variant: selectedVariant // Lưu vị trí trí khách chọn vào DB
        });
        if (insertError) throw insertError;
      }

      window.dispatchEvent(new Event('update_cart'));
      setShowQuickAdd(false);

    } catch (error: any) {
      console.error("Lỗi Database khi thêm giỏ hàng:", error);
      alert(`Ui da lỗi rồi: ${error.message || "Sen thử lại nhé!"}`);
    } finally {
      setIsAdding(false);
    }
  };

  const imageUrl = product.imageurl || (product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/400x400/ffedd5/ea580c?text=Beam+Petshop');
  const rawPrice = product.price || 0;
  const discount = product.discount_percent || 0;
  const finalPrice = discount > 0 ? rawPrice * (1 - discount / 100) : rawPrice;

  // Dữ liệu giả cho các loại vị (Nếu sếp có cột phân loại trong DB thì gọi ra đây)
  const demoVariants = ['Vị Mặc định', 'Vị Cá Hồi', 'Vị Bò Cà Rốt'];

  return (
    <>
      <div
        onClick={handleCardClick}
        className="group bg-white rounded-[2rem] overflow-hidden cursor-pointer border border-orange-50 relative transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(249,115,22,0.25)] hover:border-orange-200 flex flex-col h-full"
      >
        <div className="relative aspect-square overflow-hidden bg-stone-50 shrink-0 p-4 flex items-center justify-center">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out mix-blend-multiply"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/ffedd5/ea580c?text=Anh+Loi'; }}
          />
          {discount > 0 && (
            <div className="absolute top-4 left-4 bg-rose-500 px-3 py-1.5 rounded-full text-[11px] font-black text-white shadow-md uppercase tracking-wider animate-pulse z-10">
              Giảm {discount}%
            </div>
          )}

          {/* 🌟 NHÃN NỀN TẢNG (SHOPEE/TIKTOK) DÁN Ở GÓC PHẢI */}
          {product.is_affiliate && (() => {
            const meta = AFFILIATE_PLATFORM_META[getAffiliatePlatform(product.affiliate_url)];
            return (
              <div className={`absolute top-4 right-4 ${meta.badgeClass} px-3 py-1.5 rounded-full text-[10px] font-black text-white shadow-md uppercase tracking-wider z-10 flex items-center gap-1 border border-white/20`}>
                <span>{meta.icon}</span> {meta.label}
              </div>
            );
          })()}
        </div>

        <div className="p-5 bg-gradient-to-b from-white to-orange-50/20 flex flex-col flex-1">
          <div className="mb-2">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">{product.brand || 'Khác'}</p>
            <h3 className="text-lg font-black text-stone-800 line-clamp-2 leading-snug group-hover:text-orange-500 transition-colors">{product.name}</h3>
          </div>

          <div className="flex items-center justify-between text-xs mt-1 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className={`w-4 h-4 ${star <= Math.round(product.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-stone-300 fill-transparent'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              ))}
              <span className="text-stone-400 ml-1 font-bold">({product.reviews_count || 0})</span>
            </div>
            <div className="text-stone-500 font-medium">Đã bán: <span className="text-stone-700 font-bold">{product.sales_count || 0}</span></div>
          </div>

          <div className="mt-auto flex items-center justify-between pt-4 border-t border-orange-100 border-dashed">
            <div>
              <p className="text-lg font-black text-orange-500">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice)}</p>
              {discount > 0 && <p className="text-xs text-stone-400 line-through font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rawPrice)}</p>}
            </div>

            {/* 🌟 ĐỔI NÚT DỰA VÀO LOẠI SẢN PHẨM (MỚI) */}
            {product.is_affiliate ? (
              <button
                onClick={handleAffiliateClick}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black rounded-xl text-xs hover:shadow-lg hover:shadow-orange-200 transition-all active:scale-95 flex items-center gap-1"
              >
                Nơi bán <span className="text-[10px]">➔</span>
              </button>
            ) : (
              <button
                onClick={handleOpenQuickAdd}
                disabled={product.stock === 0}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-95
                  ${product.stock === 0 ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-stone-900 text-white hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-200'}`}
              >
                {product.stock === 0 ? <span className="text-xs font-black">Hết</span> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 🌟 QUICK ADD MODAL (LAYER BẬT LÊN KHI BẤM GIỎ HÀNG)          */}
      {/* ============================================================ */}
      {showQuickAdd && !product.is_affiliate && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center px-4 animate-in fade-in duration-200"
          onClick={handleCloseQuickAdd} // Click ra ngoài nền đen sẽ đóng Modal
        >
          {/* Nền đen mờ */}
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"></div>

          {/* Bảng Layer Trắng */}
          <div
            className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-6 lg:p-8 flex flex-col transform transition-all animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()} // Chặn không cho lệnh click xuyên qua thẻ div này
          >
            {/* Nút X đóng bảng */}
            <button
              onClick={handleCloseQuickAdd}
              className="absolute top-4 right-4 w-10 h-10 bg-stone-100 hover:bg-rose-100 hover:text-rose-500 text-stone-500 rounded-full flex items-center justify-center transition-colors z-10"
            >
              ✕
            </button>

            {/* Thông tin SP thu gọn */}
            <div className="flex gap-4 border-b border-stone-100 pb-6 mb-6">
              <div className="w-24 h-24 bg-stone-50 rounded-2xl border border-stone-100 p-2 shrink-0">
                <img src={imageUrl} className="w-full h-full object-contain mix-blend-multiply" alt={product.name} />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h4 className="font-black text-stone-800 line-clamp-2 leading-tight mb-2">{product.name}</h4>
                <p className="text-xl font-black text-orange-500">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice)}</p>
                <p className="text-[11px] text-stone-400 font-bold uppercase mt-1">Kho: {product.stock}</p>
              </div>
            </div>

            {/* Phần chọn Phân Loại (Hiển thị kiểu Demo) */}
            <div className="mb-6">
              <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3">Chọn Phân Loại</p>
              <div className="flex flex-wrap gap-2">
                {demoVariants.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${selectedVariant === v ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200' : 'bg-white text-stone-600 border-stone-200 hover:border-orange-300'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Phần Chọn Số Lượng */}
            <div className="mb-8">
              <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3">Số lượng</p>
              <div className="flex items-center bg-stone-50 border border-stone-200 rounded-2xl p-1 shadow-sm w-max">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-xl font-bold hover:bg-white rounded-xl transition-all text-stone-500">−</button>
                <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 text-center font-black text-lg focus:outline-none bg-transparent text-stone-800" />
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-xl font-bold hover:bg-white rounded-xl transition-all text-stone-500">+</button>
              </div>
            </div>

            {/* Nút Xác Nhận Thêm */}
            <button
              onClick={handleConfirmAdd}
              disabled={isAdding}
              className="w-full py-4 bg-stone-900 text-white font-black rounded-2xl hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-200 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              {isAdding ? <span className="animate-spin text-xl">⚙️</span> : <><span>🛒</span> Xác Nhận Thêm</>}
            </button>

          </div>
        </div>
      )}
    </>
  );
}