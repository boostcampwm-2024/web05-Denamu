import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import CommentAction from "@/components/common/Card/detail/CommentAction";

const meta = {
  title: "common/Card/detail/CommentAction",
  component: CommentAction,
  args: { id: 1, canEdit: true, canDelete: true, handleModify: fn(), onDelete: fn() },
} satisfies Meta<typeof CommentAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
