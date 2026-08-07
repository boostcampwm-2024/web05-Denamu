import { useRef, useState } from "react";

import DOMPurify from "dompurify";
import { ChevronDown, ChevronUp, Loader2, Mail } from "lucide-react";
import type { Editor as TinyMCEEditor } from "tinymce";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCustomToast } from "@/hooks/common/useCustomToast";
import { useAdminMarketingEmails, useSendMarketingEmail } from "@/hooks/queries/useAdminMarketingEmail";

import { adminMarketingEmail } from "@/api/services/admin/marketingEmail";
import { MarketingEmailDetail, MarketingEmailSummary } from "@/types/marketingEmail";
import { useQueryClient } from "@tanstack/react-query";
import { Editor } from "@tinymce/tinymce-react";

const EDITOR_INIT = {
  min_height: 400,
  menubar: false,
  branding: false,
  plugins: "link image lists",
  toolbar:
    "blocks | bold italic underline strikethrough | forecolor backcolor | bullist numlist | link image | removeformat",
  block_formats: "본문=p; 제목1=h1; 제목2=h2; 제목3=h3",
  file_picker_types: "image",
  automatic_uploads: true,
  paste_data_images: true,
};

const PAGE_SIZE = 10;

export default function AdminMarketingEmailTab() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detailsById, setDetailsById] = useState<Record<number, MarketingEmailDetail>>({});
  const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);
  const { toast } = useCustomToast();
  const editorRef = useRef<TinyMCEEditor | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useAdminMarketingEmails({ page, limit: PAGE_SIZE });
  const { mutate: sendMarketingEmail, isPending } = useSendMarketingEmail();

  const history = data?.result ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.totalCount ?? 0) / PAGE_SIZE));

  const handleImageUpload = async (blobInfo: { blob: () => Blob; filename: () => string }): Promise<string> => {
    const file = new File([blobInfo.blob()], blobInfo.filename(), { type: blobInfo.blob().type });
    try {
      return await adminMarketingEmail.uploadImage(file);
    } catch {
      toast({ description: "이미지 업로드에 실패했습니다.", variant: "destructive" });
      throw new Error("이미지 업로드 실패");
    }
  };

  const handleFilePick = (callback: (url: string, meta?: Record<string, string>) => void) => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/png,image/jpeg,image/webp,image/gif");
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      adminMarketingEmail
        .uploadImage(file)
        .then((url) => callback(url, { alt: file.name }))
        .catch(() => toast({ description: "이미지 업로드에 실패했습니다.", variant: "destructive" }));
    };
    input.click();
  };

  const handleSend = () => {
    sendMarketingEmail(
      { subject, content },
      {
        onSuccess: (result) => {
          toast({ description: `${result.recipientCount}명에게 발송을 완료했습니다.` });
          setSubject("");
          setContent("");
          editorRef.current?.setContent("");
          setPage(1);
        },
        onError: () => {
          toast({ description: "발송 중 오류가 발생했습니다.", variant: "destructive" });
        },
      }
    );
  };

  const canSend = subject.trim().length > 0 && content.trim().length > 0 && !isPending;

  const toggleDetail = async (item: MarketingEmailSummary) => {
    if (expandedId === item.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(item.id);
    if (detailsById[item.id]) return;

    setLoadingDetailId(item.id);
    try {
      const result = await queryClient.fetchQuery({
        queryKey: ["adminMarketingEmail", item.id],
        queryFn: () => adminMarketingEmail.getDetail(item.id),
      });
      setDetailsById((prev) => ({ ...prev, [item.id]: result }));
    } catch {
      toast({ description: "발송 내역을 불러오지 못했습니다.", variant: "destructive" });
      setExpandedId(null);
    } finally {
      setLoadingDetailId(null);
    }
  };

  return (
    <section className="flex flex-col gap-6 min-h-[300px]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5" />
            마케팅 이메일 작성
          </CardTitle>
          <p className="text-sm text-gray-400">
            광고성 정보 수신에 동의한 회원에게만 발송됩니다. 제목 맨 앞에 "(광고)"가 자동으로 붙습니다.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="marketing-subject">제목</Label>
            <Input
              id="marketing-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="제목을 입력하세요"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>본문</Label>
            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              licenseKey="gpl"
              value={content}
              onEditorChange={setContent}
              init={{
                ...EDITOR_INIT,
                images_upload_handler: handleImageUpload,
                file_picker_callback: handleFilePick,
                setup: (editor: TinyMCEEditor) => {
                  editorRef.current = editor;
                },
              }}
            />
          </div>

          <div className="flex justify-end border-t pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={!canSend}>{isPending ? "발송 중..." : "발송"}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>마케팅 이메일을 발송하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    광고성 정보 수신에 동의한 회원 전체에게 즉시 발송되며, 되돌릴 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSend}>발송</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gray-500">발송 이력</h3>
        {isLoading ? (
          <p className="py-12 text-center text-sm text-gray-400">불러오는 중...</p>
        ) : isError ? (
          <p className="py-12 text-center text-sm text-red-500">이력을 불러오지 못했습니다.</p>
        ) : history.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">발송 이력이 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((item) => {
              const isExpanded = expandedId === item.id;
              const detail = detailsById[item.id];
              return (
                <Card key={item.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer"
                    onClick={() => toggleDetail(item)}
                    onKeyDown={(e) => e.key === "Enter" && toggleDetail(item)}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <Badge variant="secondary" className="shrink-0">
                        수신 {item.recipientCount}명
                      </Badge>
                      <span className="flex-1 truncate font-medium">{item.subject}</span>
                      {item.authorName && <span className="shrink-0 text-xs text-gray-400">{item.authorName}</span>}
                      <span className="shrink-0 text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                      {loadingDetailId === item.id ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                      ) : isExpanded ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                      )}
                    </CardContent>
                  </div>
                  {isExpanded && detail && (
                    <CardContent className="border-t pt-4">
                      <div
                        className="prose max-w-full prose-p:my-2 prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(detail.content) }}
                      />
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              이전
            </Button>
            <span className="text-sm text-gray-500">
              {page} / {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              다음
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
