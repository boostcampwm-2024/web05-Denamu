import { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useParams } from "react-router-dom";

import { ArrowLeft, Lock } from "lucide-react";

import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useCustomToast } from "@/hooks/common/useCustomToast";
import { useAddQnaMessage, useQna, useVerifyQnaPassword } from "@/hooks/queries/useQna";

import { QnaStatus } from "@/types/qna";

const STATUS_LABELS: Record<QnaStatus, string> = {
  PENDING: "답변대기",
  ANSWERED: "답변완료",
};

export default function QnaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useCustomToast();
  const qnaId = id ? Number(id) : null;
  const { data: qna, isLoading, isError } = useQna(qnaId);

  const [passwordInput, setPasswordInput] = useState("");
  const [unlockPassword, setUnlockPassword] = useState<string | null>(null);
  const [followUpContent, setFollowUpContent] = useState("");
  const [followUpPassword, setFollowUpPassword] = useState("");

  const verifyMutation = useVerifyQnaPassword(qnaId ?? 0);
  const addMessageMutation = useAddQnaMessage(qnaId ?? 0);

  const handleVerify = () => {
    verifyMutation.mutate(
      { password: passwordInput },
      {
        onSuccess: () => {
          setUnlockPassword(passwordInput);
        },
        onError: () => {
          toast({ description: "비밀번호가 일치하지 않습니다.", variant: "destructive" });
        },
      }
    );
  };

  const handleFollowUp = () => {
    addMessageMutation.mutate(
      {
        content: followUpContent,
        password: unlockPassword ?? (followUpPassword || undefined),
      },
      {
        onSuccess: () => {
          setFollowUpContent("");
          setFollowUpPassword("");
          toast({ description: "추가 질문이 등록되었습니다." });
        },
        onError: () => {
          toast({ description: "추가 질문 등록에 실패했습니다.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <Layout>
      <Helmet>
        <title>{qna ? `${qna.title} - Q&A` : "Q&A"} - 데나무</title>
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <Button variant="ghost" size="sm" className="gap-1 px-0 text-xs text-gray-400" onClick={() => navigate("/board")}>
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Button>

        {isLoading ? (
          <p className="py-12 text-center text-sm text-gray-400">불러오는 중...</p>
        ) : isError || !qna ? (
          <p className="py-12 text-center text-sm text-red-500">존재하지 않는 문의입니다.</p>
        ) : qna.requiresPassword ? (
          <div className="mt-6 flex flex-col items-center gap-4 rounded-lg border py-16">
            <Lock className="h-6 w-6 text-gray-400" />
            <p className="text-sm font-medium">{qna.title}</p>
            <p className="text-xs text-gray-400">비공개로 작성된 문의입니다. 비밀번호를 입력해주세요.</p>
            <div className="flex w-full max-w-xs gap-2">
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="비밀번호"
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              />
              <Button onClick={handleVerify} disabled={!passwordInput || verifyMutation.isPending}>
                확인
              </Button>
            </div>
          </div>
        ) : (
          <article className="mt-4">
            <div className="flex items-center gap-2">
              {qna.isSecret && <Lock className="h-4 w-4 text-gray-400" />}
              <Badge variant={qna.status === "ANSWERED" ? "default" : "outline"}>
                {STATUS_LABELS[qna.status]}
              </Badge>
            </div>
            <h1 className="mt-2 text-2xl font-bold">{qna.title}</h1>
            <p className="mt-2 text-sm text-gray-400">
              {qna.authorLabel} · {new Date(qna.createdAt).toLocaleString()}
            </p>

            <div className="mt-6 flex flex-col gap-8 border-t pt-6">
              {qna.messages.map((message, index) => (
                <div key={index} className="flex gap-4">
                  <span
                    className={
                      message.type === "ANSWER"
                        ? "text-3xl font-black leading-none text-blue-500"
                        : "text-3xl font-black leading-none text-green-500"
                    }
                  >
                    {message.type === "ANSWER" ? "A" : "Q"}
                  </span>
                  <div className="flex-1 pt-1">
                    <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-medium">
                        {message.type === "ANSWER" ? `관리자 ${message.adminName ?? ""}` : "질문자"}
                      </span>
                      <span>{new Date(message.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {qna.status === "ANSWERED" && (
              <div className="mt-6 flex flex-col gap-3 border-t pt-6">
                <Label htmlFor="qna-follow-up">추가 질문하기</Label>
                <Textarea
                  id="qna-follow-up"
                  rows={4}
                  value={followUpContent}
                  onChange={(e) => setFollowUpContent(e.target.value)}
                  placeholder="답변을 확인 후 추가로 질문할 내용을 입력하세요"
                />
                {unlockPassword === null && (
                  <Input
                    type="password"
                    value={followUpPassword}
                    onChange={(e) => setFollowUpPassword(e.target.value)}
                    placeholder="비회원으로 작성한 문의라면 비밀번호를 입력하세요"
                  />
                )}
                <div className="flex justify-end">
                  <Button
                    onClick={handleFollowUp}
                    disabled={!followUpContent.trim() || addMessageMutation.isPending}
                  >
                    등록
                  </Button>
                </div>
              </div>
            )}
          </article>
        )}
      </div>
    </Layout>
  );
}
