import { SuspendedProfileView } from "@/components/profile/SuspendedProfileView";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "profile/SuspendedProfileView",
  component: SuspendedProfileView,
} satisfies Meta<typeof SuspendedProfileView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
