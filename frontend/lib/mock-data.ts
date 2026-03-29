import { Cat, Product, BlogPost } from '@/types';

export const FEATURED_CATS: Cat[] = [
  { id: 1, name: 'Bé Gaia', breed: 'Maine Coon', color: 'Black Tabby', price: '40.000.000', img: '/bemeo-1.jpg' },
  { id: 2, name: 'Bé Freya', breed: 'Maine Coon', color: 'Silver Shade', price: '30.000.000', img: '/bemeo-2.jpg' },
  { id: 3, name: 'Bé Sữa', breed: 'Maine Coon', color: 'Solid White', price: 'Liên hệ', img: '' },
];

export const SHOP_PRODUCTS: Product[] = [
  { id: 1, name: 'Pate Nhuyễn Dinh Dưỡng Boss', price: '45.000đ', category: 'Thức ăn', img: '' },
  { id: 2, name: 'Cần Câu Mèo Gắn Lông Vũ', price: '35.000đ', category: 'Đồ chơi', img: '' },
  { id: 3, name: 'Sữa Tắm Kích Lông Show Cat', price: '250.000đ', category: 'Chăm sóc', img: '' },
  { id: 4, name: 'Bát Ăn Chống Gù Cổ Pastel', price: '120.000đ', category: 'Phụ kiện', img: '' },
];

export const BLOG_POSTS: BlogPost[] = [
  { id: 1, title: 'Bí quyết giúp lông Maine Coon luôn bung xù và mềm mượt', date: '28/03/2026', img: '' },
  { id: 2, title: 'Cần chuẩn bị những gì khi đón bé mèo đầu tiên về nhà?', date: '25/03/2026', img: '' },
];