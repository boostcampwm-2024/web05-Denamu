import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { FixedHeader } from "@/components/common/Card/detail/FixedHeader";

const meta = {
  title: "common/Card/detail/FixedHeader",
  component: FixedHeader,
  args: { title: "게시글 제목", onClose: fn(), scrollbarWidth: 0 },
} satisfies Meta<typeof FixedHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
