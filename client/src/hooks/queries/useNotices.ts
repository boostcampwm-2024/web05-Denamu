import { getNotice, getNotices, GetNoticesParams } from "@/api/services/notice";
import { useQuery } from "@tanstack/react-query";

export const useNotices = (params: GetNoticesParams, enabled = true) => {
  return useQuery({
    queryKey: ["notices", params],
    queryFn: () => getNotices(params),
    enabled,
  });
};

export const useNotice = (id: number | null) => {
  return useQuery({
    queryKey: ["notice", id],
    queryFn: () => getNotice(id as number),
    enabled: id !== null,
  });
};
