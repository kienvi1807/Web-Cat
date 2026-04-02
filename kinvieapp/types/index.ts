export interface UserPet {
  id: number;
  name: string;
  breed: string;
  age: string;
  status: 'Khoe mạnh' | 'Đang đi show' | 'Cần tư vấn';
}

export interface Order {
  id: string;
  date: string;
  total: string;
  status: 'Đã giao' | 'Đang xử lý' | 'Đã hủy';
}

export interface UserProfile {
  name: string;
  age: number;
  phone: string;
  address: string;
  rank: 'Đồng' | 'Bạc' | 'Vàng' | 'Kim Cương';
  totalSpent: string;
  pets: UserPet[];
  orders: Order[];
}

export interface Cat {
  id: number;
  name: string;
  breed: string;
  color: string;
  age: string;
  price: string;
  img: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  img: string;
}

export interface BlogPost {
  id: number;
  title: string;
  date: string;
  img: string;
}