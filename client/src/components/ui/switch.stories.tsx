import type { Meta, StoryObj } from "@storybook/react-vite";

import { Switch } from "@/components/ui/switch";

const meta = {
  title: "ui/Switch",
  component: Switch,
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
