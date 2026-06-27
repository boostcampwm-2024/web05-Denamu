import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import DesktopNavigation from "@/components/layout/navigation/DesktopNavigation";

const meta = {
  title: "layout/navigation/DesktopNavigation",
  component: DesktopNavigation,
  args: { toggleModal: fn() },
} satisfies Meta<typeof DesktopNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
