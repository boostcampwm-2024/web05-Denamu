import type { Meta, StoryObj } from "@storybook/react-vite";

import { BlockedFeedNotice } from "@/components/common/Card/detail/BlockedFeedNotice";

const meta = {
  title: "common/Card/detail/BlockedFeedNotice",
  component: BlockedFeedNotice,
} satisfies Meta<typeof BlockedFeedNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "기본",
};
