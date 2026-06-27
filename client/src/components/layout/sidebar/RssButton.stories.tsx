import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { RssButton } from "@/components/layout/sidebar/RssButton";

const meta = {
  title: "layout/sidebar/RssButton",
  component: RssButton,
  args: { onRssClick: fn(), onAction: fn() },
} satisfies Meta<typeof RssButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
