import { OAUTH } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";

import { ApiData, ApiMessage } from "@/types/api";
import { LinkedProvidersResponse, OAuthProviderType } from "@/types/profile";

export const getLinkedProviders = async (): Promise<LinkedProvidersResponse> => {
  const response = await axiosInstance.get<ApiData<LinkedProvidersResponse>>(OAUTH.LINKS);
  return response.data.data;
};

export const initiateOAuthLink = async (provider: OAuthProviderType): Promise<string> => {
  const response = await axiosInstance.post<ApiData<{ authUrl: string }>>(OAUTH.LINKS, { provider });
  return response.data.data.authUrl;
};

export const unlinkOAuthProvider = async (provider: OAuthProviderType): Promise<ApiMessage> => {
  const response = await axiosInstance.delete<ApiMessage>(OAUTH.UNLINK(provider));
  return response.data;
};
