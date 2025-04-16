import { useUserStore } from "@/stores/user";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { updateAccountInfo } from "@/utils/user";
import { useAccount, useDisconnect } from "wagmi";
import { bsc } from "wagmi/chains";

export const useUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const user = useUserStore();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { connector, chainId, address, isConnected, status } = useAccount();

  const { address: storedAddress, logout, setUser } = user;

  useEffect(() => {
    const isBscChain = chainId === bsc.id;
    const isChangedAddress =
      storedAddress.toLowerCase() !== address?.toLowerCase();
    if (status === "connecting" || status === "reconnecting") return;
    if (isConnected && address && isBscChain && isChangedAddress) {
      setUser({ address });

      (async () => {
        try {
          if (!address) return;
          setIsLoading(true);
          await updateAccountInfo(address);
          setIsLoading(false);
        } catch (e) {
          console.error(e);
          toast.error("Failed to get user profile");
          setIsLoading(false);
        }
      })();
    }
  }, [chainId, address, isConnected, setUser, storedAddress, status]);

  const disconnect = useCallback(() => {
    wagmiDisconnect(
      { connector },
      {
        onError: (error) => {
          console.error(error);
          toast.error("Failed to disconnect");
        },
        onSuccess: () => {
          logout();
        },
      }
    );
  }, [connector, wagmiDisconnect, logout]);

  useEffect(() => {
    if (status === "disconnected") {
      logout();
    }
  }, [logout, status]);

  const isYouAddress = useCallback(
    (diffAddress: string) => {
      return diffAddress?.toLowerCase() === storedAddress.toLowerCase();
    },
    [storedAddress]
  );

  return {
    user: { ...user },
    isLoading,
    disconnect,
    isYouAddress,
  };
};
