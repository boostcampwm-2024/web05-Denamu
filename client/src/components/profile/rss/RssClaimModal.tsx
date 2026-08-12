import { useState } from "react";

import { AxiosError } from "axios";

import { PlatformIcon } from "@/components/profile/rss/PlatformIcon.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";

import { useCustomToast } from "@/hooks/common/useCustomToast.ts";
import {
  useCreateRssCertification,
  useRssCertificationPreview,
  useVerifyRssCertification,
} from "@/hooks/queries/useRssCertification.ts";

import { RssCertificationPreview } from "@/types/profile.ts";

interface RssClaimModalProps {
  open: boolean;
  onClose: () => void;
  userId: number;
}

type Step = "input" | "preview" | "verify";

const getErrorMessage = (error: AxiosError<{ message?: string }>, fallback: string) =>
  error.response?.data?.message ?? fallback;

export const RssClaimModal = ({ open, onClose, userId }: RssClaimModalProps) => {
  const { toast } = useCustomToast();
  const [step, setStep] = useState<Step>("input");
  const [blogName, setBlogName] = useState("");
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState<RssCertificationPreview | null>(null);

  const previewMutation = useRssCertificationPreview();
  const createMutation = useCreateRssCertification(userId);
  const verifyMutation = useVerifyRssCertification(userId);

  const reset = () => {
    setStep("input");
    setBlogName("");
    setCode("");
    setPreview(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handlePreview = () => {
    if (!blogName.trim()) return;
    previewMutation.mutate(blogName.trim(), {
      onSuccess: (data) => {
        setPreview(data);
        setStep("preview");
      },
      onError: (error) => {
        toast({ title: "조회 실패", description: getErrorMessage(error, "RSS 정보를 찾을 수 없습니다.") });
      },
    });
  };

  const handleRegister = () => {
    createMutation.mutate(blogName.trim(), {
      onSuccess: (result) => {
        if (result.certified) {
          toast({ title: "등록 완료", description: "RSS 소유 인증이 완료되었습니다." });
          handleClose();
          return;
        }
        toast({
          title: "인증 코드 발송",
          description: "블로그에 등록된 이메일로 인증 코드를 발송했습니다.",
        });
        setStep("verify");
      },
      onError: (error) => {
        toast({ title: "등록 실패", description: getErrorMessage(error, "다시 시도해주세요.") });
      },
    });
  };

  const handleVerify = () => {
    if (!code.trim()) return;
    verifyMutation.mutate(code.trim(), {
      onSuccess: () => {
        toast({ title: "인증 완료", description: "RSS 소유 인증이 완료되었습니다." });
        handleClose();
      },
      onError: (error) => {
        toast({ title: "인증 실패", description: getErrorMessage(error, "인증 코드를 확인해주세요.") });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        {step === "input" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-bold text-foreground">RSS 소유 등록</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                소유한 블로그의 이름을 입력하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="blogName">블로그 이름</Label>
              <Input
                id="blogName"
                value={blogName}
                autoComplete="off"
                placeholder="예) example 블로그"
                onChange={(e) => setBlogName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePreview()}
              />
            </div>
            <DialogFooter>
              <Button onClick={handlePreview} disabled={!blogName.trim() || previewMutation.isPending}>
                확인
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "preview" && preview && (
          <>
            <DialogHeader>
              <DialogTitle className="font-bold text-foreground">RSS 정보 확인</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                아래 블로그의 소유자로 등록할까요?
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-3 p-4 border rounded-lg border-gray-100">
              <PlatformIcon platform={preview.blogPlatform} name={preview.name} className="flex-shrink-0 w-12 h-12" />
              <div className="min-w-0">
                <p className="font-semibold truncate">{preview.name}</p>
                <p className="text-sm text-gray-500 truncate">{preview.userName}</p>
                <a
                  href={preview.rssUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-gray-400 truncate hover:underline"
                >
                  {preview.rssUrl}
                </a>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {preview.requiresEmailVerification
                ? "로그인 이메일과 RSS 등록 이메일이 달라, 블로그에 등록된 이메일로 발송되는 인증 코드로 2차 인증이 필요합니다."
                : "로그인 이메일과 RSS 등록 이메일이 일치하여 즉시 등록됩니다."}
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("input")}>
                뒤로
              </Button>
              <Button onClick={handleRegister} disabled={createMutation.isPending}>
                확인
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "verify" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-bold text-foreground">이메일 인증</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                블로그에 등록된 이메일로 발송된 인증 코드를 입력하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="rssCode">인증 코드</Label>
              <Input
                id="rssCode"
                value={code}
                autoComplete="off"
                placeholder="인증 코드를 입력하세요"
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleVerify} disabled={!code.trim() || verifyMutation.isPending}>
                인증
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
