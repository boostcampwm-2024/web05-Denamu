import type { Meta, StoryObj } from "@storybook/react-vite";

import { LazyImage } from "@/components/common/LazyImage";

const meta = {
  title: "common/LazyImage",
  component: LazyImage,
  args: { src: "https://picsum.photos/200/150", alt: "이미지" },
} satisfies Meta<typeof LazyImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
