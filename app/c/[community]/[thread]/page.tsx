import ThreadComments from "@/components/thread/Comments";
import ThreadView from "@/components/thread/Thread";
import { Community } from "@verisense-network/vemodel-types";
import { encodeId } from "@/utils/thread";
import { hexToLittleEndian } from "@/utils/tools";
import { meiliSearchFetcher } from "@/utils/fetcher/meilisearch";
import { MetaData } from "@/config/website";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ community: string; thread: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { community: communityId, thread: threadId } = await params;

  const computedThreadId = encodeId({
    community: communityId,
    thread: threadId,
  });

  const data = await meiliSearchFetcher("thread", undefined, {
    filter: `id = ${computedThreadId}`,
  });

  const thread = data?.hits[0];

  return {
    title: `${thread?.title} | ${MetaData.title}`,
    description: MetaData.description,
  };
}

export default async function ThreadPage({ params }: Props) {
  const { community: communityId, thread: threadId } = await params;

  const communityData = await meiliSearchFetcher("community", undefined, {
    filter: `id = ${hexToLittleEndian(communityId)}`,
    limit: 1,
  });
  const community = communityData?.hits[0];

  const computedThreadId = encodeId({
    community: communityId,
    thread: threadId,
  });

  if (!community) {
    return notFound();
  }

  const threadData = await meiliSearchFetcher("thread", undefined, {
    filter: `id = ${computedThreadId}`,
  });
  const thread = threadData?.hits[0];

  if (!thread) {
    return notFound();
  }

  return (
    <div className="w-full mx-auto py-4 space-y-6">
      <ThreadView thread={thread} community={community as Community} />
      <ThreadComments thread={thread} community={community as Community} />
    </div>
  );
}
