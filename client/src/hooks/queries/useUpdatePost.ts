import { posts } from "@/api/services/posts";
import { InfiniteScrollResponse, FeedList } from "@/types/post";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";

const latestPostsKey = ["latest-posts", []];

const clearNew = (result: FeedList[]) => result.map((post) => ({ ...post, isNew: false }));

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: posts.update,
    onSuccess: ({ data }) => {
      queryClient.setQueryData<InfiniteData<InfiniteScrollResponse<FeedList>>>(latestPostsKey, (old) => {
        if (!old || old.pages.length === 0) return old;

        const [firstPage, ...restPages] = old.pages;
        return {
          ...old,
          pages: [
            { ...firstPage, result: [...data, ...clearNew(firstPage.result)] },
            ...restPages.map((page) => ({ ...page, result: clearNew(page.result) })),
          ],
        };
      });
    },
  });
};
