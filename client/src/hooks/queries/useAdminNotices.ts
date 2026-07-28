import { adminNotice, GetAdminNoticesParams } from "@/api/services/admin/notice";
import { CreateNoticePayload, UpdateNoticePayload } from "@/types/notice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const LIST_KEY = "adminNotices";

export const useAdminNotices = (params: GetAdminNoticesParams) => {
  return useQuery({
    queryKey: [LIST_KEY, params],
    queryFn: () => adminNotice.getList(params),
  });
};

export const useCreateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNoticePayload) => adminNotice.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LIST_KEY] });
    },
  });
};

export const useUpdateNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateNoticePayload }) => adminNotice.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LIST_KEY] });
    },
  });
};

export const useDeleteNotice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminNotice.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LIST_KEY] });
    },
  });
};
