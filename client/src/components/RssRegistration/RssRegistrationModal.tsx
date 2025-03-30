import { useState } from "react";

import { FormInput } from "@/components/RssRegistration/FormInput";
import { PlatformBadge } from "@/components/RssRegistration/PlatformBadge";
import { BlogPlatformSelector } from "@/components/RssRegistration/PlatformSelector";
import Alert from "@/components/common/Alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useRssRegistrationForm } from "@/hooks/common/useRssRegistrationForm.ts";
import { PLATFORM_OPTIONS } from "@/hooks/common/useRssRegistrationForm.ts";
import { useRegisterRss } from "@/hooks/queries/useRegisterRss.ts";

import { AlertType } from "@/types/alert.ts";
import { RegisterRss } from "@/types/rss.ts";

export function RssRegistrationModal({ onClose, rssOpen }: { onClose: () => void; rssOpen: boolean }) {
  const [alertOpen, setAlertOpen] = useState<AlertType>({ title: "", content: "", isOpen: false });

  const { values, handlers, formState, blogPlatform, selectedPlatformValue } = useRssRegistrationForm();
  const { mutate } = useRegisterRss(
    () => {
      setAlertOpen({
        title: "RSS 요청 성공!",
        content: "관리자가 검토후 처리 결과를 입력해주신 메일을 통해 전달드릴 예정이에요!",
        isOpen: true,
      });
    },
    () => {
      setAlertOpen({
        title: "RSS 요청 실패!",
        content: "입력한 정보를 확인하거나 다시 시도해주세요. 문제가 계속되면 관리자에게 문의하세요!",
        isOpen: true,
      });
    }
  );

  const handleAlertClose = () => {
    setAlertOpen({ title: "", content: "", isOpen: false });
    formState.reset();
    onClose();
  };

  const handleRegister = () => {
    const data: RegisterRss = {
      rssUrl: values.rssUrl,
      blog: values.bloggerName,
      name: values.userName,
      email: values.email,
      blogType: values.platformValue,
    };
    mutate(data);
  };

  return (
    <Dialog open={rssOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-foreground font-bold">RSS 등록</DialogTitle>
          <DialogDescription className="flex flex-col text-muted-foreground">
            <span>RSS 주소 검토 후 운영진이 서비스에 추가합니다.</span>
            <span>검토 및 등록에는 영업일 기준 3-5일이 소요될 수 있습니다.</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <FormInput
              id="blogUrl"
              type="text"
              label="블로그 주소"
              onChange={handlers.handleBlogUrlChange}
              placeholder="https://myblog.tistory.com"
              value={values.blogUrl}
            />
          </div>
          <div className="space-y-2">
            <BlogPlatformSelector
              platforms={PLATFORM_OPTIONS}
              value={selectedPlatformValue}
              onChange={handlers.handlePlatformSelection}
            />
            {values.blogUrl && blogPlatform && (
              <PlatformBadge platform={blogPlatform} onClick={handlers.handleBadgeClick} />
            )}
            {selectedPlatformValue === "other" && (
              <div className="mt-4">
                <FormInput
                  id="rssUrl"
                  type="text"
                  label="RSS URL"
                  onChange={handlers.handleRssDirectInput}
                  placeholder="https://myblog.com/rss"
                  value={values.rssUrl}
                />
                <p className="text-xs text-muted-foreground mt-1">기타 플랫폼은 RSS URL을 직접 입력해주세요.</p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <FormInput
              id="blog"
              type="text"
              label="블로그명"
              onChange={handlers.handleBloggerName}
              placeholder="블로그명을 입력하세요"
              value={values.bloggerName}
            />
            <FormInput
              id="name"
              type="text"
              label="신청자 이름"
              onChange={handlers.handleUserName}
              placeholder="이름을 입력하세요"
              value={values.userName}
            />
            <FormInput
              id="email"
              type="email"
              label="이메일"
              onChange={handlers.handleEmail}
              placeholder="example@denamu.com"
              value={values.email}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleRegister}
            disabled={!formState.isValid}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            등록
          </Button>
        </DialogFooter>
      </DialogContent>
      <Alert alertOpen={alertOpen} onClose={handleAlertClose} />
    </Dialog>
  );
}
