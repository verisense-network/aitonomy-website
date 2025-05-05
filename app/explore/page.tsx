"use client";

import CommunityCard from "@/components/community/components/Card";
import { useMeilisearchInfinite } from "@/hooks/useMeilisearch";
import { Button, Spinner } from "@heroui/react";
import { Community } from "@verisense-network/vemodel-types";
import { useMemo } from "react";

export default function ExplorePage() {
  const { data,  isLoading, isValidating, hasMore, loadMore } = useMeilisearchInfinite("community", undefined, {
    sort: ["created_time:desc"],
    hitsPerPage: 18,
  });

  const communities = useMemo(() => {
    if (!data) return [];

    const all = data.flatMap((page) => page.hits);
    return all;
  }, [data]);

  return (
    <div className="max-w-7xl min-w-72 mx-auto py-4">
      <h1 className="text-lg font-bold py-4">Explore Communities</h1>
      <div className="w-full grid grid-cols-3 gap-2 md:grid-cols-6">
        {isLoading && <Spinner />}
        {!isLoading && communities?.length === 0 && (
          <div className="p-2">
            <h1 className="text-xl">No communities found</h1>
          </div>
        )}
        {communities?.map((community) => (
          <CommunityCard
            key={community.id}
            community={community as Community}
          />
        ))}
      </div>
      <div className="flex justify-center mt-4">
          {hasMore && (
            <Button
              onPress={() => loadMore()}
              color="primary"
              isLoading={isLoading || isValidating}
            >
              Load More
            </Button>
          )}
        </div>
    </div>
  );
}
