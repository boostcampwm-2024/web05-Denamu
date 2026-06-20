import { comments } from "@/api/services/comments";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const commentsKey = (feedId: number) => ["comments", feedId];

export const useComments = (feedId: number) =>
  useQuery({
    queryKey: commentsKey(feedId),
    queryFn: () => comments.get(feedId),
    enabled: feedId > 0,
  });

export const useCreateComment = (feedId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (comment: string) => comments.create(feedId, comment),
    onSettled: () => queryClient.invalidateQueries({ queryKey: commentsKey(feedId) }),
  });
};

export const useUpdateComment = (feedId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, newComment }: { commentId: number; newComment: string }) =>
      comments.update(feedId, commentId, newComment),
    onSettled: () => queryClient.invalidateQueries({ queryKey: commentsKey(feedId) }),
  });
};

export const useDeleteComment = (feedId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => comments.remove(feedId, commentId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: commentsKey(feedId) }),
  });
};
