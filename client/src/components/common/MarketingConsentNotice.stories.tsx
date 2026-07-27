import type { Meta, StoryObj } from "@storybook/react-vite";

import { MarketingConsentNotice } from "@/components/common/MarketingConsentNotice";

const meta = {
  title: "common/MarketingConsentNotice",
  component: MarketingConsentNotice,
  args: { showChangeGuide: true },
} satisfies Meta<typeof MarketingConsentNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutChangeGuide: Story = {
  args: { showChangeGuide: false },
};
