import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import PendingTab from "@/components/admin/tabs/PendingTab";
import { Tabs } from "@/components/ui/tabs";
import { mockAdminRssList } from "@/__storybook__/fixtures";

const meta = {
  title: "admin/tabs/PendingTab",
  component: PendingTab,
  decorators: [
    (Story) => (
      <Tabs defaultValue="pending">
        <Story />
      </Tabs>
    ),
  ],
  args: { data: mockAdminRssList, onApprove: fn(), onReject: fn() },
} satisfies Meta<typeof PendingTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
