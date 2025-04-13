import CommunityBrand from "@/components/community/Brand";
import Threads from "@/components/home/Threads";
import { hexToLittleEndian } from "@/utils/tools";
import { MetaData } from "@/config/website";
import { meiliSearchFetcher } from "@/utils/fetcher/meilisearch";
import { notFound } from "next/navigation";
import { Community } from "@verisense-network/vemodel-types";

interface Props {
  params: Promise<{ community: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { community: communityId } = await params;

  const data = await meiliSearchFetcher("community", undefined, {
    filter: `id = ${hexToLittleEndian(communityId)}`,
  });

  const community = data?.hits[0];

  return {
    title: `${community?.name} | ${MetaData.title}`,
    description: MetaData.description,
  };
}

export default async function CommunityPage({ params }: Props) {
  const { community: communityId } = await params;

  const data = await meiliSearchFetcher("community", undefined, {
    filter: `id = ${hexToLittleEndian(communityId)}`,
  });

  const community = data?.hits[0];

  if (!community) {
    return notFound();
  }

  return (
    <div className="w-full mx-auto py-4">
      <CommunityBrand community={community as Community} />
      <Threads community={community as Community} isShowPostButton />
    </div>
  );
}
