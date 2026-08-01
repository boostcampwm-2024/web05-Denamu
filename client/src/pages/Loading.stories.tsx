import type { Meta, StoryObj } from "@storybook/react-vite";

import Loading from "@/pages/Loading";

const meta = {
  title: "pages/Loading",
  component: Loading,
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
