import Threads from "@/components/home/Threads";

export default async function CommunityPage({ params }: { params: Promise<{ community: string }> }) {
  const { community } = await params;
  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white">
      <div className="flex max-w-7xl mx-auto py-4 space-x-4">
        <Threads communityId={community} />
      </div>
    </div>
  );
}