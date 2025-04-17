import { hexToLittleEndian } from "@/utils/tools";
import { MetaData } from "@/config/website";
import { meiliSearchFetcher } from "@/utils/fetcher/meilisearch";
import { Community } from "@verisense-network/vemodel-types";
import PostThread from "@/components/thread/Create";

interface Props {
  searchParams: Promise<{ communityId: string }>;
}

export async function generateMetadata({ searchParams }: Props) {
  const { communityId } = await searchParams;

  const data =
    communityId &&
    (await meiliSearchFetcher("community", undefined, {
      filter: `id = ${hexToLittleEndian(communityId)}`,
    }));

  const community = data && data?.hits[0];

  return {
    title: `Post ${community ? community.name : ""} thread | ${MetaData.title}`,
    description: MetaData.description,
  };
}

export default async function PostThreadPage({ searchParams }: Props) {
  const { communityId } = await searchParams;

  const data = communityId
    ? await meiliSearchFetcher("community", undefined, {
        filter: `id = ${hexToLittleEndian(communityId)}`,
      })
    : undefined;

  const community = data?.hits[0];

  return (
    <div className="w-full mx-auto py-4">
      <PostThread community={community as Community} />
    </div>
  );
}
