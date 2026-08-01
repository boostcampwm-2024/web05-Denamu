import type { Meta, StoryObj } from "@storybook/react-vite";

import { Stats } from "@/components/profile/header/ui/Stats";

const meta = {
  title: "profile/header/ui/Stats",
  component: Stats,
  args: { totalPosts: 42, totalViews: 9999, topicsCount: 8 },
} satisfies Meta<typeof Stats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
