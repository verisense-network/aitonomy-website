import { getAccountInfo } from "@/app/actions";
import { useUserStore } from "@/stores/user";
import { ethers } from "ethers";
import { getWalletConnect } from "./wallet";

export const NAME_NOT_SET = "Name not set";

export async function updateAccountInfo() {
  try {
    const {
      wallet: walletId,
      address,
      setUserName,
      setLastPostAt,
    } = useUserStore.getState();

    if (!address) {
      return;
    }

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
    const aliasName = account?.alias || address?.slice(0, 4);
    setUserName(aliasName);
    setLastPostAt(account.last_post_at);

    const wallet = getWalletConnect(walletId);

    wallet.checkConnected();
  } catch (e: any) {
    console.error("updateAccountInfo error", e);
  }
}

export async function addMetaMaskListener() {
  if (typeof window !== "undefined" && window.ethereum) {
    const { logout } = useUserStore.getState();

    const provider = new ethers.BrowserProvider(window.ethereum);
    provider.addListener("disconnect", () => {
      console.log("disconnect");
      logout();
    });
    provider.addListener("accountsChanged", () => {
      console.log("disconnect");
      logout();
    });
    provider.addListener("chainChanged", () => {
      console.log("disconnect");
      logout();
    });
  }
}
