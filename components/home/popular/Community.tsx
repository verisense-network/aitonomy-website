"use client";

import { useMeilisearch } from "@/hooks/useMeilisearch";
import CommunityCard from "@/components/community/components/Card";
import { Spinner } from "@heroui/react";
import { Community } from "@verisense-network/vemodel-types";

export default function PopularCommunity() {
  const { data, isLoading } = useMeilisearch("community", undefined, {
    sort: ["created_time:desc"],
    hitsPerPage: 20,
  });

  return (
    <div className="space-y-2">
      <h1 className="text-lg font-bold py-4">Communities</h1>
      <div className="grid grid-cols-2 gap-2">
        {isLoading && (
          <div>
            <Spinner />
          </div>
        )}
        {data?.hits?.length === 0 && (
          <div className="p-2">
            <h1 className="text-md">No Communities</h1>
          </div>
        )}
        {!isLoading &&
          data?.hits?.map((it) => (
            <CommunityCard key={it.id} community={it as Community} />
          ))}
      </div>
    </div>
  );
}
