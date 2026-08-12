import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { useTapStore } from "@/store/useTapStore";

interface NavigationButtonsProps {
  onAction: () => void;
}

export const NavigationButtons = ({ onAction }: NavigationButtonsProps) => {
  const navigate = useNavigate();
  const { tap, setTap } = useTapStore();

  const handleAboutClick = () => {
    navigate("/about");
  };

  const handleBoardClick = () => {
    navigate("/board");
  };

  const handleRssListClick = () => {
    navigate("/rss");
  };

  const handleTapChange = (newTap: "main" | "chart") => {
    setTap(newTap);
    onAction();
  };

  return (
    <>
      <Button onClick={handleAboutClick} variant="outline">
        서비스 소개
      </Button>

      <Button onClick={handleBoardClick} variant="outline">
        공지사항 · Q&A
      </Button>

      <Button onClick={handleRssListClick} variant="outline">
        블로그 목록
      </Button>

      {tap === "main" ? (
        <Button variant="outline" onClick={() => handleTapChange("chart")}>
          차트
        </Button>
      ) : (
        <Button variant="outline" onClick={() => handleTapChange("main")}>
          홈
        </Button>
      )}
    </>
  );
};
