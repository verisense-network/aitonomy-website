import { useUserStore } from "@/stores/user";
import { useState, useEffect } from "react";
import { checkPermission } from "@/app/actions";
import { isCommunityMode } from "@/components/community/utils";

export default function useCanPost(community?: any) {
  const { isLogin, address } = useUserStore();
  const [canPost, setCanPost] = useState(true);

  useEffect(() => {
    if (!community) {
      setCanPost(true);
      return;
    }

    const isNeedCheck = community && !isCommunityMode(community.mode, "Public");
    if (!isLogin || !isNeedCheck) {
      setCanPost(true);
      return;
    }

    (async () => {
      try {
        if (!address) return;

        const { data: permission, success } = await checkPermission({
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
