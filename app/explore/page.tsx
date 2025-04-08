"use client";

import CommunityCard from "@/components/community/components/Card";
import { useMeilisearch } from "@/hooks/useMeilisearch";
import { Spinner } from "@heroui/react";
import { Community } from "@verisense-network/vemodel-types";

export default function ExplorePage() {
  const { data, isLoading } = useMeilisearch("community", undefined, {
    sort: ["created_time:desc"],
  });

  return (
    <div className="max-w-7xl min-w-72 mx-auto py-4">
      <h1 className="text-lg font-bold py-4">Explore Communities</h1>
      <div className="w-full grid grid-cols-3 gap-2 md:grid-cols-6">
        {isLoading && <Spinner />}
        {data?.hits?.map((community) => (
          <CommunityCard
            key={community.id}
            community={community as Community}
          />
        ))}
      </div>
    </div>
  );
}
