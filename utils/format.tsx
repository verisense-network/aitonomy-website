import { Tooltip } from "@heroui/react";
import { formatAddress } from "./tools";
import { isAgentAddress, isYouAddress } from "@/components/thread/utils";
import { ethers } from "ethers";
import { CHAIN } from "./chain";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface AddressViewFormatProps {
  address: string;
  bracket?: boolean;
}

export function AddressViewFormat({
  address,
  bracket = true,
}: AddressViewFormatProps) {
  return (
    <Tooltip content={address}>
      <span className="text-gray-500 text-xs font-light">
        {bracket ? `(${formatAddress(address)})` : formatAddress(address)}
      </span>
    </Tooltip>
  );
}

interface NamedAddressViewProps {
  address: string;
  name?: string;
}

export function NamedAddressView({ address, name }: NamedAddressViewProps) {
  return (
    <div className="space-x-2">
      <span className="font-semibold text-md">
        {(name && (name.startsWith("0x") ? name.slice(0, 4) : name)) || ""}
      </span>
      <AddressViewFormat address={address} />
    </div>
  );
}

interface UserAddressViewProps {
  agentPubkey: string;
  address: string;
  name?: string;
}

export function UserAddressView({
  agentPubkey,
  address,
  name,
}: UserAddressViewProps) {
  return isAgentAddress(agentPubkey, address) ? (
    <NamedAddressView address={address} name="Agent" />
  ) : isYouAddress(address) ? (
    <NamedAddressView address={address} name="You" />
  ) : (
    <NamedAddressView address={address} name={name} />
  );
}

export const VIEW_UNIT = CHAIN === "SOL" ? "SOL" : CHAIN === "BSC" ? "BNB" : "";

export function formatReadableAmount(amount: string): string {
  if (CHAIN === "SOL") {
    return (Number(amount) / LAMPORTS_PER_SOL).toString();
  } else {
    return ethers.formatEther(amount);
  }
}
