import type { Meta, StoryObj } from "@storybook/react-vite";

import { DayCell } from "@/components/profile/header/ui/ActivityGraph/DayCell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { mockDayInfo } from "@/__storybook__/fixtures";

const meta = {
  title: "profile/header/ui/ActivityGraph/DayCell",
  component: DayCell,
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  args: { dayInfo: mockDayInfo },
} satisfies Meta<typeof DayCell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
