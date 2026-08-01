import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addQnaMessage,
  createQna,
  getQna,
  getQnaList,
  GetQnaListParams,
  verifyQnaPassword,
} from "@/api/services/qna";
import { AddQnaMessagePayload, CreateQnaPayload, VerifyQnaPasswordPayload } from "@/types/qna";

const LIST_KEY = "qnaList";
const DETAIL_KEY = "qna";

export const useQnaList = (params: GetQnaListParams, enabled = true) => {
  return useQuery({
    queryKey: [LIST_KEY, params],
    queryFn: () => getQnaList(params),
    enabled,
  });
};

export const useQna = (id: number | null) => {
  return useQuery({
    queryKey: [DETAIL_KEY, id],
    queryFn: () => getQna(id as number),
    enabled: id !== null,
  });
};

export const useCreateQna = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateQnaPayload) => createQna(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LIST_KEY] });
    },
  });
};

export const useVerifyQnaPassword = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VerifyQnaPasswordPayload) => verifyQnaPassword(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData([DETAIL_KEY, id], data);
    },
  });
};

export const useAddQnaMessage = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddQnaMessagePayload) => addQnaMessage(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DETAIL_KEY, id] });
    },
  });
};
