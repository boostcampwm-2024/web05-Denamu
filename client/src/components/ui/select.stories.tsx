import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const meta = {
  title: "ui/Select",
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="플랫폼 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="tistory">Tistory</SelectItem>
        <SelectItem value="velog">Velog</SelectItem>
        <SelectItem value="medium">Medium</SelectItem>
      </SelectContent>
    </Select>
  ),
};
