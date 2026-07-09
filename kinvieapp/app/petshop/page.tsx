"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/common/ProductCard';
import { getAffiliatePlatform } from '@/lib/utils';
import GlassSelect from '@/components/ui/GlassSelect';

export default function PetshopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('Tất cả');
  const [sortOption, setSortOption] = useState<string>('popular');
  const [filterMinRating, setFilterMinRating] = useState<number>(0);
  const [filterSupplier, setFilterSupplier] = useState<string>('Tất cả');

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          // Tạm thời em lấy TẤT CẢ sản phẩm để sếp test (Bỏ lọc 'Sẵn sàng')
          // Nếu sếp muốn chỉ lấy hàng Sẵn sàng thì thêm lại: .eq('status', 'Sẵn sàng')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && Array.isArray(data)) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Lỗi kéo sản phẩm:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 🌟 FIX LỖI SẬP WEB 1: Đảm bảo products luôn là mảng hợp lệ
  const safeProducts = Array.isArray(products) ? products : [];

  // 🌟 FIX LỖI SẬP WEB 2: Ép tất cả category về dạng Chuỗi (String) để không bị lỗi hàm .includes()
  const categories = ['Tất cả', ...Array.from(new Set(
    safeProducts.map(p => p?.category ? String(p.category).trim() : 'Khác').filter(Boolean)
  ))];

  const matchesSupplierFilterOnly = (product: any, key: string) => {
    if (key === 'Tất cả') return true;
    if (key === 'Shop hiện tại') return !product.is_affiliate;
    if (key === 'Shopee') return !!product.is_affiliate && getAffiliatePlatform(product.affiliate_url) === 'shopee';
    if (key === 'TikTok') return !!product.is_affiliate && getAffiliatePlatform(product.affiliate_url) === 'tiktok';
    return true;
  };

  const matchesSupplierFilter = (product: any) => {
    if (filterSupplier === 'Tất cả') return true;
    if (filterSupplier === 'Shop hiện tại') return !product.is_affiliate;
    if (filterSupplier === 'Shopee') return !!product.is_affiliate && getAffiliatePlatform(product.affiliate_url) === 'shopee';
    if (filterSupplier === 'TikTok') return !!product.is_affiliate && getAffiliatePlatform(product.affiliate_url) === 'tiktok';
    return true;
  };

  let filteredProducts = safeProducts.filter(product => {
    if (!product) return false;
    const catStr = product.category ? String(product.category).trim() : 'Khác';
    const matchesCategory = filterCategory === 'Tất cả' || catStr === filterCategory;
    const matchesRating = filterMinRating === 0 || Number(product.rating || 0) >= filterMinRating;
    return matchesCategory && matchesRating && matchesSupplierFilter(product);
  });

  // 🌟 FIX LỖI SẬP WEB 3: Hàm tính giá an toàn, không bao giờ bị lỗi tính toán (NaN)
  const getFinalPrice = (p: any) => {
    const rawPrice = Number(p?.price) || 0;
    const discount = Number(p?.discount_percent) || 0;
    return discount > 0 ? rawPrice * (1 - discount / 100) : rawPrice;
  };

  if (sortOption === 'price_asc') {
    filteredProducts.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
  } else if (sortOption === 'price_desc') {
    filteredProducts.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
  } else if (sortOption === 'newest') {
    filteredProducts.sort((a, b) => new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime());
  } else {
    filteredProducts.sort((a, b) => (Number(b?.sales_count) || 0) - (Number(a?.sales_count) || 0));
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-700 font-sans">
      <Header />

      <main className="pt-32 pb-20 container mx-auto px-4 relative z-10">

        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-pink-100 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white w-14 h-14 flex items-center justify-center rounded-2xl shadow-sm"><span className="text-2xl">🏪</span></div>
            </div>
            <h1 className="text-4xl font-serif font-bold text-stone-800 mb-2">Beam Petshop</h1>
            <p className="text-stone-500">Phụ kiện & Dinh dưỡng cao cấp cho Boss</p>
          </div>
          <div className="mt-4 md:mt-0 bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium text-stone-500 border border-stone-100">
            Hiển thị <span className="text-pink-500 font-bold">{filteredProducts.length}</span> sản phẩm
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          <div className="lg:w-1/4">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 sticky top-32">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-stone-800">
                <span>📑</span> Danh Mục Sản Phẩm
              </h3>

              <div className="flex flex-col gap-2">
                {categories.map(category => {
                  // Ép về string để so sánh an toàn
                  const catStr = String(category);
                  const icon = (catStr.includes('Thức ăn') || catStr.includes('Pate')) ? '🥫' :
                    catStr.includes('Đồ chơi') ? '🧶' :
                      (catStr.includes('Chăm sóc') || catStr.includes('Cát')) ? '🛁' :
                        catStr === 'Tất cả' ? '📦' : '🎀';

                  return (
                    <button
                      key={catStr}
                      onClick={() => setFilterCategory(catStr)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${filterCategory === catStr
                        ? 'bg-pink-50 text-pink-600 font-bold border border-pink-200'
                        : 'bg-transparent text-stone-600 hover:bg-stone-50 border border-transparent hover:border-stone-200'
                        }`}
                    >
                      <span className="flex items-center gap-2">
                        {icon} {catStr}
                      </span>

                      <span className="bg-white px-2 py-0.5 rounded-md text-xs text-stone-400 shadow-sm border border-stone-100">
                        {catStr === 'Tất cả'
                          ? safeProducts.length
                          : safeProducts.filter(p => String(p?.category).trim() === catStr).length}
                      </span>
                    </button>
                  );
                })}
                <div className="mt-8">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-stone-800">
                    <span>🏷️</span> Nhà Cung Cấp
                  </h3>
                  <div className="flex flex-col gap-2">
                    {[
                      { key: 'Tất cả', icon: '📦' },
                      { key: 'Shop hiện tại', icon: '🏠' },
                      { key: 'Shopee', icon: '🛍️' },
                      { key: 'TikTok', icon: '🎵' },
                    ].map(({ key, icon }) => (
                      <button
                        key={key}
                        onClick={() => setFilterSupplier(key)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${filterSupplier === key
                          ? 'bg-pink-50 text-pink-600 font-bold border border-pink-200'
                          : 'bg-transparent text-stone-600 hover:bg-stone-50 border border-transparent hover:border-stone-200'
                          }`}
                      >
                        <span className="flex items-center gap-2">{icon} {key}</span>
                        <span className="bg-white px-2 py-0.5 rounded-md text-xs text-stone-400 shadow-sm border border-stone-100">
                          {safeProducts.filter(p => matchesSupplierFilterOnly(p, key)).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-stone-800">
                    <span>⭐</span> Đánh Giá
                  </h3>
                  <div className="flex flex-col gap-2">
                    {[0, 4, 3, 2].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFilterMinRating(star)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${filterMinRating === star
                          ? 'bg-amber-50 text-amber-600 font-bold border border-amber-200'
                          : 'bg-transparent text-stone-600 hover:bg-stone-50 border border-transparent hover:border-stone-200'
                          }`}
                      >
                        {star === 0 ? <span>Tất cả</span> : (
                          <>
                            <span className="flex items-center gap-0.5 text-amber-400">
                              {[1, 2, 3, 4, 5].map(s => <span key={s}>{s <= star ? '★' : '☆'}</span>)}
                            </span>
                            <span>trở lên</span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl p-5 text-white shadow-md relative overflow-hidden group cursor-pointer">
                <div className="absolute -right-4 -bottom-4 text-6xl opacity-20 transform group-hover:scale-110 transition-transform">🎁</div>
                <h4 className="font-bold mb-1 relative z-10">Voucher 50K</h4>
                <p className="text-xs text-pink-50 relative z-10 mb-3">Cho đơn hàng đầu tiên từ 500k</p>
                <button className="bg-white text-pink-500 text-xs font-bold px-3 py-1.5 rounded-lg relative z-10 hover:bg-pink-50">Lấy mã ngay</button>
              </div>

            </div>
          </div>

          <div className="lg:w-3/4">

            <div className="flex justify-end mb-4">
              <div className="w-full sm:w-56">
                <GlassSelect
                  id="petshop-sort"
                  themeColor="pink"
                  allowClear={false}
                  selectedValue={sortOption}
                  onChange={setSortOption}
                  options={[
                    { value: 'popular', label: '🔥 Phổ biến nhất' },
                    { value: 'price_asc', label: '💵 Giá: Thấp đến Cao' },
                    { value: 'price_desc', label: '💎 Giá: Cao xuống Thấp' },
                    { value: 'newest', label: '✨ Mới cập nhật' },
                  ]}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-orange-400">
                <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-black uppercase tracking-widest animate-pulse">Đang dọn kho hàng...</h2>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  // Thêm Math.random() vào key phòng trường hợp có sản phẩm bị lỗi id
                  <ProductCard key={product?.id || Math.random()} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-stone-100 rounded-[2rem] p-12 text-center flex flex-col items-center justify-center shadow-sm min-h-[40vh]">
                <span className="text-5xl mb-4 grayscale opacity-40">📦</span>
                <h3 className="text-xl font-bold text-stone-700 mb-2">Chưa có hàng!</h3>
                <p className="text-stone-500">Danh mục này hiện chưa có sản phẩm. Bạn vui lòng xem món khác nhé.</p>
                <button
                  onClick={() => {
                    setFilterCategory('Tất cả');
                    setSortOption('popular');
                    setFilterMinRating(0);
                    setFilterSupplier('Tất cả');
                  }}
                  className="mt-6 bg-orange-50 text-orange-500 px-6 py-3 rounded-full font-bold hover:bg-orange-100 transition-colors"
                >
                  Xóa bộ lọc & Xem tất cả
                </button>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}