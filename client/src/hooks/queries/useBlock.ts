import { blockRss, blockUser, getBlockedRss, getBlockedUsers, unblockRss, unblockUser } from "@/api/services/block";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const invalidateBlockRelatedQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
  queryClient.invalidateQueries({ queryKey: ["userProfile"] });
  queryClient.invalidateQueries({ queryKey: ["comments"] });
  queryClient.invalidateQueries({ queryKey: ["getUserSearch"] });
};

const invalidateRssBlockRelatedQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ["blockedRss"] });
  queryClient.invalidateQueries({ queryKey: ["rssInfo"] });
  queryClient.invalidateQueries({ queryKey: ["latest-posts"] });
  queryClient.invalidateQueries({ queryKey: ["getSearch"] });
  queryClient.invalidateQueries({ queryKey: ["getDetail"] });
  queryClient.invalidateQueries({ queryKey: ["recentRss"] });
  queryClient.invalidateQueries({ queryKey: ["subscriptionFeed"] });
};

export const useBlockedUsers = (enabled = true) =>
  useQuery({
    queryKey: ["blockedUsers"],
    queryFn: getBlockedUsers,
    enabled,
  });

export const useBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => blockUser(userId),
    onSuccess: () => invalidateBlockRelatedQueries(queryClient),
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => unblockUser(userId),
    onSuccess: () => invalidateBlockRelatedQueries(queryClient),
  });
};

export const useBlockedRss = (enabled = true) =>
  useQuery({
    queryKey: ["blockedRss"],
    queryFn: getBlockedRss,
    enabled,
  });

export const useBlockRss = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rssId: number) => blockRss(rssId),
    onSuccess: () => invalidateRssBlockRelatedQueries(queryClient),
  });
};

export const useUnblockRss = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rssId: number) => unblockRss(rssId),
    onSuccess: () => invalidateRssBlockRelatedQueries(queryClient),
  });
};
