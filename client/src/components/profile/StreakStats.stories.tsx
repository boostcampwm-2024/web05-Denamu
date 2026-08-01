import type { Meta, StoryObj } from "@storybook/react-vite";

import { StreakStats } from "@/components/profile/StreakStats";

const meta = {
  title: "profile/StreakStats",
  component: StreakStats,
  args: { maxStreak: 30, currentStreak: 7, totalViews: 12345 },
} satisfies Meta<typeof StreakStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
