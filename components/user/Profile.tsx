import { getAccountInfo } from "@/app/actions";
import { formatAddress } from "@/utils/tools";
import { Button, Card, CardBody, Spinner, Tooltip } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import UpdateAliasName from "./UpdateAliasName";
import { toast } from "react-toastify";
import { NAME_NOT_SET, updateAccountInfo } from "@/utils/user";
import Rewards from "./Rewards";
import { useUser } from "@/hooks/useUser";

interface Props {
  address: string;
}

export default function UserProfile({ address }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isShowUpdateName, setIsShowUpdateName] = useState(false);
  const [userName, setUserName] = useState("");
  const { isYouAddress } = useUser();

  const getUserProfile = useCallback(async () => {
    try {
      if (!address) return;
      setIsLoading(true);
      const {
        success,
        data,
        message: errorMessage,
      } = await getAccountInfo({ accountId: address });
      if (!success || !data) {
        throw new Error(errorMessage);
      }
      setUserName(data.alias || NAME_NOT_SET);
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to get user profile: ${e}`);
      setIsLoading(false);
    }
  }, [address]);

  const updateAccountName = useCallback(async () => {
    setIsShowUpdateName(true);
  }, []);

  const updateAliasNameOnSuccess = useCallback(() => {
    setIsShowUpdateName(false);
    getUserProfile();
    updateAccountInfo(address);
  }, [getUserProfile, address]);

  useEffect(() => {
    if (!address) return;
    getUserProfile();
  }, [address, getUserProfile]);

  return (
    <div className="flex flex-col space-y-2 px-2">
      <h1 className="py-4 text-lg font-bold">Profile</h1>
      <Card>
        <CardBody>
          <div className="space-y-5">
            <div className="flex space-x-2 items-center">
              <label className="font-bold">Name:</label>
              {isLoading && <Spinner />}
              {isShowUpdateName ? (
                <UpdateAliasName
                  defaultName={userName !== NAME_NOT_SET ? userName : ""}
                  onSuccess={updateAliasNameOnSuccess}
                  onClose={() => setIsShowUpdateName(false)}
                />
              ) : (
                <>
                  <span
                    className={userName !== NAME_NOT_SET ? "" : "text-gray-500"}
                  >
                    {userName || NAME_NOT_SET}
                  </span>
                  {isYouAddress(address) && (
                    <Button onPress={updateAccountName} size="sm">
                      Update Name
                    </Button>
                  )}
                </>
              )}
            </div>
            <div className="flex space-x-2">
              <label className="font-bold">Address:</label>
              <Tooltip content={address}>
                <span>{formatAddress(address)}</span>
              </Tooltip>
            </div>
            {/* {isYouAddress(address) && <Rewards />} */}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
