import { CommunityMode } from "@verisense-network/vemodel-types";
import {
  EarthIcon,
  ShieldCheckIcon,
  CircleDollarSignIcon,
  DollarSignIcon,
} from "lucide-react";

export enum CommunityStatus {
  PendingCreation = "PendingCreation",
  WaitingTx = "WaitingTx",
  CreateFailed = "CreateFailed",
  Active = "Active",
  TokenIssued = "TokenIssued",
  Frozen = "Frozen",
}

export function getCommunityMode(mode: CommunityMode) {
  if (!mode) return null;
  return typeof mode === "string" ? mode : Object.keys(mode)[0];
}

const isCommunityMode = (
  communityMode: CommunityMode,
  mode: keyof CommunityMode
) => {
  return getCommunityMode(communityMode) === mode;
};

export function getCommunityModeIcon(mode: CommunityMode) {
  if (!mode) return null;
  if (isCommunityMode(mode, "Public")) {
    return <EarthIcon className="w-5 h-5" />;
  } else if (isCommunityMode(mode, "InviteOnly")) {
    return <ShieldCheckIcon className="w-5 h-5" />;
  } else if (isCommunityMode(mode, "PayToJoin")) {
    return <DollarSignIcon className="w-5 h-5" />;
  }
  return null;
}
