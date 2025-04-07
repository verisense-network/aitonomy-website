import { Alert, Button } from "@heroui/react";
import { getCommunityMode } from "../community/utils";
import Link from "next/link";
import { hexToLittleEndian } from "@/utils/tools";

export default function LockNotAllowedToPost({
  community,
}: {
  community: any;
}) {
  const communityMode = getCommunityMode(community?.mode);

  return (
    <div className="absolute bg-zinc-900/80 backdrop-blur-sm top-0 left-0 w-full h-full z-30">
      <div className="flex flex-col h-full justify-center items-center">
        <div className="max-w-xl mx-auto">
          <Alert
            variant="faded"
            color="warning"
            title={
              communityMode &&
              {
                InviteOnly: (
                  <>
                    This is an invite-only community. <br />
                    Please{" "}
                    <Link
                      className="text-primary"
                      href={`/c/${hexToLittleEndian(community?.id)}`}
                    >
                      contact the creator
                    </Link>{" "}
                    to get an invitation code before joining.
                  </>
                ),
                PayToJoin: (
                  <>
                    This is a pay-to-join community as required by the creator.
                    <br />
                    Please pay the membership fee{" "}
                    <Link
                      className="text-primary"
                      href={`/c/${hexToLittleEndian(community?.id)}`}
                    >
                      to join
                    </Link>
                    .
                  </>
                ),
              }[communityMode]
            }
          />
        </div>
      </div>
    </div>
  );
}
