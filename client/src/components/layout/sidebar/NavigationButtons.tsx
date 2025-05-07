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

  const handleTapChange = (newTap: "main" | "chart") => {
    setTap(newTap);
    onAction();
  };

  return (
    <>
      <Button onClick={handleAboutClick} variant="outline">
        서비스 소개
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
