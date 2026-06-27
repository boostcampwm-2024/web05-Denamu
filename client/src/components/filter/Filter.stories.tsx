import type { Meta, StoryObj } from "@storybook/react-vite";

import Filter from "@/components/filter/Filter";
import { TAG } from "@/constants/endpoints";
import { mockApi } from "@/__storybook__/mockApi";

const mockCategories = [
  { category: "프론트엔드", tags: ["React", "TypeScript", "Vite", "Next.js", "Storybook"] },
  { category: "백엔드", tags: ["NestJS", "Node.js", "Express", "PostgreSQL", "Redis"] },
  { category: "인프라", tags: ["Docker", "Kubernetes", "AWS", "CI/CD", "Nginx"] },
];

const meta = {
  title: "filter/Filter",
  component: Filter,
} satisfies Meta<typeof Filter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTags: Story = {
  name: "태그 있음",
  beforeEach: () => {
    mockApi.onGet(TAG.LIST).reply(200, { message: "성공", data: mockCategories });
  },
};

export const NoTags: Story = {
  name: "태그 없음",
  beforeEach: () => {
    mockApi.onGet(TAG.LIST).reply(200, { message: "성공", data: [] });
  },
};
