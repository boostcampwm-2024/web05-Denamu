import { useState } from "react";

import { Plus } from "lucide-react";

import { AxiosError } from "axios";

import { OwnedRssCard } from "@/components/profile/rss/OwnedRssCard.tsx";
import { RssClaimModal } from "@/components/profile/rss/RssClaimModal.tsx";
import { RssEditModal } from "@/components/profile/rss/RssEditModal.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";

import { useCustomToast } from "@/hooks/common/useCustomToast.ts";
import { useCertifiedRss } from "@/hooks/queries/useProfile.ts";
import { useDeleteRssCertification } from "@/hooks/queries/useRssCertification.ts";

import { CertifiedRss } from "@/types/profile.ts";

interface RssManagementTabProps {
  userId: number;
}

const getErrorMessage = (error: AxiosError<{ message?: string }>, fallback: string) =>
  error.response?.data?.message ?? fallback;

export const RssManagementTab = ({ userId }: RssManagementTabProps) => {
  const { toast } = useCustomToast();
  const { data: rssList = [], isLoading } = useCertifiedRss(userId);

  const [claimOpen, setClaimOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CertifiedRss | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CertifiedRss | null>(null);

  const deleteMutation = useDeleteRssCertification(userId);

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast({ title: "해제 완료", description: "RSS 소유 인증을 해제했습니다." });
        setDeleteTarget(null);
      },
      onError: (error) => {
        toast({ title: "해제 실패", description: getErrorMessage(error, "다시 시도해주세요.") });
        setDeleteTarget(null);
      },
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center h-10 text-lg font-semibold">RSS 관리</h3>
          <Button onClick={() => setClaimOpen(true)} className="gap-1">
            <Plus className="w-4 h-4" />
            RSS 소유 등록
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-400">불러오는 중...</p>
        ) : rssList.length === 0 ? (
          <p className="text-sm text-gray-400">소유한 RSS가 없습니다. RSS 소유 등록을 통해 추가하세요.</p>
        ) : (
          <ul className="space-y-3">
            {rssList.map((rss) => (
              <OwnedRssCard key={rss.id} rss={rss} onEdit={setEditTarget} onDelete={setDeleteTarget} />
            ))}
          </ul>
        )}
      </CardContent>

      <RssClaimModal open={claimOpen} onClose={() => setClaimOpen(false)} userId={userId} />
      <RssEditModal target={editTarget} userId={userId} onClose={() => setEditTarget(null)} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(next) => !next && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>RSS 소유 해제</AlertDialogTitle>
            <AlertDialogDescription>
              '{deleteTarget?.name}'의 소유 인증을 해제할까요? RSS 데이터는 삭제되지 않고 소유 연결만 끊어집니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              해제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
