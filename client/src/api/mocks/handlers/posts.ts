import { TOTAL_POSTS, PAGE_SIZE_POSTS } from "@/api/mocks/data/posts";
import { mock } from "@/api/mocks/mockSetup";

export const setupPostHandlers = () => {
  mock.onGet("/feed").reply((config) => {
    const limit = Number(config.params?.limit) || PAGE_SIZE_POSTS;
    const lastId = Number(config.params?.lastId) || 0;
    const startIndex = lastId ? TOTAL_POSTS.findIndex((post) => Number(post.id) === lastId) + 1 : 0;
    const posts = TOTAL_POSTS.slice(startIndex, startIndex + limit);
    const newLastId = posts.length > 0 ? Number(posts[posts.length - 1].id) : null;
    const hasMore = startIndex + limit < TOTAL_POSTS.length;

    return [
      200,
      {
        message: "피드 조회 완료",
        data: {
          result: posts,
          lastId: newLastId,
          hasMore: hasMore,
        },
      },
    ];
  });
};
