import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { action } from "storybook/actions";

import { RejectModal } from "@/components/admin/rss/RejectModal";
import { ADMIN } from "@/constants/endpoints";

const meta = {
  title: "admin/rss/RejectModal",
  component: RejectModal,
  args: { blogName: "데나무 블로그" },
} satisfies Meta<typeof RejectModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [reason, setReason] = useState("");
    return (
      <RejectModal
        {...args}
        rejectMessage={reason}
        handleReason={setReason}
        onSubmit={() => action("API")(`POST ${ADMIN.ACTION.REJECT}/1`)}
        onCancel={() => setReason("")}
      />
    );
  },
};
