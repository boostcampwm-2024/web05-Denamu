import type { Meta, StoryObj } from "@storybook/react-vite";

import { CertifiedRssCard } from "@/components/profile/rss/CertifiedRssCard";
import { mockCertifiedRss } from "@/__storybook__/fixtures";

const meta = {
  title: "profile/rss/CertifiedRssCard",
  component: CertifiedRssCard,
  args: { userId: 1, rss: mockCertifiedRss, isOwner: false },
} satisfies Meta<typeof CertifiedRssCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Owner: Story = {
  name: "본인 소유 (구독 버튼 숨김)",
  args: { isOwner: true },
};
