import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import SearchButton from "@/components/search/SearchButton";

const meta = {
  title: "search/SearchButton",
  component: SearchButton,
  args: { handleSearchModal: fn() },
} satisfies Meta<typeof SearchButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
