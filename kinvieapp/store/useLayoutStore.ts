import { create } from 'zustand';

interface LayoutState {
  themeColor: 'red' | 'orange' | 'teal' | 'pink' | 'blue' | 'emerald' | 'purple' | 'amber';
  setThemeColor: (color: 'red' | 'orange' | 'teal' | 'pink' | 'blue' | 'emerald' | 'purple' | 'amber') => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  themeColor: 'red', // Màu mặc định
  setThemeColor: (color) => set({ themeColor: color }),
}));