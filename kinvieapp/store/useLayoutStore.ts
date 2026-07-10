import { create } from 'zustand';

interface LayoutState {
  themeColor: 'red' | 'orange' | 'teal' | 'pink' | 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'sunset' | 'aqua';
  setThemeColor: (color: 'red' | 'orange' | 'teal' | 'pink' | 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'sunset' | 'aqua') => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  themeColor: 'red', // Màu mặc định
  setThemeColor: (color) => set({ themeColor: color }),
}));