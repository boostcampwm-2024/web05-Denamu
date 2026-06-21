import { AxiosError } from "axios";

import { getLinkedProviders, unlinkOAuthProvider } from "@/api/services/oauthLink";
import { ApiMessage } from "@/types/api";
import { LinkedProvidersResponse, OAuthProviderType } from "@/types/profile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type ApiError = AxiosError<{ message?: string }>;

export const LINKED_PROVIDERS_KEY = ["linkedProviders"];

export const useLinkedProviders = () =>
  useQuery<LinkedProvidersResponse, ApiError>({
    queryKey: LINKED_PROVIDERS_KEY,
    queryFn: getLinkedProviders,
  });

export const useUnlinkProvider = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiMessage, ApiError, OAuthProviderType>({
    mutationFn: unlinkOAuthProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LINKED_PROVIDERS_KEY });
    },
  });
};
