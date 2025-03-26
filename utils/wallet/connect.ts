"use client";

import { useUserStore } from "@/stores/user";
import { getWalletConnect } from "./index";
import { WalletId } from "./id";
import { getAccountInfo } from "@/app/actions";

export async function connectToWallet(walletId: WalletId) {
  const walletConnect = getWalletConnect(walletId);

  const msg = await walletConnect.connect();

  if (msg && !walletConnect.address) {
    throw msg;
  }

  const publicKey = walletConnect.publicKey;
  const address = walletConnect.address;

  const userStore = useUserStore.getState();
  const addressName = address.slice(0, 4);

  const {
    success,
    data: account,
    message: errorMessage,
  } = await getAccountInfo({
    accountId: address,
  });

  if (!success || !account) {
    throw new Error(errorMessage);
  }

  updateAccountInfo({
    address,
    publicKey,
    name: account.alias || addressName,
    lastPostAt: account.last_post_at,
  });

  userStore.setWallet(walletId);

  return publicKey;
}

interface AccountInfo {
  address: string;
  publicKey: Uint8Array;
  name?: string;
  lastPostAt?: number;
}
export function updateAccountInfo({
  address,
  publicKey,
  name,
  lastPostAt,
}: AccountInfo) {
  const { setUser, setLastPostAt } = useUserStore.getState();
  if (!address || !publicKey) {
    return;
  }

  const userName = name || address.slice(0, 4);
  setUser({ name: userName, publicKey, address });
  if (lastPostAt) {
    setLastPostAt(lastPostAt);
  }
}
