import { getAccountInfo } from "@/app/actions";
import { useUserStore } from "@/stores/user";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import { formatAddress } from "./tools";

export const NAME_NOT_SET = "Name not set";

export async function updateAccountInfo(address: string) {
  try {
    const chain = useUserStore.getState().chain;

    let publicKey: Uint8Array = new Uint8Array();
    if (chain === "evm") {
      publicKey = ethers.toBeArray(address);
    }

    const { setUser, logout } = useUserStore.getState();

    if (!address || !publicKey) {
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

    setUser({
      alias: account.alias || formatAddress(address),
      address: address,
      publicKey: publicKey,
      lastPostAt: account.last_post_at,
    });
  } catch (e: any) {
    console.error("updateAccountInfo error", e);
    if (e?.message.includes("fetch failed")) {
      toast.error("Failed to connect server, fetch account error");
    } else {
      toast.error(`updateAccountInfo failed: ${e}`);
    }
  }
}

export async function updateLastPostAt() {
  try {
    const { setUser, address } = useUserStore.getState();
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
    setUser({
      lastPostAt: account.last_post_at,
    });
  } catch (e: any) {
    console.error("updateLastPostAt error", e);
    toast.error(`updateLastPostAt failed: ${e}`);
  }
}
