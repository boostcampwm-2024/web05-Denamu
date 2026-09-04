import { BadgeCheck } from "lucide-react";

import SearchHighlight from "@/components/search/SearchHigilight";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommandItem } from "@/components/ui/command";

import { useSearchStore } from "@/store/useSearchStore";
import { UserSearchResult } from "@/types/search";

interface UserSearchResultItemProps extends UserSearchResult {
  onSelect: (userId: number) => void;
}

export default function UserSearchResultItem({
  id,
  userName,
  profileImage,
  introduction,
  blogCount,
  onSelect,
}: UserSearchResultItemProps) {
  const { searchParam } = useSearchStore();
  const initials = userName ? userName.substring(0, 2).toUpperCase() : "사용자";

  return (
    <CommandItem className="p-0">
      <button
        type="button"
        onClick={() => onSelect(id)}
        className="flex items-center gap-3 w-full px-2 py-1.5 text-left cursor-pointer"
      >
        <Avatar className="h-9 w-9 shrink-0">
          {profileImage && <AvatarImage src={profileImage} alt={userName} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <div className="text-sm flex items-center gap-1">
            <SearchHighlight text={userName} highlight={searchParam} />
            {blogCount > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <BadgeCheck className="h-3.5 w-3.5" />
                인증된 RSS {blogCount}개
              </span>
            )}
          </div>
          {introduction && <p className="text-xs text-muted-foreground truncate">{introduction}</p>}
        </div>
      </button>
    </CommandItem>
  );
}
