import type { Meta, StoryObj } from "@storybook/react-vite";

import { Label } from "@/components/ui/label";

const meta = {
  title: "ui/Label",
  component: Label,
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
