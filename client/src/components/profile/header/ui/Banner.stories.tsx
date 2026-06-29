import type { Meta, StoryObj } from "@storybook/react-vite";

import { Banner } from "@/components/profile/header/ui/Banner";

const meta = {
  title: "profile/header/ui/Banner",
  component: Banner,
  args: { lastPosted: "2024-01-15" },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
