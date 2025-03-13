import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Store = {
  isMobile: boolean;
  sideBarIsOpen: boolean;
  welcomeModalIsOpen: boolean;
  welcomeModalIsReabled: boolean;
  setSideBarIsOpen: (isOpen: boolean) => void;
  setWelcomeModalIsOpen: (isOpen: boolean) => void;
  setWelcomeModalIsReabled: (isReabled: boolean) => void;
};

export const isMobile =
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 768px)").matches;

export const useAppearanceStore = create<Store>()(
  persist(
    (set) => ({
      isMobile,
      sideBarIsOpen: true,
      welcomeModalIsOpen: false,
      welcomeModalIsReabled: false,
      setSideBarIsOpen: (isOpen: boolean) => set({ sideBarIsOpen: isOpen }),
      setWelcomeModalIsOpen: (isOpen: boolean) =>
        set({ welcomeModalIsOpen: isOpen }),
      setWelcomeModalIsReabled: (isReabled: boolean) =>
        set({ welcomeModalIsReabled: isReabled }),
    }),
    { name: "appearance", storage: createJSONStorage(() => localStorage) }
  )
);
