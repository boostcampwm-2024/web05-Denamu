import type { Meta, StoryObj } from "@storybook/react-vite";

import { Legend } from "@/components/profile/header/ui/ActivityGraph/Legend";

const meta = {
  title: "profile/header/ui/ActivityGraph/Legend",
  component: Legend,
} satisfies Meta<typeof Legend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
