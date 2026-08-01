import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { OwnedRssCard } from "@/components/profile/rss/OwnedRssCard";
import { mockCertifiedRss } from "@/__storybook__/fixtures";

const meta = {
  title: "profile/rss/OwnedRssCard",
  component: OwnedRssCard,
  args: { rss: mockCertifiedRss, onEdit: fn(), onDelete: fn() },
} satisfies Meta<typeof OwnedRssCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
