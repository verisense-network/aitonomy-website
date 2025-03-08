"use client";

import SideMenu from "@/components/sideMenu";
import useMeilisearch from "@/hooks/useMeilisearch";
import { hexToLittleEndian } from "@/utils/tools";
import { Card, CardBody, Avatar, Spinner } from "@heroui/react";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

export default function ExplorePage() {
  const { data, isLoading } = useMeilisearch("community", undefined, {
    sort: ["created_time:desc"],
    limit: 5,
  });

  const router = useRouter();

  const toCommunityPage = useCallback(
    (id: string) => {
      const communityId = hexToLittleEndian(id);
      router.push("/c/" + communityId);
    },
    [router]
  );

  return (
    <div>
      <div className="flex">
        <SideMenu />
        <div className="max-w-7xl min-w-72 mx-auto py-4">
          <h1 className="text-lg font-bold py-4">Explore Communities</h1>
          <div className="grid grid-cols-6 gap-2">
            {isLoading && <Spinner />}
            {data?.hits?.map((community) => (
              <Card
                key={community.id}
                isPressable
                className="w-full"
                onPress={() => toCommunityPage(community.id)}
              >
                <CardBody className="flex gap-2 justify-center items-center">
                  <Avatar name={community.name} src={community.logo} />
                  <div>{community.name}</div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
