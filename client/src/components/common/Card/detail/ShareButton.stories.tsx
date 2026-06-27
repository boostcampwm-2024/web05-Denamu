import type { Meta, StoryObj } from "@storybook/react-vite";

import ShareButton from "@/components/common/Card/detail/ShareButton";
import { mockFeedDetail } from "@/__storybook__/fixtures";

const meta = {
  title: "common/Card/detail/ShareButton",
  component: ShareButton,
  args: { post: mockFeedDetail },
} satisfies Meta<typeof ShareButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
