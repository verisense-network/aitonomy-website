import { getAccountInfo } from "@/app/actions";
import { useUserStore } from "@/stores/user";
import { getWalletConnect } from "./wallet";
import { toast } from "react-toastify";

export const NAME_NOT_SET = "Name not set";

export async function updateAccountInfo() {
  try {
    const {
      wallet: walletId,
      address,
      setUserName,
      setLastPostAt,
      logout,
    } = useUserStore.getState();

    if (!address) {
      return;
    }

    // sol address check
    if (!address.startsWith("0x")) {
      logout();
      toast.info("Please login");
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
