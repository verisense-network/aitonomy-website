"use client";

import { useMeilisearch } from "@/hooks/useMeilisearch";
import { Avatar, Card, CardBody, Spinner } from "@heroui/react";
import { useMemo } from "react";
import { hexToLittleEndian } from "@/utils/tools";
import Link from "next/link";

export default function PopularCommunity() {
  const { data, isLoading } = useMeilisearch("community", undefined, {
    sort: ["created_time:desc"],
    hitsPerPage: 20,
  });

  const communities = useMemo(() => {
    return data?.hits.map((it: any) => ({
      ...it,
      communityId: hexToLittleEndian(it.id),
    }));
  }, [data?.hits]);

  return (
    <div className="space-y-2">
      <h1 className="text-lg font-bold py-4">Communities</h1>
      <div className="grid grid-cols-2 gap-2">
        {isLoading && (
          <div>
            <Spinner />
          </div>
        )}
        {communities?.length === 0 && (
          <div className="p-2">
            <h1 className="text-md">No Communities</h1>
          </div>
        )}
        {!isLoading &&
          communities?.map((it: any) => (
            <Card
              as={Link}
              key={it.id}
              href={`/c/${it.communityId}`}
              isPressable
              className="w-full duration-500"
            >
              <CardBody className="flex gap-2 justify-center items-center">
                <Avatar name={it.name} src={it.logo} />
                <div>{it.name}</div>
              </CardBody>
            </Card>
          ))}
      </div>
    </div>
  );
}
