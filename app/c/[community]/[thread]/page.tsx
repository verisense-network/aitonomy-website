import ThreadView from "@/components/thread/Thread";
import { encodeId } from "@/utils/thread";

export default async function ThreadPage({ params }: { params: Promise<{ community: string, thread: string }> }) {
  const { community, thread } = await params;

  const threadId = encodeId({ community, thread })

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto py-4">
        <ThreadView threadId={threadId} />
      </div>
    </div>
  );
}