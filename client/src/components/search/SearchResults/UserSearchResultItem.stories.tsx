import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import UserSearchResultItem from "@/components/search/SearchResults/UserSearchResultItem";
import { Command } from "@/components/ui/command";
import { mockUserSearchResult } from "@/__storybook__/fixtures";

const meta = {
  title: "search/SearchResults/UserSearchResultItem",
  component: UserSearchResultItem,
  decorators: [
    (Story) => (
      <Command>
        <Story />
      </Command>
    ),
  ],
  args: { ...mockUserSearchResult, onSelect: fn() },
} satisfies Meta<typeof UserSearchResultItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
