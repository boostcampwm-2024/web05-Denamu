import type { Meta, StoryObj } from "@storybook/react-vite";
import { action } from "storybook/actions";

import { RssRequestCard } from "@/components/admin/rss/RssRequestCard";
import { ADMIN } from "@/constants/endpoints";
import { mockAdminRssList } from "@/__storybook__/fixtures";

const meta = {
  title: "admin/rss/RssRequestCard",
  component: RssRequestCard,
  args: {
    request: mockAdminRssList[0],
    onApprove: (request) => action("API")(`POST ${ADMIN.ACTION.ACCEPT(request.id)}`),
    onReject: (request) => action("API")(`POST ${ADMIN.ACTION.REJECT(request.id)}`),
  },
} satisfies Meta<typeof RssRequestCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
