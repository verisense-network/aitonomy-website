import TokenModal from "@/components/modal/Token";
import TokenRewardsModal from "@/components/modal/TokenRewards";
import { Avatar, Button } from "@heroui/react";
import { useState } from "react";

export default function TokenPanel({ community }: { community: any }) {
  const [isOpenTokenModal, setIsOpenTokenModal] = useState(false);
  const [isOpenRewardsModal, setIsOpenRewardsModal] = useState(false);

  if (!community) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-col items-center">
        <Avatar
          src={community?.token_info?.image}
          name={community?.token_info?.symbol}
        />
        <div className="flex items-center mt-1 space-x-1 text-md">
          <span className="text-sm">{community?.token_info?.symbol}</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onPress={() => setIsOpenTokenModal(true)}
        >
          More
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => setIsOpenRewardsModal(true)}
        >
          Rewards
        </Button>
      </div>
      <TokenModal
        isOpen={isOpenTokenModal}
        onClose={() => setIsOpenTokenModal(false)}
        community={community}
      />
      <TokenRewardsModal
        isOpen={isOpenRewardsModal}
        onClose={() => setIsOpenRewardsModal(false)}
        community={community}
      />
    </div>
  );
}
