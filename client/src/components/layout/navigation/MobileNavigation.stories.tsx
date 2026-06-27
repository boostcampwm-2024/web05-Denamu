import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import MobileNavigation from "@/components/layout/navigation/MobileNavigation";

const meta = {
  title: "layout/navigation/MobileNavigation",
  component: MobileNavigation,
  args: { toggleModal: fn() },
} satisfies Meta<typeof MobileNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
