import type { Meta, StoryObj } from "@storybook/react-vite";

import { Week } from "@/components/profile/header/ui/ActivityGraph/Week";
import { TooltipProvider } from "@/components/ui/tooltip";
import { mockWeekInfo } from "@/__storybook__/fixtures";

const meta = {
  title: "profile/header/ui/ActivityGraph/Week",
  component: Week,
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  args: { weekInfo: mockWeekInfo },
} satisfies Meta<typeof Week>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
