import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProfileHeader } from "@/components/profile/ProfileHeader";

const meta = {
  title: "profile/ProfileHeader",
  component: ProfileHeader,
  args: { name: "홍길동", email: "test@test.com", profileImage: null, introduction: null },
} satisfies Meta<typeof ProfileHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
