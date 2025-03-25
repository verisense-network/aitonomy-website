import Image from "next/image";
import { twMerge } from "tailwind-merge";

export default function WalletIcon({
  name,
  alt,
  className,
  width,
  height,
}: {
  name: string;
  alt: string;
  className?: string;
  width: number;
  height: number;
}) {
  return (
    <Image
      src={`/wallets/${name}.svg`}
      alt={alt}
      className={twMerge(className)}
      width={width}
      height={height}
    />
  );
}
