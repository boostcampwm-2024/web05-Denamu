import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { AuthSection } from "@/components/layout/sidebar/AuthSection";

const meta = {
  title: "layout/sidebar/AuthSection",
  component: AuthSection,
  args: { onAction: fn() },
} satisfies Meta<typeof AuthSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
