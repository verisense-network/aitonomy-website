import PopularCommunity from "./popular/Community";

export default function Sidebar({ className }: { className?: string }) {
  return (
    <div className={className}>
      <PopularCommunity />
    </div>
  );
}