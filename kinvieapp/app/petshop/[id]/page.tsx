"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GlobalLoading from '@/components/layout/GlobalLoading';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  // 🌟 KHAI BÁO STATE QUẢN LÝ USER VÀ TRẠNG THÁI ADD CART
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    // 1. LẤY THÔNG TIN USER ĐỂ BIẾT AI ĐANG THÊM VÀO GIỎ
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      }
    };
    checkUser();

    // 2. LẤY DỮ LIỆU SẢN PHẨM
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (err) {
        console.error("Lỗi lấy chi tiết sản phẩm:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // 🌟 HÀM XỬ LÝ THÊM VÀO GIỎ HÀNG CHUẨN (ĐÃ FIX LỖI TÌM KIẾM)
  const handleAddToCart = async () => {
    if (!currentUserId) {
      alert("Sen vui lòng đăng nhập để thêm món này vào giỏ hàng nhé! 🛒");
      router.push('/login');
      return;
    }

    setIsAdding(true);
    try {
      // 1. Kiểm tra xem trong giỏ đã có món này chưa
      // 🌟 Dùng maybeSingle() thay vì single() để nó không văng lỗi khi giỏ hàng đang trống
      const { data: existingCartItem, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', currentUserId)
        .eq('product_id', product.id)
        .maybeSingle(); 

      if (fetchError) throw fetchError;

      if (existingCartItem) {
        // Nếu có rồi thì chỉ cộng thêm số lượng
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: existingCartItem.quantity + quantity })
          .eq('id', existingCartItem.id);
          
        if (updateError) throw updateError;
      } else {
        // Nếu chưa có thì tạo dòng mới trong Database
        const { error: insertError } = await supabase.from('cart_items').insert({
          user_id: currentUserId,
          product_id: product.id,
          quantity: quantity
        });
        
        if (insertError) throw insertError;
      }

      alert(`Đã thêm ${quantity} hộp "${product.name}" vào giỏ hàng thành công! 🐾`);
      
      // BẮN TÍN HIỆU CHO HEADER TỰ ĐỘNG CẬP NHẬT SỐ LƯỢNG GIỎ HÀNG
      window.dispatchEvent(new Event('update_cart'));
      
    } catch (error) {
      console.error("Lỗi thêm giỏ hàng:", error);
      alert("Ui da, có lỗi xảy ra khi thêm vào giỏ. Sen thử lại nhé!");
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFBFD]">
      <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
      <p className="font-bold text-orange-400 animate-pulse">Đang check kho hàng...</p>
    </div>
  );

  if (!product) return <div className="min-h-screen flex items-center justify-center font-bold">Không tìm thấy sản phẩm sếp ơi! 😿</div>;

  const finalPrice = product.discount_percent > 0 
    ? product.price * (1 - product.discount_percent / 100) 
    : product.price;

  // 🌟 FIX LỖI ẢNH: Ưu tiên cột imageurl, nếu trống thì tìm ở cột images, cuối cùng mới dùng ảnh mặc định
  const displayImageUrl = product.imageurl || (product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/800x800/ffedd5/ea580c?text=Beam+Petshop');

  return (
    <div className="min-h-screen bg-[#FFFBFD] text-stone-800 font-sans selection:bg-orange-200">
      <Header />

      <main className="pt-32 pb-24 container mx-auto px-4 lg:px-12 relative z-10">
        
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 mb-8">
          <Link href="/" className="hover:text-orange-500 transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href="/petshop" className="hover:text-orange-500 transition-colors">Petshop</Link>
          <span>/</span>
          <span className="text-orange-500">{product.category || 'Sản phẩm'}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
          
          {/* CỘT TRÁI: HÌNH ẢNH */}
          <div className="lg:w-1/2 sticky top-32">
            <div className="relative aspect-square rounded-[3.5rem] bg-white border border-orange-50 shadow-[0_30px_70px_-20px_rgba(249,115,22,0.15)] overflow-hidden group flex items-center justify-center">
              <img 
                src={displayImageUrl} 
                alt={product.name}
                className="w-full h-full object-contain p-12 group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/800x800/ffedd5/ea580c?text=Anh+Bi+Loi';
                }}
              />
              {product.discount_percent > 0 && (
                <div className="absolute top-8 left-8 bg-rose-500 text-white font-black px-5 py-2 rounded-2xl shadow-lg animate-bounce text-sm">
                  SALE {product.discount_percent}%
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN */}
          <div className="lg:w-1/2 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 text-orange-500 text-[10px] font-black uppercase tracking-widest mb-4">
                <span>✨</span> {product.brand || 'Thương hiệu cao cấp'}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-stone-800 leading-tight mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < Math.round(product.rating || 5) ? '★' : '☆'}</span>
                  ))}
                  <span className="text-stone-400 font-bold ml-2">({product.reviews_count || 0} đánh giá)</span>
                </div>
                <div className="h-4 w-[1px] bg-stone-200"></div>
                <div className="text-stone-500 font-bold">Đã bán: <span className="text-stone-800">{product.sales_count || 0}</span></div>
              </div>
            </div>

            {/* GIÁ CẢ */}
            <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-orange-50 shadow-sm flex items-center justify-between">
               <div>
                  <p className="text-4xl font-black text-orange-500">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice)}
                  </p>
                  {product.discount_percent > 0 && (
                    <p className="text-lg text-stone-400 line-through font-bold mt-1">
                       {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                    </p>
                  )}
               </div>
               <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${product.stock > 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                  {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
               </div>
            </div>

            {/* CHỌN SỐ LƯỢNG & MUA */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="flex items-center bg-white border border-stone-200 rounded-2xl p-1 shadow-sm">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-xl font-bold hover:bg-stone-50 rounded-xl transition-all"
                >
                  −
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-16 text-center font-black text-lg focus:outline-none bg-transparent"
                />
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center text-xl font-bold hover:bg-stone-50 rounded-xl transition-all"
                >
                  +
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={isAdding || product.stock === 0}
                className={`flex-1 font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all ${
                  product.stock === 0 
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-stone-900 text-white hover:bg-orange-500 hover:shadow-orange-200 active:scale-95'
                }`}
              >
                {isAdding ? (
                  <span className="animate-spin text-2xl">⚙️</span>
                ) : (
                  <>
                    <span className="text-2xl">🛒</span> {product.stock === 0 ? 'Tạm Hết Hàng' : 'Thêm Vào Giỏ Hàng'}
                  </>
                )}
              </button>
            </div>

            {/* THÔNG TIN CHI TIẾT */}
            <div className="pt-8">
              <div className="flex gap-8 border-b border-stone-100 mb-6">
                {['description', 'specs'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-orange-500' : 'text-stone-400'}`}
                  >
                    {tab === 'description' ? 'Mô tả chi tiết' : 'Thông số kỹ thuật'}
                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-full"></div>}
                  </button>
                ))}
              </div>

              <div className="text-stone-600 leading-relaxed text-sm">
                {activeTab === 'description' ? (
                  <div className="space-y-4 whitespace-pre-line">
                    {product.description || 'Đang cập nhật nội dung mô tả cho sản phẩm này...'}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-stone-50">
                      <p className="text-[10px] text-stone-400 font-black uppercase">Thương hiệu</p>
                      <p className="font-bold text-stone-800">{product.brand || 'Beam'}</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-stone-50">
                      <p className="text-[10px] text-stone-400 font-black uppercase">Xuất xứ</p>
                      <p className="font-bold text-stone-800">{product.origin || 'Việt Nam'}</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-stone-50">
                      <p className="text-[10px] text-stone-400 font-black uppercase">Danh mục</p>
                      <p className="font-bold text-stone-800">{product.category || 'Khác'}</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-stone-50">
                      <p className="text-[10px] text-stone-400 font-black uppercase">Hạn sử dụng</p>
                      <p className="font-bold text-stone-800">{product.expiry_date ? new Date(product.expiry_date).toLocaleDateString('vi-VN') : 'Xem trên bao bì'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}