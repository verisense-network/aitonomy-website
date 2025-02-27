import { create } from "zustand";
import { createComputed } from "zustand-computed";
import { persist, createJSONStorage } from "zustand/middleware";
import { WalletId } from "@/utils/wallet/connect";

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
  setWallet: (wallet: WalletId) => void;
  setUser: (data: SetUser) => void;
  logout: () => void;
};

type ComputedStore = {
  isLogin: boolean;
};

const computed = createComputed(
  (state: Store): ComputedStore => ({
    isLogin: state.publicKey.length > 0,
  })
);

export const useUserStore = create<Store>()(
  persist(
    computed((set) => ({
      name: "",
      wallet: WalletId.OKX,
      address: "",
      publicKey: new Uint8Array(0),
      setWallet: (wallet) => set({ wallet }),
      setUser: (data) => set(data),
      logout: () =>
        set({
          wallet: undefined,
          name: "",
          publicKey: new Uint8Array(0),
          address: "",
        }),
    })),
    { name: "user", storage: createJSONStorage(() => localStorage) }
  )
);
