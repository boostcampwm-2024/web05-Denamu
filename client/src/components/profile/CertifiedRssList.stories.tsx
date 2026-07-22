import type { Meta, StoryObj } from "@storybook/react-vite";

import { CertifiedRssList } from "@/components/profile/CertifiedRssList";
import { mockCertifiedRss } from "@/__storybook__/fixtures";

const meta = {
  title: "profile/CertifiedRssList",
  component: CertifiedRssList,
  args: { userId: 1, rssList: [mockCertifiedRss], isOwner: false },
} satisfies Meta<typeof CertifiedRssList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MultipleRss: Story = {
  name: "RSS 여러 개",
  args: {
    rssList: [
      mockCertifiedRss,
      {
        ...mockCertifiedRss,
        id: 2,
        name: "두 번째 블로그",
        rssUrl: "https://velog.io/@user/rss",
        blogPlatform: "velog" as const,
        feedCount: 12,
      },
    ],
  },
};

export const Empty: Story = {
  name: "RSS 없음",
  args: { rssList: [] },
};
