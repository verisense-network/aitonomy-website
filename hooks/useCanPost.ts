import { useUserStore } from "@/stores/user";
import { useState, useEffect } from "react";
import { checkInvite } from "@/app/actions";

export default function useCanPost(communityId?: string) {
  const { isLogin, address } = useUserStore();
  const [canPost, setCanPost] = useState(true);

  useEffect(() => {
    if (!isLogin || !communityId) {
      setCanPost(true);
      return;
    }
    (async () => {
      try {
        if (!address) return;

        const { data: permission, success } = await checkInvite({
          communityId,
          accountId: address,
        });

        if (!success) {
          setCanPost(false);
          return;
        }

        setCanPost(!!permission);
      } catch (e: any) {
        console.error("checkCanPost error", e);
        setCanPost(false);
      }
    })();
  }, [communityId, address, isLogin]);

  return canPost;
}
