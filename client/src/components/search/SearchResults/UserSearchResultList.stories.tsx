import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import UserSearchResultList from "@/components/search/SearchResults/UserSearchResultList";
import { Command } from "@/components/ui/command";

const meta = {
  title: "search/SearchResults/UserSearchResultList",
  component: UserSearchResultList,
  decorators: [
    (Story) => (
      <Command>
        <Story />
      </Command>
    ),
  ],
  args: { onClose: fn() },
} satisfies Meta<typeof UserSearchResultList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
