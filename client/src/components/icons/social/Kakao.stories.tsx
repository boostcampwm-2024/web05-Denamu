import type { Meta, StoryObj } from "@storybook/react-vite";

import { Kakao } from "@/components/icons/social/Kakao";

const meta = {
  title: "icons/social/Kakao",
  component: Kakao,
} satisfies Meta<typeof Kakao>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
