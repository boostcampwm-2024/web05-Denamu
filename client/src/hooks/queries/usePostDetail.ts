import { posts } from "@/api/services/posts";
import { useQuery } from "@tanstack/react-query";

export const usePostDetail = (postId: number) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["getDetail", postId],
    queryFn: () => posts.detail(postId),
    staleTime: 1000 * 60 * 5,
  });
  return { data, isLoading, error };
};
