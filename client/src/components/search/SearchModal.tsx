import FilterButton from "@/components/search/SearchFilters/FilterButton";
import SearchInput from "@/components/search/SearchHeader/SearchInput";
import SearchModeTabs from "@/components/search/SearchModeTabs";
import SearchResultList from "@/components/search/SearchResults/SearchResultList";
import UserSearchResultList from "@/components/search/SearchResults/UserSearchResultList";
import { Command, CommandSeparator } from "@/components/ui/command";

import { useSearchStore } from "@/store/useSearchStore";

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const { searchMode, resetPage, resetParam, resetFilter, resetMode } = useSearchStore();
  const handleClose = () => {
    resetPage();
    resetParam();
    resetFilter();
    resetMode();
    onClose();
  };
  return (
    <Command
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={handleClose}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
        <SearchInput onClose={handleClose} />
        <CommandSeparator />
        <SearchModeTabs />
        <CommandSeparator />
        {searchMode === "feed" ? (
          <>
            <FilterButton />
            <CommandSeparator />
            <SearchResultList />
          </>
        ) : (
          <UserSearchResultList onClose={handleClose} />
        )}
      </div>
    </Command>
  );
}
