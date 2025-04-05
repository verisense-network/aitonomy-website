"use client";

import { useMeilisearch } from "@/hooks/useMeilisearch";
import { hexToLittleEndian } from "@/utils/tools";
import { Card, CardBody, Avatar, Spinner } from "@heroui/react";
import Link from "next/link";

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
          <Card
            as={Link}
            key={community.id}
            isPressable
            className="min-w-20 md:min-w-30"
            href={`/c/${hexToLittleEndian(community.id)}`}
          >
            <CardBody className="flex gap-2 justify-center items-center">
              <Avatar name={community.name} src={community.logo} />
              <div>{community.name}</div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
