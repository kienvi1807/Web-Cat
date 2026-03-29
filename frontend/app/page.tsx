import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/home/HeroBanner';
import CatteryList from '@/components/home/CatteryList';
import PetshopGrid from '@/components/home/PetshopGrid';
import BlogPreview from '@/components/home/BlogPreview';

import { FEATURED_CATS, SHOP_PRODUCTS, BLOG_POSTS } from '@/lib/mock-data';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-stone-700 font-sans overflow-hidden relative">
      {/* HIỆU ỨNG VẾT SƠN LOANG BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-200/40 rounded-full mix-blend-multiply blur-[100px]"></div>
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-rose-100/50 rounded-full mix-blend-multiply blur-[80px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-100/60 rounded-full mix-blend-multiply blur-[120px]"></div>
      </div>

      <Header />

      <main className="relative z-10 pt-32 pb-16">
        <HeroBanner />
        
        {/* Truyền dữ liệu từ file mock-data.ts vào các khối giao diện */}
        <CatteryList cats={FEATURED_CATS} />
        <PetshopGrid products={SHOP_PRODUCTS} />
        <BlogPreview posts={BLOG_POSTS} />
      </main>

      <Footer />
    </div>
  );
}