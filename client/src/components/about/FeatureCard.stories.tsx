import type { Meta, StoryObj } from "@storybook/react-vite";

import { FeatureCard } from "@/components/about/FeatureCard";
import { mockFeatureItem } from "@/__storybook__/fixtures";

const meta = {
  title: "about/FeatureCard",
  component: FeatureCard,
  args: { feature: mockFeatureItem },
} satisfies Meta<typeof FeatureCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
