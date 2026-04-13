import { create } from 'zustand';

interface LayoutState {
  themeColor: 'red' | 'orange' | 'teal' | 'pink' | 'blue' | 'emerald' | 'purple';
  setThemeColor: (color: 'red' | 'orange' | 'teal' | 'pink' | 'blue' | 'emerald' | 'purple') => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  themeColor: 'red', // Màu mặc định
  setThemeColor: (color) => set({ themeColor: color }),
}));