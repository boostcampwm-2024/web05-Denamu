import { Loader } from "lucide-react";

import { CommandList, CommandEmpty, CommandGroup } from "@/components/ui/command";

import { useSearch } from "@/hooks/queries/useSearch";

import SearchPages from "../searchPages/SearchPages";
import SearchResultItem from "./SearchResultItem";
import { useSearchStore } from "@/store/useSearchStore";

const RESULT_PER_PAGE = 5;
const COMMANDCLASS = "flex h-[28rem] justify-center items-center";
export default function SearchResults() {
  const { searchParam, currentFilter, page } = useSearchStore();
  const { data, isLoading, error } = useSearch({
    query: searchParam,
    filter: currentFilter,
    page,
    pageSize: RESULT_PER_PAGE,
  });
  const totalItems = data?.data.totalCount ?? 0;
  const totalPages = data?.data.totalPages ?? 0;
  const results = data?.data.result || [];
  const renderContent = {
    //검색 전
    noQuery: <CommandEmpty className={COMMANDCLASS}>검색어를 입력해주세요</CommandEmpty>,
    // 검색 로딩
    loading: (
      <CommandEmpty className={COMMANDCLASS}>
        <Loader />
      </CommandEmpty>
    ),
    // 검색 결과 없음
    searchEmpty: <CommandEmpty className={COMMANDCLASS}>검색결과가 없습니다</CommandEmpty>,
    // 에러발생
    error: <div className={COMMANDCLASS}>에러발생</div>,
    // 정상적인 상황
    default: (
      <CommandGroup heading={`검색결과 (총 ${totalItems}건)`} className="h-[28rem] relative">
        <CommandList className="">
          {results.map((result, index) => (
            <SearchResultItem key={index} {...result} />
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
