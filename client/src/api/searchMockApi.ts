import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import { SearchResult } from "@/types/search";

const mock = new MockAdapter(axios);

const baseMockData = [
  {
    id: 1,
    blogName: "토스",
    title: "Next.js 13 마이그레이션 가이드",
    path: "https://naver.com",
    createdAt: "2024-11-05 13:42:30",
  },
  {
    id: 2,
    blogName: "우아한형제들",
    title: "Spring Boot 3.0 업데이트 내용",
    path: "https://naver.com",
    createdAt: "2024-11-05 13:42:30",
  },
  {
    id: 3,
    blogName: "네이버",
    title: "React 18에서 알아야 할 새로운 기능들",
    path: "https://naver.com",
    createdAt: "2024-11-05 13:42:30",
  },
  {
    id: 4,
    blogName: "카카오",
    title: "TypeScript로 더 안전한 코드 작성하기",
    path: "https://naver.com",
    createdAt: "2024-11-05 13:42:30",
  },
  {
    id: 5,
    blogName: "라인",
    title: "Node.js 성능 최적화 기법",
    path: "https://naver.com",
    createdAt: "2024-11-05 13:42:30",
  },
  {
    id: 6,
    blogName: "배달의민족",
    title: "Flutter를 활용한 크로스 플랫폼 앱 개발",
    path: "https://naver.com",
    createdAt: "2024-11-05 13:42:30",
  },
  {
    id: 7,
    blogName: "삼성",
    title: "Kubernetes로 애플리케이션 배포 자동화하기",
    path: "https://naver.com",
    createdAt: "2024-11-05 13:42:30",
  },
  {
    id: 8,
    blogName: "넷플릭스",
    title: "GraphQL 도입 후의 장단점",
    path: "https://naver.com",
    createdAt: "2024-11-05 13:42:30",
  },
  {
    id: 9,
    blogName: "구글",
    title: "Python으로 머신러닝 모델 학습시키기",
    path: "https://naver.com",
    createdAt: "2024-11-05 13:42:30",
  },
  {
    id: 10,
    blogName: "AWS",
    title: "Docker로 개발 환경 구성하기",
    path: "https://naver.com",
    createdAt: "2024-11-05 13:42:30",
  },
];

const mockData: SearchResult[] = baseMockData.map(({ blogName, ...item }) => ({
  ...item,
  author: blogName,
  blog: { name: blogName, platform: "etc" },
  thumbnail: "",
  viewCount: 0,
  tag: [],
  likes: 0,
  comments: 0,
}));

mock.onGet("/api/search").reply((config) => {
  const { find, type, limit = 4, page = 1 } = config.params;

  const filteredData = mockData.filter((item) => {
    if (type === "title") {
      return item.title.includes(find);
    } else if (type === "blogName") {
      return item.blog.name.includes(find);
    } else {
      return item.blog.name.includes(find) || item.title.includes(find);
    }
  });

  const total_count = filteredData.length;
  const total_pages = Math.ceil(total_count / limit);

  const startIndex = (page - 1) * limit;
  const limitedData = filteredData.slice(startIndex, startIndex + limit);

  return [
    200,
    {
      status: 200,
      data: limitedData,
      page,
      total_count,
      total_pages,
    },
  ];
});
