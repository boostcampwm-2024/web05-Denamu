import { useNavigate } from "react-router-dom";

import { Ban } from "lucide-react";

import { Button } from "@/components/ui/button.tsx";

import { useCustomToast } from "@/hooks/common/useCustomToast.ts";
import { useUnblockUser } from "@/hooks/queries/useBlock.ts";

interface BlockedProfileViewProps {
  userId: number;
}

export const BlockedProfileView = ({ userId }: BlockedProfileViewProps) => {
  const navigate = useNavigate();
  const { toast } = useCustomToast();
  const { mutate: unblockUser, isPending } = useUnblockUser();

  const handleUnblock = () => {
    unblockUser(userId, {
      onSuccess: () => {
        toast({ title: "차단 해제 완료", description: "차단이 해제되었습니다." });
      },
      onError: () => {
        toast({ title: "차단 해제 실패", description: "잠시 후 다시 시도해주세요." });
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <Ban className="w-12 h-12 mb-4 text-gray-400" />
      <h2 className="text-xl font-semibold text-gray-800">차단한 사용자입니다</h2>
      <p className="mt-2 text-sm text-gray-500">차단한 사용자의 프로필은 볼 수 없습니다.</p>
      <div className="flex gap-3 mt-8">
        <Button variant="outline" onClick={() => navigate("/")}>
          홈으로
        </Button>
        <Button onClick={handleUnblock} disabled={isPending}>
          차단 해제
        </Button>
      </div>
    </div>
  );
};
