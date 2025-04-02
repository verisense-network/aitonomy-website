import useMeilisearch from "@/hooks/useMeilisearch";
import { decodeId } from "@/utils/thread";
import { debounce, hexToLittleEndian } from "@/utils/tools";
import {
  Autocomplete,
  AutocompleteItem,
  AutocompleteSection,
} from "@heroui/react";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function HeaderSearch() {
  const [search, setSearch] = useState("");

  const { data: threadsData } = useMeilisearch("thread", search, {
    limit: 10,
  });

  const threads = useMemo(() => {
    if (!threadsData?.hits) return [];
    return threadsData?.hits?.map((hit: any) => {
      return {
        ...hit,
        id: decodeId(hit.id),
      };
    });
  }, [threadsData]);

  const { data: communitiesData } = useMeilisearch("community", search, {
    limit: 10,
  });

  const communities = useMemo(() => {
    if (!communitiesData?.hits) return [];
    return communitiesData?.hits?.map((hit: any) => {
      return {
        ...hit,
        id: hexToLittleEndian(hit.id),
      };
    });
  }, [communitiesData]);

  return (
    <div>
      <Autocomplete
        isVirtualized
        startContent={<SearchIcon />}
        itemHeight={40}
        maxListboxHeight={400}
        placeholder="Search..."
        value={search}
        onValueChange={debounce(setSearch, 300)}
        fullWidth
      >
        <AutocompleteSection showDivider title="Threads">
          {threads.map((hit) => (
            <AutocompleteItem
              as={Link}
              href={`/c/${hit.id.community}/${hit.id.thread}`}
              key={hit.id}
            >
              {hit.title}
            </AutocompleteItem>
          ))}
        </AutocompleteSection>
        <AutocompleteSection showDivider title="Communities">
          {communities?.map((hit) => (
            <AutocompleteItem as={Link} href={`/c/${hit.id}`} key={hit.id}>
              {hit.name}
            </AutocompleteItem>
          ))}
        </AutocompleteSection>
      </Autocomplete>
    </div>
  );
}
