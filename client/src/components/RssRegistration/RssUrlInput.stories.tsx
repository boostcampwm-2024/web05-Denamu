import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { RssUrlInput } from "@/components/RssRegistration/RssUrlInput";

const meta = {
  title: "RssRegistration/RssUrlInput",
  component: RssUrlInput,
  args: { platform: "tistory", value: "", onChange: fn() },
} satisfies Meta<typeof RssUrlInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
