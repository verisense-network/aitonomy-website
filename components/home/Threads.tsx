"use client";

import useThreads from "@/hooks/useThreads";
import { Card, CardFooter, CardHeader, Listbox, ListboxItem } from "@heroui/react";
import { useRouter } from "next/navigation";
import { Key, useCallback } from "react";
import { parseId } from "@/utils/thread";

export const ListboxWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100">
    {children}
  </div>
);

export default function Threads() {
  const { data, setParams } = useThreads();
  const router = useRouter()

  const toThreadPage = useCallback((key: Key) => {
    const thread = data?.hits.find((hit: any) => hit.id === key)
    if (!thread) {
      return
    }
    const { community: communityId, thread: threadNumber } = parseId(thread.id)
    router.push('/c/' + communityId + '/' + threadNumber)
  }, [data?.hits, router])

  return <div className="max-w-7xl mx-auto">
    <ListboxWrapper>
      <Listbox aria-label="Actions" onAction={(key) => toThreadPage(key)}>
        {data?.hits?.map((hit: any) => (
          <ListboxItem key={hit.id} textValue={hit.title}>
            <Card>
              <CardHeader>
                <h1 className="text-xl font-bold">{hit.title}</h1>
              </CardHeader>
              <CardFooter className="text-sm text-gray-500 justify-between">
                <div>
                  {hit.author}
                </div>
                <div>
                  {hit.created_time}
                </div>
              </CardFooter>
            </Card>
          </ListboxItem>
        )) || null}
      </Listbox>
    </ListboxWrapper>
  </div>;
}