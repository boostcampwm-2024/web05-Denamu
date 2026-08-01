import type { Meta, StoryObj } from "@storybook/react-vite";

import NotFound from "@/pages/NotFound";

const meta = {
  title: "pages/NotFound",
  component: NotFound,
} satisfies Meta<typeof NotFound>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
