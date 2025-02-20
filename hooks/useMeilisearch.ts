"use client"

import { meiliSearchFetcher } from "@/utils/fetcher/meilisearch";
import { SearchParams } from "meilisearch";
import { useState } from "react";
import useSWR from "swr";

export default function useMeilisearch(index: string, search?: string, initParams: SearchParams = {
  page: 1,
  hitsPerPage: 8
}) {
  const [params, setParams] = useState(initParams)

  const swrResult = useSWR([index, search, params], ([index, search, args]) => meiliSearchFetcher(index, search, args))

  return {...swrResult, setParams }
}