import { create } from 'zustand';

interface MenuState {
  activeMenuNodeId: string | null;
  setActiveMenuNodeId: (nodeId: string | null) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  activeMenuNodeId: null,
  setActiveMenuNodeId: (nodeId) => set({ activeMenuNodeId: nodeId }),
})); 