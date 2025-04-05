"use client";

import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { SearchParams } from "meilisearch";
import { useCallback, useState } from "react";
import { meiliSearchFetcher } from "@/utils/fetcher/meilisearch";

export function useMeilisearch(
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
    await swrResult.mutate(undefined, {
      revalidate: true,
    });
    return swrResult.data;
  }, [swrResult]);

  return { ...swrResult, setParams, forceUpdate };
}

export function useMeilisearchInfinite(
  index: string,
  search?: string,
  initParams: SearchParams = {
    page: 1,
    hitsPerPage: 8,
  }
) {
  const [params, setParams] = useState(initParams);

  const swrResult = useSWRInfinite(
    (pageIndex, _previousPageData) => {
      return [
        index,
        search,
        {
          ...params,
          page: pageIndex + 1,
        },
      ];
    },
    ([index, search, args]) => meiliSearchFetcher(index, search, args)
  );

  const forceUpdate = useCallback(async () => {
    await swrResult.mutate(undefined, {
      revalidate: true,
    });
    return swrResult.data;
  }, [swrResult]);

  const hasMore =
    swrResult.data &&
    (swrResult.data[swrResult.data.length - 1] as any)?.totalPages >
      (swrResult.data[swrResult.data.length - 1] as any)?.page;

  const loadMore = useCallback(() => {
    swrResult.setSize(swrResult.size + 1);
  }, [swrResult]);

  return { ...swrResult, hasMore, setParams, forceUpdate, loadMore };
}
