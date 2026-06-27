import type { Meta, StoryObj } from "@storybook/react-vite";

import SearchResultItem from "@/components/search/SearchResults/SearchResultItem";
import { Command } from "@/components/ui/command";
import { mockSearchResult } from "@/__storybook__/fixtures";

const meta = {
  title: "search/SearchResults/SearchResultItem",
  component: SearchResultItem,
  decorators: [
    (Story) => (
      <Command>
        <Story />
      </Command>
    ),
  ],
  args: { ...mockSearchResult },
} satisfies Meta<typeof SearchResultItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
