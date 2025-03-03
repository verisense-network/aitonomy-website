"use client";

import useSWR from "swr";
import { SearchParams } from "meilisearch";
import { useCallback, useState } from "react";
import { meiliSearchFetcher } from "@/utils/fetcher/meilisearch";

export default function useMeilisearch(
  index: string,
  search?: string,
  initParams: SearchParams = {
    page: 1,
    hitsPerPage: 8,
  }
) {
  const [params, setParams] = useState(initParams);

  const swrResult = useSWR([index, search, params], ([index, search, args]) =>
    meiliSearchFetcher(index, search, args)
  );

  const forceUpdate = useCallback(async () => {
    return await swrResult.mutate(undefined, {
      revalidate: true,
    });
  }, [swrResult]);

  return { ...swrResult, setParams, forceUpdate };
}
