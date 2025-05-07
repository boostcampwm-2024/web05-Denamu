import { Button } from "@/components/ui/button";

interface RssButtonProps {
  onRssClick: () => void;
  onAction: () => void;
}

export const RssButton = ({ onRssClick, onAction }: RssButtonProps) => {
  const handleClick = () => {
    onRssClick();
    onAction();
  };

  return (
    <Button variant="default" className="w-full bg-primary" onClick={handleClick}>
      블로그 등록
    </Button>
  );
};
