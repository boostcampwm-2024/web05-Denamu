import type { Meta, StoryObj } from "@storybook/react-vite";

import { UserProfileMenu } from "@/components/common/UserProfileMenu";

const meta = {
  title: "common/UserProfileMenu",
  component: UserProfileMenu,
} satisfies Meta<typeof UserProfileMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
