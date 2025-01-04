import { posts } from "@/api/services/posts";
import { useQuery } from "@tanstack/react-query";

export const useUpdatePost = () => {
  const { data, isLoading, error } = useQuery({ queryKey: ["update-posts"], queryFn: posts.update, retry: 1 });
  return { data, isLoading, error };
};
