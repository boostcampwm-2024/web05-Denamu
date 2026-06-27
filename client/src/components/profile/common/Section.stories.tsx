import type { Meta, StoryObj } from "@storybook/react-vite";

import { Section } from "@/components/profile/common/Section";

const meta = {
  title: "profile/common/Section",
  component: Section,
  args: { title: "섹션 제목" },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
