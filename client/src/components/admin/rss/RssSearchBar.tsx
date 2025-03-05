import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

import { useAdminSearchStore } from "@/store/useSearchStore";

export const RssRequestSearchBar = () => {
  const { searchParam, setSearchParam } = useAdminSearchStore();
  return (
    <div className="mb-8 flex space-x-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="블로그명, URL 또는 신청자로 검색"
          className="pl-10"
          value={searchParam}
          onChange={(e) => setSearchParam(e.target.value)}
        />
      </div>
    </div>
  );
};
