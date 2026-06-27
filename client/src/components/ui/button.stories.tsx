import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";

const meta = {
  title: "ui/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Button",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
