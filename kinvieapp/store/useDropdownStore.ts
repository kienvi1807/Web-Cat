import { create } from 'zustand';

interface DropdownState {
  activeDropdownId: string | null;
  setActiveDropdownId: (id: string | null) => void;
}

export const useDropdownStore = create<DropdownState>((set) => ({
  activeDropdownId: null,
  setActiveDropdownId: (id) => set({ activeDropdownId: id }),
}));