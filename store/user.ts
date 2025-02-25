import bs58 from "bs58";
import { create } from "zustand";
import { createComputed } from "zustand-computed";
import { persist, createJSONStorage } from 'zustand/middleware'
import { WalletId } from "@/utils/wallet/connect";

type SetUser = {
  publicKey: string;
  address: string;
}

type Store = {
  wallet?: WalletId;
  address: string;
  publicKey: string;
  setWallet: (wallet: WalletId) => void;
  setUser: ({ publicKey, address }: SetUser) => void;
  logout: () => void;
};

type ComputedStore = {
  name: string;
  isLogin: boolean;
};

const computed = createComputed(
  (state: Store): ComputedStore => ({
    name: bs58.encode(Buffer.from(state.publicKey, 'base64')).slice(0, 4),
    isLogin: state.publicKey !== "",
  })
);

export const useUserStore = create<Store>()(
  persist(
    computed((set) => ({
      wallet: undefined,
      address: "",
      publicKey: "",
      setWallet: (wallet) => set({ wallet }),
      setUser: (data) => set(data),
      logout: () => set({ publicKey: "", address: "" }),
    })),
    { name: "user", storage: createJSONStorage(() => localStorage) }
  )
);
