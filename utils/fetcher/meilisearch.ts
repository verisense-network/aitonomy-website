const api_url = process.env.NEXT_PUBLIC_MEILISEARCH_URL;

import { MeiliSearch, SearchParams } from "meilisearch";
import { decodeId } from "../thread";
import { hexToLittleEndian, sleep } from "../tools";

const client = new MeiliSearch({
  host: api_url!,
});

export async function meiliSearchFetcher(
  index: string,
  search?: string,
  args?: SearchParams
) {
  const res = await client.index(index).searchGet(search, args);

  /**
   * parse response format
   */
  res.hits = res.hits.map((hit) => {
    return {
      ...hit,
      ...(index === "community"
        ? {
            formattedId: hexToLittleEndian(hit.id),
          }
        : {}),
      ...(["thread", "comment"].includes(index)
        ? {
            formattedId: decodeId(hit.id),
          }
        : {}),
    };
  });

  return res;
}

export async function checkIndexed(fetcher: () => Promise<any>, count = 20) {
  for (let i = 0; i < count; i++) {
    const data = await fetcher();
    if (data?.hits?.length > 0) {
      return true;
    }
    await sleep(1500);
  }
  return false;
}

export async function meilisearchGetStats(index: string) {
  const res = await client.index(index).getStats();
  return res;
}