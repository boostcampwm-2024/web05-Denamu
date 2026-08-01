import type { Meta, StoryObj } from "@storybook/react-vite";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const meta = {
  title: "ui/Accordion",
  component: Accordion,
  args: { type: "single" as const },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible defaultValue="item-1" className="w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>RSS 피드란 무엇인가요?</AccordionTrigger>
        <AccordionContent>RSS는 블로그나 뉴스 사이트의 컨텐츠를 구독할 수 있는 표준 형식입니다.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>어떤 플랫폼을 지원하나요?</AccordionTrigger>
        <AccordionContent>Tistory, Velog, Medium 플랫폼을 지원합니다.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>등록 후 얼마나 걸리나요?</AccordionTrigger>
        <AccordionContent>관리자 승인 후 피드 크롤링이 시작되며 보통 1시간 내에 반영됩니다.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
