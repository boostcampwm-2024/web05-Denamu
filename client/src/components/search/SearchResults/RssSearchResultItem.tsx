import SearchHighlight from "@/components/search/SearchHigilight";
import { PlatformIcon } from "@/components/profile/rss/PlatformIcon";
import { CommandItem } from "@/components/ui/command";

import { useSearchStore } from "@/store/useSearchStore";
import { RssSearchResult } from "@/types/search";

interface RssSearchResultItemProps extends RssSearchResult {
  onSelect: (rssId: number) => void;
}

export default function RssSearchResultItem({ id, name, blogPlatform, blogImage, onSelect }: RssSearchResultItemProps) {
  const { searchParam } = useSearchStore();

  return (
    <CommandItem className="p-0">
      <button
        type="button"
        onClick={() => onSelect(id)}
        className="flex items-center gap-3 w-full px-2 py-1.5 text-left cursor-pointer"
      >
        <div className="overflow-hidden bg-white border rounded-full w-9 h-9 shrink-0">
          <PlatformIcon platform={blogPlatform} image={blogImage} className="object-cover w-full h-full" />
        </div>
        <p className="text-sm">
          <SearchHighlight text={name} highlight={searchParam} />
        </p>
      </button>
    </CommandItem>
  );
}
