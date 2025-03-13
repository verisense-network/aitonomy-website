import { getAccountInfo } from "@/app/actions";
import { useUserStore } from "@/stores/user";

export const NAME_NOT_SET = "Name not set";

export async function updateAccountInfo() {
  try {
    const { address, setUserName, setLastPostAt } = useUserStore.getState();

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
    console.log("aliasName", aliasName);
    console.log("setLastPostAt", account.last_post_at);
    setUserName(aliasName);
    setLastPostAt(account.last_post_at);
  } catch (e: any) {
    console.error("updateAccountInfo error", e);
  }
}
