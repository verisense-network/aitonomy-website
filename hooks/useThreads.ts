"use client"

import { MeiliSearchArgs, meiliSearchFetcher } from "@/utils/fetcher/meilisearch";
import { useState } from "react";
import useSWR from "swr";

export default function useThreads(initParams: MeiliSearchArgs = {
  search: '',
  page: 1,
  limit: 10
}) {
  const [params, setParams] = useState(initParams)

  const swrResult = useSWR(['thread', params], ([index, args]) => meiliSearchFetcher(index, args))

  return {...swrResult, setParams}
}