import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import SearchModal from "@/components/search/SearchModal";
import { SEARCH } from "@/constants/endpoints";
import { mockSearchResult, mockUserSearchResult } from "@/__storybook__/fixtures";
import { mockApi, ok } from "@/__storybook__/mockApi";

const meta = {
  title: "search/SearchModal",
  component: SearchModal,
  args: { onClose: fn() },
  beforeEach: () => {
    mockApi.onGet(SEARCH.GET_RESULT).reply(...ok({ result: [mockSearchResult], totalCount: 1, totalPages: 1 }));
    mockApi.onGet(SEARCH.GET_USER_RESULT).reply(...ok([mockUserSearchResult]));
  },
} satisfies Meta<typeof SearchModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SearchFlow: Story = {
  name: "검색어 입력 → 결과",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await canvas.findByPlaceholderText("검색어를 입력하세요"), "Storybook");
    await expect(await canvas.findByText(/검색결과 \(총 1건\)/)).toBeInTheDocument();
  },
};
