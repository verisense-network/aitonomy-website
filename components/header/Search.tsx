import { useMeilisearch } from "@/hooks/useMeilisearch";
import { debounce } from "@/utils/tools";
import {
  Autocomplete,
  AutocompleteItem,
  AutocompleteSection,
} from "@heroui/react";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function HeaderSearch() {
  const [search, setSearch] = useState("");

  const { data: threads } = useMeilisearch("thread", search, {
    limit: 10,
  });

  const { data: communities } = useMeilisearch("community", search, {
    limit: 10,
  });

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
        classNames={{
          popoverContent:
            "w-[80vw] max-h-[85vh] overflow-y-auto md:w-full md:max-h-[95vh]",
        }}
      >
        <AutocompleteSection showDivider title="Threads">
          {threads
            ? threads.hits?.map((hit) => (
                <AutocompleteItem
                  as={Link}
                  href={`/c/${hit.formattedId.community}/${hit.formattedId.thread}`}
                  key={hit.id}
                >
                  {hit.title}
                </AutocompleteItem>
              ))
            : null}
        </AutocompleteSection>
        <AutocompleteSection showDivider title="Communities">
          {communities
            ? communities.hits?.map((hit) => (
                <AutocompleteItem
                  as={Link}
                  href={`/c/${hit.formattedId}`}
                  key={hit.id}
                >
                  {hit.name}
                </AutocompleteItem>
              ))
            : null}
        </AutocompleteSection>
      </Autocomplete>
    </div>
  );
}
