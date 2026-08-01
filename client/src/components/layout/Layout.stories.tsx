import type { Meta, StoryObj } from "@storybook/react-vite";

import Layout from "@/components/layout/Layout";

const meta = {
  title: "layout/Layout",
  component: Layout,
  args: { children: "레이아웃 콘텐츠" },
} satisfies Meta<typeof Layout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
