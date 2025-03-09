import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Store = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const useSideMenuStore = create<Store>()(
  persist(
    (set) => ({
      isOpen: false,
      setIsOpen: (isOpen: boolean) => set({ isOpen }),
    }),
    { name: "sideMenu", storage: createJSONStorage(() => localStorage) }
  )
);
