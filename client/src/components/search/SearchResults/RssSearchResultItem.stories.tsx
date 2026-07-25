import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import RssSearchResultItem from "@/components/search/SearchResults/RssSearchResultItem";
import { Command } from "@/components/ui/command";
import { mockRssSearchResult } from "@/__storybook__/fixtures";

const meta = {
  title: "search/SearchResults/RssSearchResultItem",
  component: RssSearchResultItem,
  decorators: [
    (Story) => (
      <Command>
        <Story />
      </Command>
    ),
  ],
  args: { ...mockRssSearchResult, onSelect: fn() },
} satisfies Meta<typeof RssSearchResultItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
