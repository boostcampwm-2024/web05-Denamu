import type { Meta, StoryObj } from "@storybook/react-vite";

import PostTag from "@/components/common/Card/PostTag";

const meta = {
  title: "common/Card/PostTag",
  component: PostTag,
  args: { tags: ["React", "TypeScript", "Storybook", "Vite"] },
} satisfies Meta<typeof PostTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
