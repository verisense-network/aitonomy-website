"use client";

import useMeilisearch from "@/hooks/useMeilisearch";
import { Avatar, Card, CardBody, Spinner } from "@heroui/react";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { hexToLittleEndian } from "@/utils/tools";

export default function PopularCommunity() {
  const router = useRouter();
  const { data, isLoading } = useMeilisearch("community", undefined, {
    sort: ["created_time:desc"],
    hitsPerPage: 20,
  });

  const toCommunityPage = useCallback(
    (id: string) => {
      const communityId = hexToLittleEndian(id);
      router.push("/c/" + communityId);
    },
    [router]
  );

  return (
    <div className="space-y-2">
      <h1 className="text-lg font-bold py-4">Communities</h1>
      <div className="grid grid-cols-2 gap-2">
        {isLoading && (
          <div>
            <Spinner />
          </div>
        )}
        {!isLoading &&
          data?.hits.map((it: any) => (
            <Card
              key={it.id}
              isPressable
              className="w-full"
              onPress={() => toCommunityPage(it.id)}
            >
              <CardBody className="flex gap-2 justify-center items-center">
                <Avatar name={it.name} />
                <div>{it.name}</div>
              </CardBody>
            </Card>
          ))}
      </div>
    </div>
  );
}
