import type { Meta, StoryObj } from "@storybook/react-vite";

import { AuthCard } from "@/components/auth/AuthCard";

const meta = {
  title: "auth/AuthCard",
  component: AuthCard,
  args: { title: "인증", description: "설명 텍스트", children: "카드 내용" },
} satisfies Meta<typeof AuthCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
