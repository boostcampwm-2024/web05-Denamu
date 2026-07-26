import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { BLOCK, PROFILE, REPORT } from "@/constants/endpoints";
import { mockApi, ok } from "@/__storybook__/mockApi";

const ownedRss = [
  { id: 10, name: "seok3765.log", userName: "홍길동", rssUrl: "https://velog.io/@seok3765", blogPlatform: "velog", feedCount: 12, subscriberCount: 3, isSubscribed: false },
  { id: 20, name: "hong.tistory", userName: "홍길동", rssUrl: "https://hong.tistory.com/rss", blogPlatform: "tistory", feedCount: 5, subscriberCount: 1, isSubscribed: false },
];

const meta = {
  title: "profile/ProfileHeader",
  component: ProfileHeader,
  args: { name: "홍길동", email: "test@test.com", profileImage: null, introduction: null },
} satisfies Meta<typeof ProfileHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OtherUser: Story = {
  name: "타인 프로필 (차단 메뉴 노출)",
  args: { email: "", blockableUserId: 2 },
};

export const BlockFlow: Story = {
  name: "차단 플로우 (RSS 함께 차단)",
  args: { email: "", blockableUserId: 2 },
  beforeEach: () => {
    mockApi.onGet(PROFILE.RSS(2)).reply(...ok(ownedRss));
    mockApi.onPost(BLOCK.MANAGE(2)).reply(...ok(null));
    mockApi.onPost(BLOCK.RSS_MANAGE(10)).reply(...ok(null));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "더보기" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "차단하기" }, { timeout: 5000 }));
    await expect(await body.findByText("홍길동 유저를 차단하시겠습니까?", undefined, { timeout: 5000 })).toBeInTheDocument();
    await userEvent.click(await body.findByRole("switch", { name: "seok3765.log 차단" }, { timeout: 5000 }));
    await userEvent.click(body.getByRole("button", { name: "차단" }));

    await waitFor(() => expect(mockApi.history.post).toHaveLength(2));
  },
};

export const ReportFlow: Story = {
  name: "신고 플로우",
  args: { email: "", blockableUserId: 2 },
  beforeEach: () => {
    mockApi.onGet(PROFILE.RSS(2)).reply(...ok(ownedRss));
    mockApi.onPost(REPORT.USER(2)).reply(...ok(null));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "더보기" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "신고하기" }, { timeout: 5000 }));
    await userEvent.click(await body.findByRole("combobox"));
    await userEvent.click(await body.findByRole("option", { name: "욕설/혐오 표현" }));
    await userEvent.click(await body.findByRole("button", { name: "신고하기" }));

    await waitFor(() => expect(mockApi.history.post).toHaveLength(1));
  },
};

export const BlockCancel: Story = {
  name: "차단 취소",
  args: { email: "", blockableUserId: 2 },
  beforeEach: () => {
    mockApi.onGet(PROFILE.RSS(2)).reply(...ok(ownedRss));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "더보기" }));
    await userEvent.click(await body.findByRole("menuitem", { name: "차단하기" }, { timeout: 5000 }));
    await userEvent.click(await body.findByRole("button", { name: "취소" }, { timeout: 5000 }));

    await waitFor(() => expect(body.queryByText("홍길동 유저를 차단하시겠습니까?")).not.toBeInTheDocument());
    await expect(mockApi.history.post).toHaveLength(0);
  },
};
