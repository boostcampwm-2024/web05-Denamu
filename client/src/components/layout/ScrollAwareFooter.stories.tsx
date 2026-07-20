import type { Meta, StoryObj } from "@storybook/react-vite";

import ScrollAwareFooter from "@/components/layout/ScrollAwareFooter";

const meta = {
  title: "layout/ScrollAwareFooter",
  component: ScrollAwareFooter,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ScrollAwareFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
