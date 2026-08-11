import { useNavigate } from "react-router-dom";

import { Ban } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";

export const SuspendedProfileView = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <Ban className="w-20 h-20 mb-4 text-gray-400" />
      <h2 className="text-xl font-semibold text-gray-800">정지 처리된 유저입니다.</h2>
      <div className="flex gap-3 mt-8">
        <Button variant="outline" onClick={() => navigate("/")}>
          홈으로
        </Button>
      </div>
    </div>
  );
};
