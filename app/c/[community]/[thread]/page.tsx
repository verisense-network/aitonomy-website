"use client";

import ThreadComments from "@/components/thread/Comments";
import ThreadView from "@/components/thread/Thread";
import useMeilisearch from "@/hooks/useMeilisearch";
import { Community } from "@/utils/aitonomy/type";
import { encodeId } from "@/utils/thread";
import { hexToLittleEndian } from "@/utils/tools";
import { use } from "react";

interface Props {
  params: { community: string; thread: string };
}

export default function ThreadPage({ params }: Props) {
  const { community: communityId, thread: threadId } = use<Props["params"]>(
    params as any
  );

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
    <div className="bg-white dark:bg-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto py-4 space-y-6">
        <ThreadView threadId={computedThreadId} />
        <ThreadComments
          threadId={computedThreadId}
          community={community as Community}
        />
      </div>
    </div>
  );
}
