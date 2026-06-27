import { RssRegistrationModal } from "@/components/RssRegistration/RssRegistrationModal";

import { BLOG } from "@/constants/endpoints";

import { mockApi, ok} from "@/__storybook__/mockApi";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

const meta = {
  title: "RssRegistration/RssRegistrationModal",
  component: RssRegistrationModal,
  args: { onClose: fn(), rssOpen: true },
} satisfies Meta<typeof RssRegistrationModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach: () => {
    mockApi.onPost(BLOG.RSS.REGISTRER_RSS).reply(...ok(null));
  },
};
