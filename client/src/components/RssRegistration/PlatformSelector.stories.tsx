import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { BlogPlatformSelector } from "@/components/RssRegistration/PlatformSelector";
import { mockPlatforms } from "@/__storybook__/fixtures";

const meta = {
  title: "RssRegistration/BlogPlatformSelector",
  component: BlogPlatformSelector,
  args: { platforms: mockPlatforms, value: "tistory", onChange: fn() },
} satisfies Meta<typeof BlogPlatformSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
