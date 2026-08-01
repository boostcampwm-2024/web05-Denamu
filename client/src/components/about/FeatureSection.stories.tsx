import type { Meta, StoryObj } from "@storybook/react-vite";

import { FeatureSection } from "@/components/about/FeatureSection";

const meta = {
  title: "about/FeatureSection",
  component: FeatureSection,
} satisfies Meta<typeof FeatureSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
