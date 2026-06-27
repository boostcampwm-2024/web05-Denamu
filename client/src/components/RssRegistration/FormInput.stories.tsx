import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { FormInput } from "@/components/RssRegistration/FormInput";

const meta = {
  title: "RssRegistration/FormInput",
  component: FormInput,
  args: { id: "url", label: "RSS URL", value: "", placeholder: "URL을 입력하세요", type: "text", onChange: fn() },
} satisfies Meta<typeof FormInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
