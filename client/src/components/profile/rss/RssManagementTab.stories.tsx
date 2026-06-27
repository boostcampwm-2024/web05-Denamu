import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { RssManagementTab } from "@/components/profile/rss/RssManagementTab";
import { BLOG, PROFILE } from "@/constants/endpoints";
import { mockCertifiedRss } from "@/__storybook__/fixtures";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";

const meta = {
  title: "profile/rss/RssManagementTab",
  component: RssManagementTab,
  args: { userId: 1 },
} satisfies Meta<typeof RssManagementTab>;

export default meta;
type Story = StoryObj<typeof meta>;

const setupMutations = () => {
  mockApi.onDelete(/\/api\/rss\/certifications\/\d+/).reply(...ok({ message: "해제되었습니다." }));
  mockApi.onPatch(/\/api\/rss\/certifications\/\d+/).reply(...ok({ message: "수정되었습니다." }));
  mockApi.onPost(BLOG.RSS.CERTIFICATION).reply(...ok({ certified: true, certificationId: 1 }));
  mockApi.onGet(BLOG.RSS.CERTIFICATION_PREVIEW).reply(...ok({
    name: "데나무 블로그",
    userName: "조민석",
    rssUrl: "https://denamu.dev/rss",
    blogPlatform: "tistory",
    requiresEmailVerification: false,
  }));
  mockApi.onPost(BLOG.RSS.CERTIFICATION_VERIFY).reply(...ok({ message: "인증되었습니다." }));
};

export const WithRss: Story = {
  name: "RSS 있음",
  beforeEach: () => {
    mockApi.onGet(PROFILE.RSS(1)).reply(...ok([mockCertifiedRss]));
    setupMutations();
  },
};

export const SaveEdit: Story = {
  name: "RSS 정보 수정 → 저장",
  beforeEach: () => {
    mockApi.onGet(PROFILE.RSS(1)).reply(...ok([mockCertifiedRss]));
    setupMutations();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await canvas.findByLabelText("RSS 정보 수정"));
    await userEvent.click(await body.findByRole("button", { name: "저장" }));
    await expect(mockApi.history.patch).toHaveLength(1);
  },
};

export const MultipleRss: Story = {
  name: "RSS 여러 개",
  beforeEach: () => {
    mockApi.onGet(PROFILE.RSS(1)).reply(...ok([
      mockCertifiedRss,
      { ...mockCertifiedRss, id: 2, name: "두 번째 블로그", rssUrl: "https://velog.io/@user/rss", blogPlatform: "velog", feedCount: 12 },
    ]));
    setupMutations();
  },
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(PROFILE.RSS(1)).reply(() => new Promise(() => {}));
  },
};

export const Empty: Story = {
  name: "RSS 없음",
  beforeEach: () => {
    mockApi.onGet(PROFILE.RSS(1)).reply(...ok([]));
    setupMutations();
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(PROFILE.RSS(1)).reply(...fail());
  },
};
