"use client";

import { useUserStore } from "@/stores/user";
import { getWalletConnect } from "./index";
import { WalletId } from "./id";

export async function connectToWallet(walletId: WalletId) {
  const walletConnect = getWalletConnect(walletId);

  const msg = await walletConnect.connect();

  if (msg && !walletConnect.address) {
    throw msg;
  }

  const publicKey = walletConnect.publicKey;
  const address = walletConnect.address;

  const userStore = useUserStore.getState();
  const name = address.slice(0, 4);

  userStore.setUser({ name, publicKey, address });
  userStore.setWallet(walletId);

  return publicKey;
}
