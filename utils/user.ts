import { getAccountInfo } from "@/app/actions";
import { useUserStore } from "@/stores/user";

export const NAME_NOT_SET = "Name not set";

export async function updateAccountInfo() {
  try {
    const { address, setUserName, setLastPostAt } = useUserStore.getState();

    const account = await getAccountInfo({
      accountId: address,
    });
    const aliasName = account?.alias || NAME_NOT_SET;
    console.log("aliasName", aliasName);
    console.log("setLastPostAt", account.last_post_at);
    setUserName(aliasName);
    setLastPostAt(account.last_post_at);
  } catch (e) {
    console.error(e);
  }
}
