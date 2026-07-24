import { AxiosError } from "axios";

import { registerRss } from "@/api/services/rss";
import { RegisterRss, RegisterResponse } from "@/types/rss";
import { useMutation, UseMutationResult } from "@tanstack/react-query";

export const useRegisterRss = (
  onSuccess: (data: RegisterResponse) => void,
  onError: (error: AxiosError<unknown>) => void
): UseMutationResult<RegisterResponse, AxiosError<unknown>, RegisterRss, unknown> => {
  return useMutation<RegisterResponse, AxiosError<unknown>, RegisterRss>({
    mutationFn: registerRss,
    onSuccess,
    onError,
  });
};
