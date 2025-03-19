import { create } from "zustand";
import { createComputed } from "zustand-computed";
import { persist, createJSONStorage } from "zustand/middleware";
import { WalletId } from "@/utils/wallet/id";

type SetUser = {
  name: string;
  publicKey: Uint8Array;
  address: string;
};

type Store = {
  name: string;
  wallet: WalletId;
  address: string;
  publicKey: Uint8Array;
  lastPostAt: number | null;
  setWallet: (wallet: WalletId) => void;
  setUser: (data: SetUser) => void;
  setUserName: (name: string) => void;
  logout: () => void;
  setLastPostAt: (lastPostAt: number | null) => void;
};

type ComputedStore = {
  isLogin: boolean;
};

const computed = createComputed(
  (state: Store): ComputedStore => ({
    isLogin: Object.values(state.publicKey).length > 0,
  })
);

export const useUserStore = create<Store>()(
  persist(
    computed((set) => ({
      name: "",
      wallet: WalletId.METAMASK,
      address: "",
      publicKey: new Uint8Array(0),
      lastPostAt: null,
      setWallet: (wallet) => set({ wallet }),
      setUser: (data) => set(data),
      setUserName: (name: string) => set({ name }),
      logout: () =>
        set({
          wallet: undefined,
          name: "",
          publicKey: new Uint8Array(0),
          address: "",
          lastPostAt: null,
        }),
      setLastPostAt: (lastPostAt: number | null) => set({ lastPostAt }),
    })),
    { name: "user", storage: createJSONStorage(() => localStorage) }
  )
);
