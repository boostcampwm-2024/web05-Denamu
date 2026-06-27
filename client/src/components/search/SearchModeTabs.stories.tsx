import type { Meta, StoryObj } from "@storybook/react-vite";

import SearchModeTabs from "@/components/search/SearchModeTabs";

const meta = {
  title: "search/SearchModeTabs",
  component: SearchModeTabs,
} satisfies Meta<typeof SearchModeTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
