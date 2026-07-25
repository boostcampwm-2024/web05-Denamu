import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import RssSearchResultList from "@/components/search/SearchResults/RssSearchResultList";
import { Command } from "@/components/ui/command";

const meta = {
  title: "search/SearchResults/RssSearchResultList",
  component: RssSearchResultList,
  decorators: [
    (Story) => (
      <Command>
        <Story />
      </Command>
    ),
  ],
  args: { onClose: fn() },
} satisfies Meta<typeof RssSearchResultList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
