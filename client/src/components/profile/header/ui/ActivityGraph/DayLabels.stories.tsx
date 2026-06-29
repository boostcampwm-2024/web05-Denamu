import type { Meta, StoryObj } from "@storybook/react-vite";

import { DayLabels } from "@/components/profile/header/ui/ActivityGraph/DayLabels";

const meta = {
  title: "profile/header/ui/ActivityGraph/DayLabels",
  component: DayLabels,
} satisfies Meta<typeof DayLabels>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
