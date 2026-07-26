import { Loader } from "lucide-react";

import { CommandList, CommandEmpty, CommandGroup } from "@/components/ui/command";

import { useNavigateToRss } from "@/hooks/common/useNavigateToRss";
import { useRssSearch } from "@/hooks/queries/useRssSearch";

import SearchPages from "../searchPages/SearchPages";
import RssSearchResultItem from "./RssSearchResultItem";
import { useSearchStore } from "@/store/useSearchStore";

const RESULT_PER_PAGE = 5;
const COMMANDCLASS = "flex h-[28rem] justify-center items-center";

export default function RssSearchResultList({ onClose }: { onClose: () => void }) {
  const { searchParam, page } = useSearchStore();
  const navigateToRss = useNavigateToRss();
  const { data, isLoading, error } = useRssSearch({
    query: searchParam,
    page,
    pageSize: RESULT_PER_PAGE,
  });

  const totalItems = data?.data.totalCount ?? 0;
  const totalPages = data?.data.totalPages ?? 0;
  const results = data?.data.result || [];

  const handleSelect = (rssId: number) => {
    onClose();
    navigateToRss(rssId);
  };

  const renderContent = {
    noQuery: <CommandEmpty className={COMMANDCLASS}>검색어를 입력해주세요</CommandEmpty>,
    loading: (
      <CommandEmpty className={COMMANDCLASS}>
        <Loader />
      </CommandEmpty>
    ),
    searchEmpty: <CommandEmpty className={COMMANDCLASS}>검색결과가 없습니다</CommandEmpty>,
    error: <div className={COMMANDCLASS}>에러발생</div>,
    default: (
      <CommandGroup heading={`검색결과 (총 ${totalItems}건)`} className="h-[28rem] relative">
        <CommandList>
          {results.map((result) => (
            <RssSearchResultItem key={result.id} {...result} onSelect={handleSelect} />
          ))}
        </CommandList>
        <SearchPages totalPages={totalPages} />
      </CommandGroup>
    ),
  };

  const getRenderKey = () => {
    if (isLoading || !results) return "loading";
    if (error) return "error";
    if (searchParam.length === 0) return "noQuery";
    if (results.length === 0) return "searchEmpty";
    return "default";
  };

  return renderContent[getRenderKey()];
}
