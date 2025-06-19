import SearchHighlight from "@/components/search/SearchHigilight";
import { CommandItem } from "@/components/ui/command";

import { useSearchStore } from "@/store/useSearchStore";
import { SearchResult } from "@/types/search";

export default function SearchResultItem({ id, title, blogName }: SearchResult) {
  const { searchParam } = useSearchStore();
  return (
    <CommandItem className="flex flex-col items-start">
      <a href={`${id}`} className="hover:underline">
        <p className=" text-sm text-500">
          <SearchHighlight text={title} highlight={searchParam} />
        </p>
      </a>
      <p className="text-sm text-gray-500">
        <SearchHighlight text={blogName} highlight={searchParam} />
      </p>
    </CommandItem>
  );
}
