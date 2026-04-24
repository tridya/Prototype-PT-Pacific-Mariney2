import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Module = 'sm' | 'pmt' | 'uwc';

interface MaritimeState {
  activeModule: Module;
  setActiveModule: (module: Module) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useMaritimeStore = create<MaritimeState>()(
  persist(
    (set) => ({
      activeModule: 'sm',
      setActiveModule: (module) => set({ activeModule: module }),
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'maritime-storage',
    }
  )
);
