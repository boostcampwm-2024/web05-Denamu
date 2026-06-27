import type { Meta, StoryObj } from "@storybook/react-vite";

import FilterButton from "@/components/search/SearchFilters/FilterButton";
import { Command } from "@/components/ui/command";

const meta = {
  title: "search/SearchFilters/FilterButton",
  component: FilterButton,
  decorators: [
    (Story) => (
        <Command>
        <Story />
        </Command>
    ),
  ],
} satisfies Meta<typeof FilterButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
