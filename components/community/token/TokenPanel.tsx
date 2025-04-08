import TokenModal from "@/components/modal/Token";
import TokenRewardsModal from "@/components/modal/TokenRewards";
import { Avatar, Button, Spinner } from "@heroui/react";
import { useState } from "react";
import { Community } from "@verisense-network/vemodel-types";
import { useReadContract } from "wagmi";
import { useUser } from "@/hooks/useUser";
import { abiBalanceOf } from "@/utils/abis";
import { formatReadableAmount } from "@/utils/format";

export default function TokenPanel({ community }: { community: Community }) {
  const [isOpenTokenModal, setIsOpenTokenModal] = useState(false);
  const [isOpenRewardsModal, setIsOpenRewardsModal] = useState(false);

  const {
    user: { address: userAddress },
  } = useUser();

  const {
    data: userBalance,
    isRefetching,
    refetch: refetchUserBalance,
  } = useReadContract({
    abi: abiBalanceOf,
    address: community?.token_info?.contract as `0x${string}`,
    functionName: "balanceOf",
    args: [userAddress as `0x${string}`],
  });

  if (!community) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-col items-center">
        <Avatar
          src={community?.token_info?.image || ""}
          name={community?.token_info?.symbol}
        />
        <div
          className="flex items-center mt-1 space-x-1 text-md cursor-pointer"
          onClick={() => refetchUserBalance()}
        >
          <span className="text-sm">
            {isRefetching ? (
              <Spinner size="sm" />
            ) : userBalance ? (
              formatReadableAmount(
                userBalance?.toString(),
                community?.token_info?.decimals
              )
            ) : (
              ""
            )}
          </span>
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
