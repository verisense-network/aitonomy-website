"use client";

import { useEffect, useState } from "react";
import { getAccountCount } from "@/app/actions";
import { meiliSearchFetcher } from "@/utils/fetcher/meilisearch";
import Counter from "@/components/framer/Counter";

export default function Hot() {
  const [userCount, setUserCount] = useState<bigint>(0n);
  const [communityCount, setCommunityCount] = useState<bigint>(0n);
  const [threadCount, setThreadCount] = useState<bigint>(0n);
  const [commentCount, setCommentCount] = useState<bigint>(0n);

  const engageCount = communityCount + threadCount + commentCount;

  useEffect(() => {
    async function fetchData() {
      const { data: userCountData, success } = await getAccountCount();
      if (success) {
        setUserCount(userCountData as bigint);
      }
      const communityData = await meiliSearchFetcher("community", undefined, {
        limit: 1,
      });
      if (communityData?.estimatedTotalHits > 0) {
        setCommunityCount(BigInt(communityData?.estimatedTotalHits));
      }
      const threadData = await meiliSearchFetcher("thread", undefined, {
        limit: 1,
      });
      if (threadData?.estimatedTotalHits > 0) {
        setThreadCount(BigInt(threadData?.estimatedTotalHits));
      }
      const commentData = await meiliSearchFetcher("comment", undefined, {
        limit: 1,
      });
      if (commentData?.estimatedTotalHits > 0) {
        setCommentCount(BigInt(commentData?.estimatedTotalHits));
      }
    }
    const interval = setInterval(fetchData, 60 * 1000);
    fetchData();
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex space-x-2 text-sm">
      <span>🔥</span>
      <p className="flex items-center space-x-2">
        <label>User Count:</label>
        <Counter value={Number(userCount)} />
      </p>
      <p className="flex items-center space-x-2">
        <label>Engage Count:</label>
        <Counter value={Number(engageCount)} />
      </p>
    </div>
  );
}
