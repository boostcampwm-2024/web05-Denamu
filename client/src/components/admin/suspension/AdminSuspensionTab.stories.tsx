import AdminSuspensionTab from "@/components/admin/suspension/AdminSuspensionTab";

import { SEARCH, SUSPENSION } from "@/constants/endpoints";

import { mockSuspendedUsersPage, mockUserSearchResult } from "@/__storybook__/fixtures";
import { fail, mockApi, ok } from "@/__storybook__/mockApi";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "admin/suspension/AdminSuspensionTab",
  component: AdminSuspensionTab,
} satisfies Meta<typeof AdminSuspensionTab>;

export default meta;
type Story = StoryObj<typeof meta>;

const setupSuspensions = () => {
  mockApi.onGet(SUSPENSION.ADMIN_LIST).reply(...ok(mockSuspendedUsersPage));
};

const setupSearchAndSuspend = () => {
  mockApi.onGet(SUSPENSION.ADMIN_LIST).reply(...ok({ result: [], lastId: 0, hasMore: false }));
  mockApi.onGet(SEARCH.GET_USER_RESULT).reply(
    ...ok({ result: [mockUserSearchResult], totalCount: 1, totalPages: 1 })
  );
  mockApi.onPost(SUSPENSION.ADMIN_LIST).reply(...ok(null));
};

export const WithData: Story = {
  name: "정지 유저 있음",
  beforeEach: setupSuspensions,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText(/스팸유저/)).toBeInTheDocument();
    await expect(canvas.getByText(/영구 정지/)).toBeInTheDocument();
    await expect(canvas.getByText(/까지 정지/)).toBeInTheDocument();
  },
};

export const Empty: Story = {
  name: "정지 유저 없음",
  beforeEach: () => {
    mockApi.onGet(SUSPENSION.ADMIN_LIST).reply(...ok({ result: [], lastId: 0, hasMore: false }));
  },
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(SUSPENSION.ADMIN_LIST).reply(() => new Promise(() => {}));
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(SUSPENSION.ADMIN_LIST).reply(...fail());
  },
};

export const SearchAndSuspend: Story = {
  name: "유저 검색 후 정지 부여",
  beforeEach: setupSearchAndSuspend,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.type(
      canvas.getByPlaceholderText("정지할 유저의 닉네임을 검색하세요"),
      mockUserSearchResult.userName
    );

    const suspendButton = await canvas.findByRole("button", { name: "정지" });
    await userEvent.click(suspendButton);

    await userEvent.type(
      await body.findByPlaceholderText("정지 사유 및 처리 내용을 입력해주세요."),
      "반복적인 스팸으로 정지 처리합니다."
    );
    await userEvent.click(body.getByRole("button", { name: "정지 처리" }));

    await waitFor(() => expect(mockApi.history.post).toHaveLength(1));
  },
};
