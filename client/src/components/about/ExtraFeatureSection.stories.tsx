import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExtraFeatureSection } from "@/components/about/ExtraFeatureSection";

const meta = {
  title: "about/ExtraFeatureSection",
  component: ExtraFeatureSection,
} satisfies Meta<typeof ExtraFeatureSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
