const api_url = process.env.NEXT_PUBLIC_MEILISEARCH_URL

import { MeiliSearch } from 'meilisearch'

const client = new MeiliSearch({
  host: api_url!,
});

export type MeiliSearchArgs = {
  search: string
  page?: number
  limit?: number
}

export async function meiliSearchFetcher(index: string, args: MeiliSearchArgs) {
  const res = await client.index(index).searchGet(args.search, {
    page: args.page,
    limit: args.limit
  })

  return res
}