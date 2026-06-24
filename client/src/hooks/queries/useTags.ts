import { tags } from "@/api/services/tag";
import { CategoryTags } from "@/types/tag";
import { useQuery } from "@tanstack/react-query";

export const useTags = () => {
  return useQuery<CategoryTags[]>({
    queryKey: ["tags"],
    queryFn: tags.list,
    staleTime: 1000 * 60 * 60,
  });
};
