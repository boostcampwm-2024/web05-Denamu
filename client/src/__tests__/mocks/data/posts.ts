export const createMockPost = (override = {}) => ({
  id: 1,
  createdAt: "2024-03-26T00:00:00Z",
  title: "테스트 포스트",
  viewCount: 100,
  path: "/test-post",
  thumbnail: "test-thumbnail.jpg",
  tag: ["React", "Testing"],
  likes: 50,
  comments: 0,
  blog: { name: "작성자", platform: "etc" },
  summary: "# test",
  ...override,
});

export const createMockPosts = (count: number) => {
  return Array.from({ length: count }, (_, index) => createMockPost({ id: index + 1 }));
};

export const createMinimalPost = () =>
  createMockPost({
    thumbnail: undefined,
    tags: undefined,
  });

export const createLongTitlePost = () =>
  createMockPost({
    title: "아주 긴 제목".repeat(20),
  });

export const createNoAuthorPost = () =>
  createMockPost({
    blog: { name: "", platform: "etc" },
  });
