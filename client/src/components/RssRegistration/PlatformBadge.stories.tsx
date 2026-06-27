import type { Meta, StoryObj } from "@storybook/react-vite";

import { PlatformBadge } from "@/components/RssRegistration/PlatformBadge";

const meta = {
  title: "RssRegistration/PlatformBadge",
  component: PlatformBadge,
  args: { platform: "tistory" },
} satisfies Meta<typeof PlatformBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
