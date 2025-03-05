export const createMockPost = (override = {}) => ({
  id: 1,
  createdAt: "2024-03-26T00:00:00Z",
  title: "테스트 포스트",
  viewCount: 100,
  path: "/test-post",
  author: "작성자",
  thumbnail: "test-thumbnail.jpg",
  authorImageUrl: "author-image.jpg",
  tag: ["React", "Testing"],
  likes: 50,
  blogPlatform: "etc",
  summary: "# test",
  ...override,
});

export const createMockPosts = (count: number) => {
  return Array.from({ length: count }, (_, index) => createMockPost({ id: index + 1 }));
};

export const createMinimalPost = () =>
  createMockPost({
    thumbnail: undefined,
    authorImageUrl: undefined,
    tags: undefined,
    likes: undefined,
  });

export const createLongTitlePost = () =>
  createMockPost({
    title: "아주 긴 제목".repeat(20),
  });

export const createNoAuthorPost = () =>
  createMockPost({
    author: "",
    authorImageUrl: undefined,
  });
