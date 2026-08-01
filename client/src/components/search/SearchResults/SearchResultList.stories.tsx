import type { Meta, StoryObj } from "@storybook/react-vite";

import SearchResultList from "@/components/search/SearchResults/SearchResultList";
import { Command } from "@/components/ui/command";
import { SEARCH } from "@/constants/endpoints";
import { mockSearchResult } from "@/__storybook__/fixtures";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";
import { useSearchStore } from "@/store/useSearchStore";

const meta = {
  title: "search/SearchResults/SearchResultList",
  component: SearchResultList,
  decorators: [
    (Story) => (
      <Command>
        <Story />
      </Command>
    ),
  ],
} satisfies Meta<typeof SearchResultList>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockSearchData = {
  totalCount: 3,
  totalPages: 1,
  result: [mockSearchResult, { ...mockSearchResult, id: 2, title: "TypeScript 5.0 새로운 기능" }, { ...mockSearchResult, id: 3, title: "React Query v5 마이그레이션" }],
};

export const NoQuery: Story = {
  name: "검색 전",
  beforeEach: () => {
    useSearchStore.setState({ searchParam: "", page: 1 });
  },
};

export const WithResults: Story = {
  name: "검색 결과 있음",
  beforeEach: () => {
    useSearchStore.setState({ searchParam: "React", page: 1 });
    mockApi.onGet(SEARCH.GET_RESULT).reply(...ok(mockSearchData));
  },
};

export const Loading: Story = {
  name: "검색 중",
  beforeEach: () => {
    useSearchStore.setState({ searchParam: "React", page: 1 });
    mockApi.onGet(SEARCH.GET_RESULT).reply(() => new Promise(() => {}));
  },
};

export const Empty: Story = {
  name: "검색 결과 없음",
  beforeEach: () => {
    useSearchStore.setState({ searchParam: "없는검색어", page: 1 });
    mockApi.onGet(SEARCH.GET_RESULT).reply(...ok({ totalCount: 0, totalPages: 0, result: [] }));
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    useSearchStore.setState({ searchParam: "React", page: 1 });
    mockApi.onGet(SEARCH.GET_RESULT).reply(...fail());
  },
};
