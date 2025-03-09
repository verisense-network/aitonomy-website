"use client";

import { use } from "react";
import ThreadComments from "@/components/thread/Comments";
import ThreadView from "@/components/thread/Thread";
import useMeilisearch from "@/hooks/useMeilisearch";
import { Community } from "@/utils/aitonomy/type";
import { encodeId } from "@/utils/thread";
import { hexToLittleEndian } from "@/utils/tools";

interface Props {
  params: Promise<{ community: string; thread: string }>;
}

export default function ThreadPage({ params }: Props): React.ReactNode {
  const { community: communityId, thread: threadId } = use(params);

  const { data } = useMeilisearch("community", "", {
    filter: `id = ${hexToLittleEndian(communityId)}`,
    limit: 1,
  });

  const community = data?.hits[0];

  const computedThreadId = encodeId({
    community: communityId,
    thread: threadId,
  });

  return (
    <div className="w-full mx-auto py-4 space-y-6">
      <ThreadView threadId={computedThreadId} />
      <ThreadComments
        threadId={computedThreadId}
        community={community as Community}
      />
    </div>
  );
}
