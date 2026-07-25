import { useState, useEffect } from "react";

import { debounce } from "@/utils/debounce";

import { getRssSearch } from "@/api/services/search";
import { RssSearchRequest } from "@/types/search";
import { useQuery } from "@tanstack/react-query";

export const useRssSearch = ({ query, page, pageSize }: RssSearchRequest) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const handler = debounce((newQuery: string) => {
      setDebouncedQuery(newQuery);
    }, 300);

    handler(query);

    return () => {
      if (handler.cancel) handler.cancel();
    };
  }, [query]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["getRssSearch", debouncedQuery, page, pageSize],
    queryFn: () => getRssSearch({ query: debouncedQuery, page, pageSize }),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
  return { data, isLoading, error };
};
