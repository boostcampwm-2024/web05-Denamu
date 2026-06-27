import type { Meta, StoryObj } from "@storybook/react-vite";

import SearchPages from "@/components/search/searchPages/SearchPages";

const meta = {
  title: "search/searchPages/SearchPages",
  component: SearchPages,
  args: { totalPages: 5 },
} satisfies Meta<typeof SearchPages>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
