import RssListPage from "@/pages/RssListPage";

import { BLOG } from "@/constants/endpoints";

import { fail, mockApi, ok } from "@/__storybook__/mockApi";
import { RssSearchData } from "@/types/search";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "pages/RssListPage",
  component: RssListPage,
  parameters: {
    router: { initialEntries: ["/rss"] },
  },
} satisfies Meta<typeof RssListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const rssListData: RssSearchData = {
  totalCount: 4,
  totalPages: 1,
  result: [
    {
      id: 1,
      name: "seok3765.log",
      blogPlatform: "velog",
      blogImage: null,
      feedCount: 12,
      lastPublishedAt: "2025-01-15T00:00:00.000Z",
    },
    {
      id: 2,
      name: "데나무 팀 블로그",
      blogPlatform: "tistory",
      blogImage: null,
      feedCount: 34,
      lastPublishedAt: null,
    },
    {
      id: 3,
      name: "denamu-devlog",
      blogPlatform: "github",
      blogImage: null,
      feedCount: 5,
      lastPublishedAt: "2025-03-02T00:00:00.000Z",
    },
    {
      id: 4,
      name: "우리팀 기술 블로그",
      blogPlatform: "medium",
      blogImage: null,
      feedCount: 21,
      lastPublishedAt: "2025-02-20T00:00:00.000Z",
    },
  ],
};

export const WithData: Story = {
  name: "RSS 목록 있음",
  beforeEach: () => {
    mockApi.onGet(BLOG.RSS.ALL).reply(...ok(rssListData));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("seok3765.log")).toBeInTheDocument();
    await expect(canvas.getByText("데나무 팀 블로그")).toBeInTheDocument();
    await expect(canvas.getByText("denamu-devlog")).toBeInTheDocument();
    await expect(canvas.getByText("우리팀 기술 블로그")).toBeInTheDocument();
  },
};

export const FilterFlow: Story = {
  name: "플랫폼 필터링",
  beforeEach: () => {
    mockApi.onGet(BLOG.RSS.ALL).replyOnce(...ok(rssListData));
    mockApi.onGet(BLOG.RSS.ALL).reply(
      ...ok({
        totalCount: 1,
        totalPages: 1,
        result: [rssListData.result[0]],
      })
    );
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByText("데나무 팀 블로그")).toBeInTheDocument();

    await userEvent.click(await body.findByRole("combobox"));
    await userEvent.click(await body.findByRole("option", { name: /Velog/ }));

    await waitFor(() => expect(body.queryByText("데나무 팀 블로그")).not.toBeInTheDocument());
    await expect(body.getByText("seok3765.log")).toBeInTheDocument();
  },
};

export const Empty: Story = {
  name: "등록된 RSS 없음",
  beforeEach: () => {
    mockApi.onGet(BLOG.RSS.ALL).reply(...ok({ totalCount: 0, totalPages: 0, result: [] }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("등록된 RSS가 없습니다.")).toBeInTheDocument();
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(BLOG.RSS.ALL).reply(...fail());
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("RSS 목록을 불러오지 못했습니다.")).toBeInTheDocument();
  },
};
