import type { Meta, StoryObj } from "@storybook/react-vite";

import { Toggle } from "@/components/ui/toggle";

const meta = {
  title: "ui/Toggle",
  component: Toggle,
  args: { children: "토글" },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pressed: Story = {
  name: "활성화됨",
  args: { pressed: true, children: "토글 활성화" },
};

export const Disabled: Story = {
  name: "비활성화됨",
  args: { disabled: true, children: "비활성화" },
};
