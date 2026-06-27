import type { Meta, StoryObj } from "@storybook/react-vite";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const meta = {
  title: "ui/Avatar",
  component: Avatar,
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  name: "이미지 있음",
  render: () => (
    <Avatar>
      <AvatarImage src="https://picsum.photos/seed/avatar/40/40" alt="프로필" />
      <AvatarFallback>조민</AvatarFallback>
    </Avatar>
  ),
};

export const Fallback: Story = {
  name: "이미지 없음 (폴백)",
  render: () => (
    <Avatar>
      <AvatarImage src="invalid-url" alt="프로필" />
      <AvatarFallback>조민</AvatarFallback>
    </Avatar>
  ),
};
