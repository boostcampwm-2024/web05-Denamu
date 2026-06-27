import type { Meta, StoryObj } from "@storybook/react-vite";

import SearchHigilight from "@/components/search/SearchHigilight";

const meta = {
  title: "search/SearchHigilight",
  component: SearchHigilight,
  args: { text: "React Storybook 컴포넌트 가이드", highlight: "Storybook" },
} satisfies Meta<typeof SearchHigilight>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
