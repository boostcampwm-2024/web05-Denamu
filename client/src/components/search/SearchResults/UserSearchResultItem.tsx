import SearchHighlight from "@/components/search/SearchHigilight";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommandItem } from "@/components/ui/command";

import { useSearchStore } from "@/store/useSearchStore";
import { UserSearchResult } from "@/types/search";

interface UserSearchResultItemProps extends UserSearchResult {
  onSelect: (userId: number) => void;
}

export default function UserSearchResultItem({ id, userName, profileImage, onSelect }: UserSearchResultItemProps) {
  const { searchParam } = useSearchStore();
  const initials = userName ? userName.substring(0, 2).toUpperCase() : "사용자";

  return (
    <CommandItem className="p-0">
      <button
        type="button"
        onClick={() => onSelect(id)}
        className="flex items-center gap-3 w-full px-2 py-1.5 text-left cursor-pointer"
      >
        <Avatar className="h-9 w-9">
          {profileImage && <AvatarImage src={profileImage} alt={userName} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <p className="text-sm">
          <SearchHighlight text={userName} highlight={searchParam} />
        </p>
      </button>
    </CommandItem>
  );
}
