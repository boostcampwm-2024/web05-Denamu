import { likes } from "@/api/services/likes";
import { FeedDetailType } from "@/types/post";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const likeKey = (feedId: number) => ["like", feedId];
const detailKey = (feedId: number) => ["getDetail", feedId];

export const useLikeStatus = (feedId: number, enabled: boolean) => {
  return useQuery({
    queryKey: likeKey(feedId),
    queryFn: () => likes.get(feedId),
    enabled: enabled && feedId > 0,
  });
};

export const useToggleLike = (feedId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isLike: boolean) => (isLike ? likes.remove(feedId) : likes.create(feedId)),
    onMutate: async (isLike: boolean) => {
      await queryClient.cancelQueries({ queryKey: likeKey(feedId) });
      await queryClient.cancelQueries({ queryKey: detailKey(feedId) });

      const prevIsLike = queryClient.getQueryData<boolean>(likeKey(feedId));
      const prevDetail = queryClient.getQueryData<FeedDetailType>(detailKey(feedId));

      const nextIsLike = !isLike;
      queryClient.setQueryData<boolean>(likeKey(feedId), nextIsLike);
      queryClient.setQueryData<FeedDetailType>(detailKey(feedId), (old) =>
        old ? { ...old, data: { ...old.data, likes: Math.max(0, (old.data.likes ?? 0) + (nextIsLike ? 1 : -1)) } } : old
      );

      return { prevIsLike, prevDetail };
    },
    onError: (_error, _variables, context) => {
      if (context?.prevIsLike !== undefined) {
        queryClient.setQueryData(likeKey(feedId), context.prevIsLike);
      }
      if (context?.prevDetail) {
        queryClient.setQueryData(detailKey(feedId), context.prevDetail);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: likeKey(feedId) });
      queryClient.invalidateQueries({ queryKey: detailKey(feedId) });
    },
  });
};
