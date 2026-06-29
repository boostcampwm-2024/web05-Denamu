import type { Meta, StoryObj } from "@storybook/react-vite";

import { Alert } from "@/components/ui/alert";

const meta = {
  title: "ui/Alert",
  component: Alert,
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
