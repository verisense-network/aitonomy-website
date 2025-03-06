import CommunityBrand from "@/components/community/Brand";
import Threads from "@/components/home/Threads";

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ community: string }>;
}) {
  const { community } = await params;
  return (
    <div>
      <div className="max-w-7xl mx-auto py-4">
        <CommunityBrand communityId={community} />
        <Threads communityId={community} isShowPostButton />
      </div>
    </div>
  );
}
