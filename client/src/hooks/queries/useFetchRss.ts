import { admin } from "@/api/services/admin/rss";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useFetchData = <TData,>(queryKey: string, queryFn: () => Promise<TData>) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: [queryKey],
    queryFn,
    retry: 1,
    refetchInterval: 1000 * 5,
  });

  const refetchData = () => {
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  };

  return { data, isLoading, error, refetchData };
};

export const useFetchRss = () => useFetchData("adminRss", admin.getRss);
export const useFetchAccept = () => useFetchData("adminAccept", admin.getAccept);
export const useFetchReject = () => useFetchData("adminReject", admin.getReject);
