import type { Meta, StoryObj } from "@storybook/react-vite";

import { RssResponseCard } from "@/components/admin/rss/RssResponseCard";
import { mockAdminRssList } from "@/__storybook__/fixtures";

const meta = {
  title: "admin/rss/RssResponseCard",
  component: RssResponseCard,
  args: { request: mockAdminRssList[0] },
} satisfies Meta<typeof RssResponseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
