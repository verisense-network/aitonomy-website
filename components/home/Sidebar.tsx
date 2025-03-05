import { twMerge } from "tailwind-merge";
import PopularCommunity from "./popular/Community";

export default function Sidebar({ className }: { className?: string }) {
  return (
    <div className={twMerge(className, "w-full px-2")}>
      <PopularCommunity />
    </div>
  );
}
