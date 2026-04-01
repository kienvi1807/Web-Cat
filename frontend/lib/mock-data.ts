import { Cat, Product, BlogPost } from '@/types';
import { UserProfile } from '@/types';

export const USER_DATA: UserProfile = {
  name: 'Nguyễn Trung Kiên',
  age: 27,
  phone: '0988.xxx.xxx',
  address: 'Đống Đa, Hà Nội',
  rank: 'Kim Cương',
  totalSpent: '150.000.000đ',
  pets: [
    { id: 1, name: 'Bé Bánh Bao', breed: 'Maine Coon', age: '14 tháng', status: 'Khoe mạnh' },
    { id: 2, name: 'Bé Mochi', breed: 'Maine Coon', age: '6 tháng', status: 'Đang đi show' }
  ],
  orders: [
    { id: 'KV-1001', date: '28/03/2026', total: '1.200.000đ', status: 'Đã giao' },
    { id: 'KV-0982', date: '15/02/2026', total: '25.000.000đ', status: 'Đã giao' },
    { id: 'KV-0850', date: '10/01/2026', total: '450.000đ', status: 'Đã giao' }
  ]
};

export const FEATURED_CATS: Cat[] = [
  { id: 1, name: 'Bé Gaia', breed: 'Maine Coon', color: 'Black Tabby', age: '12', price: '40.000.000', img: '/bemeo-1.jpg' },
  { id: 2, name: 'Bé Freya', breed: 'Maine Coon', color: 'Silver Shade', age: '10', price: '30.000.000', img: '/bemeo-2.jpg' },
  { id: 3, name: 'Bé Sữa', breed: 'Maine Coon', color: 'Solid White', age: '8', price: 'Liên hệ', img: '' },
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

export const ALL_CATS: Cat[] = [
  { id: 1, name: 'Bé Bánh Bao', breed: 'Maine Coon', color: 'Red Tabby', age: 'Kitten (2-4 tháng)', price: '25.000.000đ', img: '' },
  { id: 2, name: 'Bé Freya', breed: 'Maine Coon', color: 'Silver Shade', age: 'Junior (5-8 tháng)', price: '30.000.000đ', img: '' },
  { id: 3, name: 'Bé Sữa', breed: 'Maine Coon', color: 'Solid White', age: 'Adult (> 8 tháng)', price: '20.000.000đ', img: '' },
  { id: 4, name: 'Bé Thor', breed: 'Maine Coon', color: 'Bicolor', age: 'Kitten (2-4 tháng)', price: '28.000.000đ', img: '' },
  { id: 5, name: 'Bé Loki', breed: 'Maine Coon', color: 'Black Tabby', age: 'Junior (5-8 tháng)', price: 'Liên hệ', img: '' },
  { id: 6, name: 'Bé Mochi', breed: 'Ragdoll', color: 'Bicolor', age: 'Kitten (2-4 tháng)', price: '22.000.000đ', img: '' },
];