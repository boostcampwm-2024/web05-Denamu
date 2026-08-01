import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const meta = {
  title: "ui/Command",
  component: Command,
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[360px]">
      <CommandInput placeholder="검색어를 입력하세요..." />
      <CommandList>
        <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
        <CommandGroup heading="블로그">
          <CommandItem>Storybook으로 컴포넌트 문서화하기</CommandItem>
          <CommandItem>TypeScript 5.0 새로운 기능</CommandItem>
          <CommandItem>React Query v5 마이그레이션</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="작성자">
          <CommandItem>조민석</CommandItem>
          <CommandItem>홍길동</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
