import { adminBoard, GetAdminBoardsParams } from "@/api/services/admin/board";
import { CreateBoardPayload, UpdateBoardPayload } from "@/types/board";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const LIST_KEY = "adminBoards";

export const useAdminBoards = (params: GetAdminBoardsParams) => {
  return useQuery({
    queryKey: [LIST_KEY, params],
    queryFn: () => adminBoard.getList(params),
  });
};

export const useCreateBoard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBoardPayload) => adminBoard.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LIST_KEY] });
    },
  });
};

export const useUpdateBoard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateBoardPayload }) => adminBoard.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LIST_KEY] });
    },
  });
};

export const useDeleteBoard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminBoard.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LIST_KEY] });
    },
  });
};
