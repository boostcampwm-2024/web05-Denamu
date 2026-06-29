import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import SearchInput from "@/components/search/SearchHeader/SearchInput";
import { SEARCH } from "@/constants/endpoints";
import { mockSearchResult, mockUserSearchResult } from "@/__storybook__/fixtures";
import { mockApi, ok } from "@/__storybook__/mockApi";

const meta = {
  title: "search/SearchHeader/SearchInput",
  component: SearchInput,
  args: { onClose: fn() },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach: () => {
    mockApi.onGet(SEARCH.GET_RESULT).reply(...ok({ result: [mockSearchResult], totalCount: 1, totalPages: 1 }));
    mockApi.onGet(SEARCH.GET_USER_RESULT).reply(...ok([mockUserSearchResult]));
  },
};

export const NoResults: Story = {
  name: "검색 결과 없음",
  beforeEach: () => {
    mockApi.onGet(SEARCH.GET_RESULT).reply(...ok({ result: [], totalCount: 0, totalPages: 0 }));
    mockApi.onGet(SEARCH.GET_USER_RESULT).reply(...ok([]));
  },
};
