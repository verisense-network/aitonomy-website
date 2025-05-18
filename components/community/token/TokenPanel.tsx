import TokenModal from "@/components/modal/Token";
import TokenRewardsModal from "@/components/modal/TokenRewards";
import { Avatar, Button, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import { Community } from "@verisense-network/vemodel-types";
import { useReadContract } from "wagmi";
import { useUser } from "@/hooks/useUser";
import { abiBalanceOf } from "@/utils/abis";
import { formatReadableAmount } from "@/utils/format";
import { getTokenPriceByOkxDex } from "@/app/actions";
import useSWR from "swr";

export default function TokenPanel({ community }: { community: Community }) {
  const [isOpenTokenModal, setIsOpenTokenModal] = useState(false);
  const [isOpenRewardsModal, setIsOpenRewardsModal] = useState(false);
  const [tokenPrice, setTokenPrice] = useState("");

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

  const fetcher = async (url: string, contractAddress: string) => {
    const data = await getTokenPriceByOkxDex(contractAddress);
    return data;
  };

  const { data: priceData } = useSWR(
    community?.token_info?.contract
      ? ["/api/token-price", community.token_info.contract]
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      onError: (error) => {
        console.error("getTokenPrice error", error);
      },
    }
  );

  useEffect(() => {
    if (priceData?.success && priceData.data.price) {
      setTokenPrice(Number(priceData.data.price).toFixed(5));
    }
  }, [priceData]);

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
          {isRefetching ? (
            <Spinner size="sm" />
          ) : (
            <>
              {tokenPrice && (
                <>
                  <span className="text-sm text-zinc-300">{tokenPrice}</span>
                  <span className="text-sm text-zinc-500">/</span>
                </>
              )}
              <span className="text-sm">
                {userBalance
                  ? formatReadableAmount(
                      userBalance?.toString(),
                      community?.token_info?.decimals
                    )
                  : ""}
              </span>
            </>
          )}
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
        tokenPrice={tokenPrice}
      />
      <TokenRewardsModal
        isOpen={isOpenRewardsModal}
        onClose={() => setIsOpenRewardsModal(false)}
        community={community}
      />
    </div>
  );
}
