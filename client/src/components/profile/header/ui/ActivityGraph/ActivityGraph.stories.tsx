import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { ActivityGraph } from "@/components/profile/header/ui/ActivityGraph/ActivityGraph";
import { mockDailyActivities } from "@/__storybook__/fixtures";

const meta = {
  title: "profile/header/ui/ActivityGraph/ActivityGraph",
  component: ActivityGraph,
  args: { dailyActivities: mockDailyActivities, year: 2026, years: [2025, 2026], onYearChange: fn() },
} satisfies Meta<typeof ActivityGraph>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
