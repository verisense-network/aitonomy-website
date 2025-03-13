import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type SetSignature = {
  community: string;
  signature: string;
};

type Store = {
  community: string;
  signature: string;
  setSignature: (data: SetSignature) => void;
};

export const usePaymentCommunityStore = create<Store>()(
  persist(
    (set) => ({
      community: "",
      signature: "",
      setSignature: (data: SetSignature) => set(data),
    }),
    { name: "paymentCommunity", storage: createJSONStorage(() => localStorage) }
  )
);
