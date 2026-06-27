import type { Meta, StoryObj } from "@storybook/react-vite";

import SplitLayout from "@/components/layout/SplitLayout";

const meta = {
  title: "layout/SplitLayout",
  component: SplitLayout,
  args: { children: "콘텐츠" },
} satisfies Meta<typeof SplitLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
