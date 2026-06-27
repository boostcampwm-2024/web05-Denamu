import type { Meta, StoryObj } from "@storybook/react-vite";
import { Flame } from "lucide-react";

import { SectionHeader } from "@/components/common/SectionHeader";

const meta = {
  title: "common/SectionHeader",
  component: SectionHeader,
  args: { icon: Flame, text: "섹션 제목", iconColor: "#ff6b6b", description: "섹션 설명" },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
