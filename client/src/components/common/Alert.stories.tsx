import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import Alert from "@/components/common/Alert";

const meta = {
  title: "common/Alert",
  component: Alert,
  args: { alertOpen: { isOpen: true, title: "알림", content: "내용입니다." }, onClose: fn() },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
