import { blockUser, getBlockedUsers, unblockUser } from "@/api/services/block";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const invalidateBlockRelatedQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
  queryClient.invalidateQueries({ queryKey: ["userProfile"] });
  queryClient.invalidateQueries({ queryKey: ["comments"] });
  queryClient.invalidateQueries({ queryKey: ["getUserSearch"] });
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
