import { getAccountInfo } from "@/app/actions";
import { useUserStore } from "@/stores/user";
import { getWalletConnect } from "./wallet";
import { toast } from "react-toastify";

export const NAME_NOT_SET = "Name not set";

export async function updateAccountInfo() {
  try {
    const walletId = useUserStore.getState().wallet;

    const wallet = getWalletConnect(walletId);
    await wallet.checkConnected();

    const currentAddress = wallet.address;
    const publicKey = wallet.publicKey;

    const { setUser, setLastPostAt, logout } = useUserStore.getState();

    if (!currentAddress || !publicKey) {
      return;
    }

    // sol address check
    if (!currentAddress.startsWith("0x")) {
      logout();
      toast.info("Please login");
    }

    const {
      success,
      data: account,
      message: errorMessage,
    } = await getAccountInfo({
      accountId: currentAddress,
    });

    if (!success || !account) {
      throw new Error(errorMessage);
    }
    const aliasName = account.alias || currentAddress.slice(0, 4);
    setUser({
      name: aliasName,
      publicKey: publicKey,
      address: currentAddress,
    });
    setLastPostAt(account.last_post_at);
    console.log("call addListeners");
    wallet.addListeners();
  } catch (e: any) {
    console.error("updateAccountInfo error", e);
  }
}
