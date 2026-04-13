import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- 1. ĐỊNH NGHĨA DATA KHÁC NHAU ---
export interface CatItem {
  id: string;
  name: string;
  image: string;
  breed: string;
  cattery: string;
  color: string;
  dob: string;
  price: number;
}

export interface ProductItem {
  id: string;
  name: string;
  image: string;
  category?: string; // Cho đồ petshop (Ví dụ: Cát, Vòng cổ)
  flavor?: string;   // Cho Pate tươi (Ví dụ: Bò, Gà, Cá hồi)
  weight?: string;   // Ví dụ: 500g, 1kg
  price: number;
  quantity: number;  // 👈 Sản phẩm thì phải có số lượng
}

// --- 2. CẤU TRÚC KHO ---
interface CartState {
  breederCats: CatItem[];
  customerCats: CatItem[];
  petshopItems: ProductItem[];
  pateItems: ProductItem[];
  
  // Hành động (Tách hàm ra cho dễ gọi)
  addCat: (type: 'breeder' | 'customer', cat: CatItem) => void;
  removeCat: (type: 'breeder' | 'customer', id: string) => void;
  
  addProduct: (type: 'petshop' | 'pate', product: ProductItem) => void;
  updateProductQuantity: (type: 'petshop' | 'pate', id: string, amount: number) => void;
  removeProduct: (type: 'petshop' | 'pate', id: string) => void;
}

// --- 3. KHỞI TẠO ZUSTAND ---
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      breederCats: [],
      customerCats: [],
      petshopItems: [],
      pateItems: [],

      // Thêm mèo (Kiểm tra trùng lặp)
      addCat: (type, cat) => set((state) => {
        const targetList = type === 'breeder' ? state.breederCats : state.customerCats;
        if (targetList.some(item => item.id === cat.id)) return state;
        return type === 'breeder' 
          ? { breederCats: [...state.breederCats, cat] }
          : { customerCats: [...state.customerCats, cat] };
      }),

      removeCat: (type, id) => set((state) => (
        type === 'breeder' 
          ? { breederCats: state.breederCats.filter(c => c.id !== id) }
          : { customerCats: state.customerCats.filter(c => c.id !== id) }
      )),

      // Thêm sản phẩm (Cộng dồn số lượng nếu đã có)
      addProduct: (type, product) => set((state) => {
        const targetList = type === 'petshop' ? state.petshopItems : state.pateItems;
        const existingItem = targetList.find(p => p.id === product.id);
        
        let newList;
        if (existingItem) {
          newList = targetList.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
        } else {
          newList = [...targetList, { ...product, quantity: 1 }];
        }

        return type === 'petshop' ? { petshopItems: newList } : { pateItems: newList };
      }),

      updateProductQuantity: (type, id, amount) => set((state) => {
         const targetList = type === 'petshop' ? state.petshopItems : state.pateItems;
         const newList = targetList.map(p => {
           if (p.id === id) {
             const newQty = Math.max(1, p.quantity + amount); // Không cho giảm xuống âm
             return { ...p, quantity: newQty };
           }
           return p;
         });
         return type === 'petshop' ? { petshopItems: newList } : { pateItems: newList };
      }),

      removeProduct: (type, id) => set((state) => (
        type === 'petshop'
          ? { petshopItems: state.petshopItems.filter(p => p.id !== id) }
          : { pateItems: state.pateItems.filter(p => p.id !== id) }
      )),
    }),
    { name: 'kinvie-multi-cart' }
  )
);