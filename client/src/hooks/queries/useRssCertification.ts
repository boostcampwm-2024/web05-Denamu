import { AxiosError } from "axios";

import {
  createRssCertification,
  deleteRssCertification,
  getOwnedRssFeeds,
  previewRssCertification,
  setFeedVisibility,
  updateRssCertification,
  verifyRssCertification,
} from "@/api/services/rss";
import { ApiMessage } from "@/types/api";
import { CreateRssCertificationResult, RssCertificationPreview } from "@/types/profile";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type ApiError = AxiosError<{ message?: string }>;

const useInvalidateCertifiedRss = (userId: number) => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["certifiedRss", userId] });
};

export const useRssCertificationPreview = () =>
  useMutation<RssCertificationPreview, ApiError, string>({
    mutationFn: previewRssCertification,
  });

export const useCreateRssCertification = (userId: number) => {
  const invalidate = useInvalidateCertifiedRss(userId);
  return useMutation<CreateRssCertificationResult, ApiError, string>({
    mutationFn: createRssCertification,
    onSuccess: (data) => {
      // 즉시 인증(certified=true)된 경우에만 목록이 즉시 갱신된다.
      if (data.certified) invalidate();
    },
  });
};

export const useVerifyRssCertification = (userId: number) => {
  const invalidate = useInvalidateCertifiedRss(userId);
  return useMutation<ApiMessage, ApiError, string>({
    mutationFn: verifyRssCertification,
    onSuccess: () => invalidate(),
  });
};

export const useUpdateRssCertification = (userId: number) => {
  const invalidate = useInvalidateCertifiedRss(userId);
  return useMutation<ApiMessage, ApiError, { id: number; name: string; userName: string }>({
    mutationFn: ({ id, name, userName }) => updateRssCertification(id, { name, userName }),
    onSuccess: () => invalidate(),
  });
};

export const useDeleteRssCertification = (userId: number) => {
  const invalidate = useInvalidateCertifiedRss(userId);
  return useMutation<ApiMessage, ApiError, number>({
    mutationFn: deleteRssCertification,
    onSuccess: () => invalidate(),
  });
};

export const useOwnedRssFeeds = (rssId: number, enabled: boolean) =>
  useInfiniteQuery({
    queryKey: ["ownedRssFeeds", rssId],
    queryFn: ({ pageParam }) => getOwnedRssFeeds(rssId, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.lastId : undefined),
    enabled: enabled && !!rssId,
  });

export const useSetFeedVisibility = (rssId: number) => {
  const queryClient = useQueryClient();
  return useMutation<ApiMessage, ApiError, { feedId: number; isPublic: boolean }>({
    mutationFn: ({ feedId, isPublic }) => setFeedVisibility(rssId, feedId, isPublic),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ownedRssFeeds", rssId] }),
  });
};
