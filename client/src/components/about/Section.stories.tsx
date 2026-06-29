import type { Meta, StoryObj } from "@storybook/react-vite";

import { Section } from "@/components/about/Section";

const meta = {
  title: "about/Section",
  component: Section,
  args: { children: "Section 콘텐츠" },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
