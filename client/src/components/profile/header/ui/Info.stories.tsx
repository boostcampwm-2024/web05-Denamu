import type { Meta, StoryObj } from "@storybook/react-vite";

import { Info } from "@/components/profile/header/ui/Info";
import { mockUser } from "@/__storybook__/fixtures";

const meta = {
  title: "profile/header/ui/Info",
  component: Info,
  args: { user: mockUser },
} satisfies Meta<typeof Info>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
