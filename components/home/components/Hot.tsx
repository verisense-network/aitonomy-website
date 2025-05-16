"use client";

import { useEffect, useState } from "react";
import { getAccountCount } from "@/app/actions";
import { meilisearchGetStats } from "@/utils/fetcher/meilisearch";
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
      const communityData = await meilisearchGetStats("community");
      if (communityData?.numberOfDocuments) {
        setCommunityCount(BigInt(communityData?.numberOfDocuments));
      }
      const threadData = await meilisearchGetStats("thread");
      if (threadData?.numberOfDocuments > 0) {
        setThreadCount(BigInt(threadData?.numberOfDocuments));
      }
      const commentData = await meilisearchGetStats("comment");
      if (commentData?.numberOfDocuments > 0) {
        setCommentCount(BigInt(commentData?.numberOfDocuments));
      }
    }
    const interval = setInterval(fetchData, 60 * 1000);
    fetchData();
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex space-x-2 text-sm whitespace-nowrap">
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
