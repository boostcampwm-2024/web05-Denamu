import type { Meta, StoryObj } from "@storybook/react-vite";

import { LoadingIndicator } from "@/components/common/LoadingIndicator";

const meta = {
  title: "common/LoadingIndicator",
  component: LoadingIndicator,
} satisfies Meta<typeof LoadingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
