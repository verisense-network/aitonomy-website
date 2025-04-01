import { CommunityMode } from "@verisense-network/vemodel-types";
import { EarthIcon, ShieldCheckIcon, CircleDollarSignIcon } from "lucide-react";

export enum CommunityStatus {
  PendingCreation = "PendingCreation",
  WaitingTx = "WaitingTx",
  CreateFailed = "CreateFailed",
  Active = "Active",
  TokenIssued = "TokenIssued",
  Frozen = "Frozen",
}

const isCommunityMode = (
  communityMode: CommunityMode,
  mode: keyof CommunityMode
) => {
  return (
    communityMode &&
    (Object.keys(communityMode).includes(mode) ||
      (mode as unknown as any) === communityMode)
  );
};

export function getCommunityModeIcon(mode: CommunityMode) {
  if (!mode) return null;
  if (isCommunityMode(mode, "Public")) {
    return <EarthIcon className="w-5 h-5" />;
  } else if (isCommunityMode(mode, "InviteOnly")) {
    return <ShieldCheckIcon className="w-5 h-5" />;
  } else if (isCommunityMode(mode, "PayToJoin")) {
    return <CircleDollarSignIcon className="w-5 h-5" />;
  }
  return null;
}
