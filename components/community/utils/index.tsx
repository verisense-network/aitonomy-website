import { cn, Radio, RadioProps } from "@heroui/react";
import { CommunityMode } from "@verisense-network/vemodel-types";
import {
  EarthIcon,
  DollarSignIcon,
  EarthLockIcon,
  CircleDollarSignIcon,
} from "lucide-react";

export enum CommunityStatus {
  PendingCreation = "PendingCreation",
  WaitingTx = "WaitingTx",
  CreateFailed = "CreateFailed",
  Active = "Active",
  TokenIssued = "TokenIssued",
  Frozen = "Frozen",
}

export const InviteMinAmount = 0.02;

export const TokenSupply = [10, 9, 8];

export const CommunityModes = [
  {
    value: "Public",
    label: (
      <div className="flex items-center gap-2 text-nowrap">
        Public <EarthIcon className="w-5 h-5" />
      </div>
    ),
    description: "Anyone can join",
  },
  {
    value: "InviteOnly",
    label: (
      <div className="flex items-center gap-2 text-nowrap">
        Invite Only <EarthLockIcon className="w-5 h-5 text-primary" />
      </div>
    ),
    description: "Only invited users can join",
  },
  {
    value: "PayToJoin",
    label: (
      <div className="flex items-center gap-2 text-nowrap">
        Pay To Join <CircleDollarSignIcon className="w-5 h-5" />
      </div>
    ),
    description: "Users must pay to join",
  },
];

export function CustomCommunityModeRadio({
  children,
  ...otherProps
}: RadioProps) {
  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn(
          "inline-flex m-0 bg-content2 hover:bg-content1 items-center justify-between",
          "flex-row-reverse max-w-none cursor-pointer rounded-lg gap-4 p-2 border-2 border-transparent",
          "data-[selected=true]:border-primary data-[selected=true]:bg-content1"
        ),
      }}
    >
      {children}
    </Radio>
  );
}

export function getCommunityMode(mode: CommunityMode) {
  if (!mode) return null;
  return typeof mode === "string" ? mode : Object.keys(mode)[0];
}

export const isCommunityMode = (
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
    return <EarthLockIcon className="w-5 h-5 text-primary" />;
  } else if (isCommunityMode(mode, "PayToJoin")) {
    return <DollarSignIcon className="w-5 h-5" />;
  }
  return null;
}
