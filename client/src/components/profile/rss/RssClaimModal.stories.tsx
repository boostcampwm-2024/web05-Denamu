import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { RssClaimModal } from "@/components/profile/rss/RssClaimModal";
import { BLOG } from "@/constants/endpoints";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";

const meta = {
  title: "profile/rss/RssClaimModal",
  component: RssClaimModal,
  args: { open: true, onClose: fn(), userId: 1 },
} satisfies Meta<typeof RssClaimModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "입력 단계 (즉시 등록)",
  beforeEach: () => {
    mockApi.onGet(BLOG.RSS.CERTIFICATION_PREVIEW).reply(...ok({
      name: "데나무 블로그",
      userName: "조민석",
      rssUrl: "https://denamu.dev/rss",
      blogPlatform: "tistory",
      requiresEmailVerification: false,
    }));
    mockApi.onPost(BLOG.RSS.CERTIFICATION).reply(...ok({ certified: true, certificationId: 1 }));
    mockApi.onPost(BLOG.RSS.CERTIFICATION_VERIFY).reply(...ok({ message: "인증되었습니다." }));
  },
};

export const RegisterFlow: Story = {
  name: "조회 → 확인 → 등록",
  beforeEach: () => {
    mockApi.onGet(BLOG.RSS.CERTIFICATION_PREVIEW).reply(...ok({
      name: "데나무 블로그",
      userName: "조민석",
      rssUrl: "https://denamu.dev/rss",
      blogPlatform: "tistory",
      requiresEmailVerification: false,
    }));
    mockApi.onPost(BLOG.RSS.CERTIFICATION).reply(...ok({ certified: true, certificationId: 1 }));
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.type(await body.findByLabelText("블로그 이름"), "데나무 블로그");
    await userEvent.click(body.getByRole("button", { name: "확인" }));
    await body.findByText("RSS 정보 확인");
    await userEvent.click(body.getByRole("button", { name: "확인" }));
    // 미리보기는 GET, 등록은 POST(CERTIFICATION) 1건.
    await expect(mockApi.history.post.length).toBeGreaterThanOrEqual(1);
  },
};

export const WithEmailVerification: Story = {
  name: "입력 단계 (이메일 인증 필요)",
  beforeEach: () => {
    mockApi.onGet(BLOG.RSS.CERTIFICATION_PREVIEW).reply(...ok({
      name: "데나무 블로그",
      userName: "조민석",
      rssUrl: "https://denamu.dev/rss",
      blogPlatform: "tistory",
      requiresEmailVerification: true,
    }));
    mockApi.onPost(BLOG.RSS.CERTIFICATION).reply(...ok({ certified: false, certificationId: 1 }));
    mockApi.onPost(BLOG.RSS.CERTIFICATION_VERIFY).reply(...ok({ message: "인증되었습니다." }));
  },
};

export const PreviewError: Story = {
  name: "블로그 조회 실패",
  beforeEach: () => {
    mockApi.onGet(BLOG.RSS.CERTIFICATION_PREVIEW).reply(...fail(404, "등록된 블로그를 찾을 수 없습니다."));
  },
};

export const Closed: Story = {
  name: "닫힌 상태",
  args: { open: false },
};
