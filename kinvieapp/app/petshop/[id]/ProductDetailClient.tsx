"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import { useLoadingStore } from '@/store/useLoadingStore';
import Link from 'next/link';

export default function ProductDetailClient() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showLoading: showGlobalLoading, hideLoading: hideGlobalLoading } = useLoadingStore();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // 🌟 KHAI BÁO STATE QUẢN LÝ USER VÀ TRẠNG THÁI ADD CART
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [dbUserId, setDbUserId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [eligibleOrderId, setEligibleOrderId] = useState<number | null>(null);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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
      showGlobalLoading('Đang check kho hàng...');
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error('Không tìm thấy sản phẩm');
        setProduct(data);
      } catch (err) {
        console.error("Lỗi lấy chi tiết sản phẩm:", err);
      } finally {
        setIsLoading(false);
        hideGlobalLoading();
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // Lấy userid dạng số (int) để dùng cho bảng reviews
  useEffect(() => {
    const fetchDbUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: dbUser } = await supabase.from('users').select('userid').eq('email', user.email).maybeSingle();
      if (dbUser) setDbUserId(dbUser.userid);
    };
    fetchDbUser();
  }, []);

  // Lấy danh sách đánh giá + kiểm tra khách có được đánh giá không (đã mua & đã giao & chưa review)
  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('product_reviews')
        .select('*, users(fullname)')
        .eq('product_id', id)
        .order('created_at', { ascending: false });
      if (data) setReviews(data);
    };
    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (!dbUserId || !id) return;
    const checkEligibility = async () => {
      const { data: purchases } = await supabase
        .from('orderdetails')
        .select('orderid, orders!inner(orderid, userid, orderstatus)')
        .eq('productid', id)
        .eq('orders.userid', dbUserId)
        .eq('orders.orderstatus', 'Đã giao hàng');

      if (!purchases || purchases.length === 0) return;

      const { data: myReviews } = await supabase
        .from('product_reviews')
        .select('order_id')
        .eq('product_id', id)
        .eq('user_id', dbUserId);

      const reviewedIds = (myReviews || []).map(r => r.order_id);
      const unreviewed = purchases.find((p: any) => !reviewedIds.includes(p.orderid));
      if (unreviewed) setEligibleOrderId(unreviewed.orderid);
    };
    checkEligibility();
  }, [dbUserId, id]);

  // 🌟 HÀM XỬ LÝ THÊM VÀO GIỎ HÀNG CHUẨN (ĐÃ FIX LỖI TÌM KIẾM)
  const handleAddToCart = async () => {
    try {
      // 1. Kiểm tra đăng nhập
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Sen cần đăng nhập để thêm Boss vào giỏ nhé!");
        // router.push('/login'); // Có thể mở comment dòng này để đá về trang login
        return;
      }

      const { data: dbUser } = await supabase
        .from('users')
        .select('userid')
        .eq('email', user.email)
        .maybeSingle();

      if (!dbUser) {
        alert("Không tìm thấy thông tin tài khoản của Sen!");
        return;
      }

      // 3. 🎯 LUẬT THÉP: Kiểm tra sản phẩm đã có trong giỏ chưa bằng .maybeSingle()
      const currentVariant = 'Mặc định';

      const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', dbUser.userid)
        .eq('product_id', product.id)
        .eq('variant', currentVariant)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingItem) {
        // Đã có -> Cộng dồn số lượng
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity }) // Thay quantity bằng state số lượng của sếp
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Chưa có -> Thêm dòng mới
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert([{
            user_id: dbUser.userid,
            product_id: product.id,
            variant: currentVariant,
            quantity: quantity // Thay quantity bằng state số lượng của sếp
          }]);

        if (insertError) throw insertError;
      }

      // 4. Thành công -> Bắn pháo hoa & Cập nhật số trên Header
      alert("Đã thêm vào giỏ hàng thành công! 🛍️");
      window.dispatchEvent(new Event('update_cart'));

    } catch (error: any) {
      console.error("Lỗi thêm giỏ hàng:", error);
      alert("Ui da, có lỗi xảy ra khi thêm vào giỏ. Sen thử lại nhé: " + error.message);
    }
  };

  const handleSubmitReview = async () => {
    if (!eligibleOrderId || !dbUserId) return;
    setIsSubmittingReview(true);
    const { error } = await supabase.from('product_reviews').insert({
      product_id: id, order_id: eligibleOrderId, user_id: dbUserId,
      rating: myRating, comment: myComment.trim()
    });
    setIsSubmittingReview(false);
    if (error) return alert("Lỗi khi gửi đánh giá: " + error.message);

    alert("✅ Cảm ơn Sen đã đánh giá!");
    setEligibleOrderId(null); setMyComment(''); setMyRating(5);

    const { data } = await supabase.from('product_reviews').select('*, users(fullname)').eq('product_id', id).order('created_at', { ascending: false });
    if (data) setReviews(data);
    const { data: updated } = await supabase.from('products').select('rating, reviews_count').eq('id', id).maybeSingle();
    if (updated) setProduct((prev: any) => ({ ...prev, ...updated }));
  };

  if (isLoading) return null;

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
          <div className="lg:w-1/2 lg:sticky lg:top-32">
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
                className={`flex-1 font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all ${product.stock === 0
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

        {/* 🌟 ĐÁNH GIÁ TỪ KHÁCH HÀNG */}
        <div className="mt-16 bg-white rounded-[2.5rem] border border-orange-50 shadow-sm p-8 md:p-10">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <h2 className="text-2xl font-black text-stone-800">Đánh giá từ khách hàng</h2>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-amber-500">{(product.rating || 0).toFixed(1)}</span>
              <div className="flex flex-col">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map(s => <span key={s}>{s <= Math.round(product.rating || 0) ? '★' : '☆'}</span>)}
                </div>
                <span className="text-xs text-stone-400 font-bold">{product.reviews_count || 0} đánh giá</span>
              </div>
            </div>
          </div>

          {eligibleOrderId && (
            <div className="bg-orange-50/50 border border-orange-100 rounded-[2rem] p-6 mb-8">
              <h3 className="font-bold text-stone-800 mb-4">Sen đã nhận hàng — để lại đánh giá nhé!</h3>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(s => (
                  <svg key={s} onClick={() => setMyRating(s)} className={`w-7 h-7 cursor-pointer ${s <= myRating ? 'text-amber-400 fill-amber-400' : 'text-stone-300 fill-transparent'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ))}
              </div>
              <textarea value={myComment} onChange={(e) => setMyComment(e.target.value)} rows={3} placeholder="Sản phẩm dùng thế nào Sen ơi..." className="w-full bg-white border border-stone-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-orange-300 mb-4 resize-none" />
              <button onClick={handleSubmitReview} disabled={isSubmittingReview} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-2xl transition-all disabled:opacity-60">
                {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          )}

          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-stone-400 font-medium text-center py-8">Chưa có đánh giá nào cho sản phẩm này.</p>
            ) : reviews.map((r) => (
              <div key={r.id} className="border-b border-stone-100 pb-6 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-stone-700">{r.users?.fullname || 'Khách hàng'}</span>
                  <span className="text-xs text-stone-400">{new Date(r.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-0.5 text-amber-400 mb-2">
                  {[1, 2, 3, 4, 5].map(s => <span key={s}>{s <= r.rating ? '★' : '☆'}</span>)}
                </div>
                {r.comment && <p className="text-stone-600 text-sm leading-relaxed">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}