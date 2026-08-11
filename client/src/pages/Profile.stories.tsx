import Profile from "@/pages/Profile";

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
import { useAuthStore } from "@/store/useAuthStore";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "pages/Profile",
  component: Profile,
} satisfies Meta<typeof Profile>;

export default meta;
type Story = StoryObj<typeof meta>;

const setupProfileApi = (userId: number) => {
  mockApi.onGet(PROFILE.PROFILE(userId)).reply(...ok(mockUserProfile));
  mockApi.onGet(PROFILE.ACTIVITIES(userId)).reply(...ok(mockProfileActivity));
  mockApi.onGet(PROFILE.ACTIVITY_YEARS(userId)).reply(...ok(mockActivityYears));
  mockApi.onGet(PROFILE.RSS(userId)).reply(...ok([mockCertifiedRss]));
  mockApi.onGet(SUBSCRIPTION.BY_USER(userId)).reply(...ok(mockSubscribedRss));
  mockApi.onGet(PROFILE.LIKES(userId)).reply(...ok(mockLikedItemsPage));
  mockApi.onGet(PROFILE.COMMENTS(userId)).reply(...ok(mockCommentItemsPage));
};

const resetAuth = () => {
  useAuthStore.setState({
    isAuthenticated: false,
    role: "guest",
    userInfo: { id: null, email: null, userName: null },
  });
};

export const Owner: Story = {
  name: "내 계정",
  beforeEach: () => {
    useAuthStore.setState({
      isInitialized: true,
      isAuthenticated: true,
      role: "user",
      userInfo: { id: 1, email: "test@test.com", userName: "홍길동" },
    });
    setupProfileApi(1);
    return resetAuth;
  },
};

export const Suspended: Story = {
  name: "정지된 계정 방문",
  parameters: {
    router: { initialEntries: ["/profile/2"], path: "/profile/:id" },
  },
  beforeEach: () => {
    useAuthStore.setState({
      isInitialized: true,
      isAuthenticated: true,
      role: "user",
      userInfo: { id: 1, email: "test@test.com", userName: "홍길동" },
    });
    mockApi.onGet(PROFILE.PROFILE(2)).reply(...fail(403, "정지 처리된 유저입니다."));
    return resetAuth;
  },
};

export const Visitor: Story = {
  name: "다른 사람 계정",
  parameters: {
    router: { initialEntries: ["/profile/2"], path: "/profile/:id" },
  },
  beforeEach: () => {
    useAuthStore.setState({
      isInitialized: true,
      isAuthenticated: true,
      role: "user",
      userInfo: { id: 1, email: "test@test.com", userName: "홍길동" },
    });
    setupProfileApi(2);
    return resetAuth;
  },
};
