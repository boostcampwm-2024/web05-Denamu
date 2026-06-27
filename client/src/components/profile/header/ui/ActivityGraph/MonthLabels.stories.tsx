import type { Meta, StoryObj } from "@storybook/react-vite";

import { MonthLabels } from "@/components/profile/header/ui/ActivityGraph/MonthLabels";
import { mockWeeks } from "@/__storybook__/fixtures";

const meta = {
  title: "profile/header/ui/ActivityGraph/MonthLabels",
  component: MonthLabels,
  args: { weeks: mockWeeks },
} satisfies Meta<typeof MonthLabels>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
