import type { ComponentProps } from "react";

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

type SuspensionArgs = ComponentProps<typeof OwnedRssCard> & { suspensionCount: number };

export const SuspensionCountControl: StoryObj<SuspensionArgs> = {
  name: "정지 횟수 컨트롤",
  args: { ...meta.args, suspensionCount: mockCertifiedRss.suspensionCount },
  argTypes: {
    suspensionCount: { control: { type: "number", min: 0 }, name: "정지 횟수" },
  },
  render: ({ rss, suspensionCount, onEdit, onDelete }) => (
    <OwnedRssCard rss={{ ...rss, suspensionCount }} onEdit={onEdit} onDelete={onDelete} />
  ),
};
