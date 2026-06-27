import type { Meta, StoryObj } from "@storybook/react-vite";

import { RssRequestSearchBar } from "@/components/admin/rss/RssSearchBar";

const meta = {
  title: "admin/rss/RssRequestSearchBar",
  component: RssRequestSearchBar,
} satisfies Meta<typeof RssRequestSearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
