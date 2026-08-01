import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import Header from "@/components/layout/Header";
import { BLOG, SEARCH } from "@/constants/endpoints";
import { mockSearchResult, mockUserSearchResult } from "@/__storybook__/fixtures";
import { mockApi, ok } from "@/__storybook__/mockApi";

const meta = {
  title: "layout/Header",
  component: Header,
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach: () => {
    mockApi.onGet(SEARCH.GET_RESULT).reply(...ok({ result: [mockSearchResult], totalCount: 1, totalPages: 1 }));
    mockApi.onGet(SEARCH.GET_USER_RESULT).reply(...ok([mockUserSearchResult]));
    mockApi.onPost(BLOG.RSS.REGISTRER_RSS).reply(...ok(null));
  },
};

export const SearchFlow: Story = {
  name: "검색 (모달 열기 → 입력 → 결과)",
  beforeEach: () => {
    mockApi.onGet(SEARCH.GET_RESULT).reply(...ok({ result: [mockSearchResult], totalCount: 1, totalPages: 1 }));
    mockApi.onGet(SEARCH.GET_USER_RESULT).reply(...ok([mockUserSearchResult]));
    mockApi.onPost(BLOG.RSS.REGISTRER_RSS).reply(...ok(null));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "검색" }));
    await userEvent.type(await canvas.findByPlaceholderText("검색어를 입력하세요"), "Storybook");
    await expect(await canvas.findByText(/검색결과 \(총 1건\)/)).toBeInTheDocument();
  },
};

export const SearchNoResults: Story = {
  name: "검색 결과 없음",
  beforeEach: () => {
    mockApi.onGet(SEARCH.GET_RESULT).reply(...ok({ result: [], totalCount: 0, totalPages: 0 }));
    mockApi.onGet(SEARCH.GET_USER_RESULT).reply(...ok([]));
    mockApi.onPost(BLOG.RSS.REGISTRER_RSS).reply(...ok(null));
  },
};
