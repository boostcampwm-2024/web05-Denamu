import type { ComponentProps } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { MyPage } from "@/components/profile/MyPage";
import { PROFILE, SUBSCRIPTION } from "@/constants/endpoints";
import {
  mockUserProfile,
  mockProfileActivity,
  mockActivityYears,
  mockCertifiedRss,
  mockLikedItemsPage,
  mockCommentItemsPage,
  mockSubscribedRss,
} from "@/__storybook__/fixtures";
import { mockApi, ok, fail } from "@/__storybook__/mockApi";

const meta = {
  title: "profile/MyPage",
  component: MyPage,
  args: { userId: 1, name: "홍길동", email: "test@test.com", isOwner: true },
} satisfies Meta<typeof MyPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const setupSuccess = () => {
  mockApi.onGet(PROFILE.PROFILE(1)).reply(...ok(mockUserProfile));
  mockApi.onGet(PROFILE.ACTIVITIES(1)).reply(...ok(mockProfileActivity));
  mockApi.onGet(PROFILE.ACTIVITY_YEARS(1)).reply(...ok(mockActivityYears));
  mockApi.onGet(PROFILE.RSS(1)).reply(...ok([mockCertifiedRss]));
  mockApi.onGet(SUBSCRIPTION.BY_USER(1)).reply(...ok(mockSubscribedRss));
  mockApi.onGet(PROFILE.LIKES(1)).reply(...ok(mockLikedItemsPage));
  mockApi.onGet(PROFILE.COMMENTS(1)).reply(...ok(mockCommentItemsPage));
};

export const WithData: Story = {
  name: "데이터 있음",
  beforeEach: setupSuccess,
};

export const NoActivities: Story = {
  name: "활동 없음",
  beforeEach: () => {
    mockApi.onGet(PROFILE.PROFILE(1)).reply(...ok(mockUserProfile));
    mockApi.onGet(PROFILE.ACTIVITIES(1)).reply(...ok({ dailyActivities: [] }));
    mockApi.onGet(PROFILE.ACTIVITY_YEARS(1)).reply(...ok([2026]));
    mockApi.onGet(PROFILE.RSS(1)).reply(...ok([]));
    mockApi.onGet(SUBSCRIPTION.BY_USER(1)).reply(...ok([]));
    mockApi.onGet(PROFILE.LIKES(1)).reply(...ok({ result: [], lastId: 0, hasMore: false }));
    mockApi.onGet(PROFILE.COMMENTS(1)).reply(...ok({ result: [], lastId: 0, hasMore: false }));
  },
};

export const NoProfileImage: Story = {
  name: "프로필 이미지 없음",
  beforeEach: () => {
    mockApi.onGet(PROFILE.PROFILE(1)).reply(...ok({ ...mockUserProfile, profileImage: null, introduction: null }));
    mockApi.onGet(PROFILE.ACTIVITIES(1)).reply(...ok(mockProfileActivity));
    mockApi.onGet(PROFILE.ACTIVITY_YEARS(1)).reply(...ok(mockActivityYears));
    mockApi.onGet(PROFILE.RSS(1)).reply(...ok([mockCertifiedRss]));
    mockApi.onGet(SUBSCRIPTION.BY_USER(1)).reply(...ok(mockSubscribedRss));
    mockApi.onGet(PROFILE.LIKES(1)).reply(...ok(mockLikedItemsPage));
    mockApi.onGet(PROFILE.COMMENTS(1)).reply(...ok(mockCommentItemsPage));
  },
};

export const Loading: Story = {
  name: "로딩 중",
  beforeEach: () => {
    mockApi.onGet(PROFILE.PROFILE(1)).reply(() => new Promise(() => {}));
    mockApi.onGet(PROFILE.ACTIVITIES(1)).reply(() => new Promise(() => {}));
    mockApi.onGet(PROFILE.ACTIVITY_YEARS(1)).reply(() => new Promise(() => {}));
    mockApi.onGet(PROFILE.RSS(1)).reply(() => new Promise(() => {}));
    mockApi.onGet(SUBSCRIPTION.BY_USER(1)).reply(() => new Promise(() => {}));
    mockApi.onGet(PROFILE.LIKES(1)).reply(() => new Promise(() => {}));
    mockApi.onGet(PROFILE.COMMENTS(1)).reply(() => new Promise(() => {}));
  },
};

export const Error: Story = {
  name: "오류",
  beforeEach: () => {
    mockApi.onGet(PROFILE.PROFILE(1)).reply(...fail());
    mockApi.onGet(PROFILE.ACTIVITIES(1)).reply(...fail());
    mockApi.onGet(PROFILE.ACTIVITY_YEARS(1)).reply(...fail());
    mockApi.onGet(PROFILE.RSS(1)).reply(...fail());
    mockApi.onGet(SUBSCRIPTION.BY_USER(1)).reply(...fail());
    mockApi.onGet(PROFILE.LIKES(1)).reply(...fail());
    mockApi.onGet(PROFILE.COMMENTS(1)).reply(...fail());
  },
};

type ToggleArgs = ComponentProps<typeof MyPage> & { hasCertifiedRss: boolean };

export const CertifiedRssBadgeToggle: StoryObj<ToggleArgs> = {
  name: "RSS 인증 뱃지 토글",
  args: { userId: 1, name: "홍길동", email: "test@test.com", isOwner: true, hasCertifiedRss: true },
  argTypes: {
    hasCertifiedRss: { control: "boolean", name: "RSS 인증 뱃지 표시" },
  },
  render: ({ userId, name, email, isOwner }) => (
    <MyPage userId={userId} name={name} email={email} isOwner={isOwner} />
  ),
  beforeEach: ({ args }) => {
    const { hasCertifiedRss } = args as ToggleArgs;
    mockApi.onGet(PROFILE.PROFILE(1)).reply(...ok(mockUserProfile));
    mockApi.onGet(PROFILE.ACTIVITIES(1)).reply(...ok(mockProfileActivity));
    mockApi.onGet(PROFILE.ACTIVITY_YEARS(1)).reply(...ok(mockActivityYears));
    mockApi.onGet(PROFILE.RSS(1)).reply(...ok(hasCertifiedRss ? [mockCertifiedRss] : []));
    mockApi.onGet(SUBSCRIPTION.BY_USER(1)).reply(...ok(mockSubscribedRss));
    mockApi.onGet(PROFILE.LIKES(1)).reply(...ok(mockLikedItemsPage));
    mockApi.onGet(PROFILE.COMMENTS(1)).reply(...ok(mockCommentItemsPage));
  },
};
