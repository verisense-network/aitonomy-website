import { twMerge } from "tailwind-merge";
import PopularCommunity from "./components/Community";
import Hot from "./components/Hot";

export default function Sidebar({ className }: { className?: string }) {
  return (
    <div className={twMerge(className, "w-full px-2")}>
      <Hot />
      <PopularCommunity />
    </div>
  );
}
