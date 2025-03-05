import { useState, useEffect } from "react";

import { debounce } from "@/utils/debounce";

import { getSearch } from "@/api/services/search";
import { SearchRequest } from "@/types/search";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useSearch = ({ query, filter, page, pageSize }: SearchRequest) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const queryClient = useQueryClient();
  useEffect(() => {
    const handler = debounce((newQuery) => {
      setDebouncedQuery(newQuery);
    }, 300);

    handler(query);

    return () => {
      if (handler.cancel) handler.cancel();
    };
  }, [query]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["getSearch", debouncedQuery, filter, page, pageSize],
    queryFn: () => getSearch({ query, filter, page, pageSize }),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
  const refetchSearch = () => {
    queryClient.invalidateQueries({ queryKey: ["getSearch"] });
  };
  return { data, isLoading, error, refetchSearch };
};
