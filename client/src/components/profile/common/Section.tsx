import { Card, CardContent } from "@/components/ui/card.tsx";

interface ProfileTempSectionProps {
  title: string;
}

export const Section = ({ title }: ProfileTempSectionProps) => {
  return (
    <Card className="mb-8 overflow-hidden">
      <CardContent className="p-6 h-96">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-gray-400">서비스가 현재 개발 중입니다. 곧 만나요!</p>
      </CardContent>
    </Card>
  );
};
