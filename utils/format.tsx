import { Tooltip } from "@heroui/react";
import { formatAddress } from "./tools";
import { isEqualAddress, isYouAddress } from "@/components/thread/utils";
import { ethers } from "ethers";
import { CHAIN } from "./chain";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { twMerge } from "tailwind-merge";

interface AddressViewFormatProps {
  address: string;
  bracket?: boolean;
  className?: string;
}

export function AddressViewFormat({
  address,
  bracket = true,
  className,
}: AddressViewFormatProps) {
  return (
    <Tooltip content={address}>
      <span className={twMerge("text-gray-500 text-xs font-light", className)}>
        {bracket ? `(${formatAddress(address)})` : formatAddress(address)}
      </span>
    </Tooltip>
  );
}

interface NamedAddressViewProps {
  address: string;
  name?: string;
  classNames?: {
    name?: string;
    address?: string;
  };
}

export function NamedAddressView({
  address,
  name,
  classNames,
}: NamedAddressViewProps) {
  return (
    <div className="space-x-2">
      <span className={twMerge("font-semibold text-md", classNames?.name)}>
        {(name && (name.startsWith("0x") ? name.slice(0, 4) : name)) || ""}
      </span>
      <AddressViewFormat className={classNames?.address} address={address} />
    </div>
  );
}

interface UserAddressViewProps {
  agentPubkey: string;
  address: string;
  name?: string;
  classNames?: {
    name?: string;
    address?: string;
  };
}

export function UserAddressView({
  agentPubkey,
  address,
  name,
  classNames,
}: UserAddressViewProps) {
  return isEqualAddress(agentPubkey, address) ? (
    <NamedAddressView classNames={classNames} address={address} name="Agent" />
  ) : isYouAddress(address) ? (
    <NamedAddressView classNames={classNames} address={address} name="You" />
  ) : (
    <NamedAddressView classNames={classNames} address={address} name={name} />
  );
}

export const VIEW_UNIT = CHAIN === "SOL" ? "SOL" : CHAIN === "BSC" ? "BNB" : "";

export function formatReadableAmount(amount: string): string {
  if (!amount || Number.isNaN(Number(amount))) return "";

  if (CHAIN === "SOL") {
    return (Number(amount) / LAMPORTS_PER_SOL).toString();
  } else {
    return ethers.formatEther(amount);
  }
}

export function formatAmount(amount: string | number): bigint {
  if (!amount || Number.isNaN(Number(amount))) return 0n;

  if (CHAIN === "SOL") {
    return BigInt(amount) * BigInt(LAMPORTS_PER_SOL);
  } else {
    return ethers.parseEther(amount.toString());
  }
}
