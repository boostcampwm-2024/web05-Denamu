import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { NavigationButtons } from "@/components/layout/sidebar/NavigationButtons";

const meta = {
  title: "layout/sidebar/NavigationButtons",
  component: NavigationButtons,
  args: { onAction: fn() },
} satisfies Meta<typeof NavigationButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
