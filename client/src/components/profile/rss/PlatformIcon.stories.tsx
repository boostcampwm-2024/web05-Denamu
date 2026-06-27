import type { Meta, StoryObj } from "@storybook/react-vite";

import { PlatformIcon } from "@/components/profile/rss/PlatformIcon";

const meta = {
  title: "profile/rss/PlatformIcon",
  component: PlatformIcon,
  args: { platform: "tistory" },
} satisfies Meta<typeof PlatformIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
