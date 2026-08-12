import SearchHighlight from "@/components/search/SearchHigilight";
import { PlatformIcon } from "@/components/profile/rss/PlatformIcon";
import { Badge } from "@/components/ui/badge";
import { CommandItem } from "@/components/ui/command";

import { useSearchStore } from "@/store/useSearchStore";
import { RssSearchResult } from "@/types/search";

interface RssSearchResultItemProps extends RssSearchResult {
  onSelect: (rssId: number) => void;
}

export default function RssSearchResultItem({
  id,
  name,
  blogPlatform,
  blogImage,
  feedCount,
  onSelect,
}: RssSearchResultItemProps) {
  const { searchParam } = useSearchStore();

  return (
    <CommandItem className="p-0">
      <button
        type="button"
        onClick={() => onSelect(id)}
        className="flex items-center gap-3 w-full px-2 py-1.5 text-left cursor-pointer"
      >
        <div className="overflow-hidden bg-white border rounded-full w-9 h-9 shrink-0">
          <PlatformIcon platform={blogPlatform} image={blogImage} name={name} className="object-cover w-full h-full" />
        </div>
        <div className="flex flex-col min-w-0 gap-0.5 flex-1">
          <p className="text-sm">
            <SearchHighlight text={name} highlight={searchParam} />
          </p>
          <span className="text-xs text-muted-foreground">게시글 {feedCount}개</span>
        </div>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-4 shrink-0">
          {blogPlatform}
        </Badge>
      </button>
    </CommandItem>
  );
}
