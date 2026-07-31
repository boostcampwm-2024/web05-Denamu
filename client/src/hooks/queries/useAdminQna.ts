import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminQna, GetAdminQnaListParams } from "@/api/services/admin/qna";
import { AnswerQnaPayload } from "@/types/qna";

const LIST_KEY = "adminQnaList";
const DETAIL_KEY = "adminQna";

export const useAdminQnaList = (params: GetAdminQnaListParams) => {
  return useQuery({
    queryKey: [LIST_KEY, params],
    queryFn: () => adminQna.getList(params),
  });
};

export const useAdminQna = (id: number | null) => {
  return useQuery({
    queryKey: [DETAIL_KEY, id],
    queryFn: () => adminQna.getDetail(id as number),
    enabled: id !== null,
  });
};

export const useAnswerQna = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AnswerQnaPayload) => adminQna.answer(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DETAIL_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [LIST_KEY] });
    },
  });
};
