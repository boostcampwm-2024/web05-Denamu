import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton } from "@/components/ui/skeleton";

const meta = {
  title: "ui/Skeleton",
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
