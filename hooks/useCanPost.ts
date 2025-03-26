import { useUserStore } from "@/stores/user";
import { useState, useEffect } from "react";
import { checkInvite } from "@/app/actions";

export default function useCanPost(community?: any) {
  const { isLogin, address } = useUserStore();
  const [canPost, setCanPost] = useState(true);

  useEffect(() => {
    const hasCommunityAndValid = !!(
      community &&
      (!community.private || !community.id)
    );
    if (!isLogin || !hasCommunityAndValid) {
      setCanPost(true);
      return;
    }

    (async () => {
      try {
        if (!address) return;

        const { data: permission, success } = await checkInvite({
          communityId: community.id,
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
  }, [community, address, isLogin]);

  return canPost;
}
