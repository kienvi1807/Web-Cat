import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  loadingText: string;
  showLoading: (text?: string) => void;
  hideLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  loadingText: 'Đang xử lý...',
  showLoading: (text = 'Đang tải dữ liệu...') => set({ isLoading: true, loadingText: text }),
  hideLoading: () => set({ isLoading: false }),
}));