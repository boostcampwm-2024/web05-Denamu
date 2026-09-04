import { Image as ImageIcon } from "lucide-react";

import SearchHighlight from "@/components/search/SearchHigilight";
import { PlatformIcon } from "@/components/profile/rss/PlatformIcon";
import { CommandItem } from "@/components/ui/command";

import { useSearchStore } from "@/store/useSearchStore";
import { SearchResult } from "@/types/search";
import { formatDate } from "@/utils/date";

export default function SearchResultItem({ id, title, blog, thumbnail, createdAt }: SearchResult) {
  const { searchParam } = useSearchStore();
  return (
    <CommandItem className="p-0">
      <a href={`${id}`} className="flex items-center gap-3 w-full px-2 py-1.5 hover:underline">
        <div className="w-12 h-12 rounded overflow-hidden bg-muted flex items-center justify-center shrink-0">
          {thumbnail ? (
            <img src={thumbnail} alt={title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <p className=" text-sm text-500 truncate">
            <SearchHighlight text={title} highlight={searchParam} />
          </p>
          <div className="flex items-center gap-1.5">
            <PlatformIcon platform={blog.platform} image={blog.image} name={blog.name} className="w-4 h-4 shrink-0" />
            <p className="text-sm text-gray-500 truncate">
              <SearchHighlight text={blog.name} highlight={searchParam} />
            </p>
            <span className="text-xs text-gray-400 shrink-0">{formatDate(createdAt)}</span>
          </div>
        </div>
      </a>
    </CommandItem>
  );
}
