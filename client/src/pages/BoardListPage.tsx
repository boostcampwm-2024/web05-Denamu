import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";

import { ArrowLeft, Lock, Pin } from "lucide-react";

import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { useCustomToast } from "@/hooks/common/useCustomToast";
import { useBoards } from "@/hooks/queries/useBoards";
import { useCreateQna, useQnaList } from "@/hooks/queries/useQna";

import { useAuthStore } from "@/store/useAuthStore";
import { BoardCategory } from "@/types/board";
import { QnaStatus } from "@/types/qna";

const PAGE_SIZE = 10;

type TabValue = BoardCategory | "QNA";
type QnaMode = "list" | "form";

const TABS: { label: string; value: TabValue }[] = [
  { label: "공지사항", value: "NOTICE" },
  { label: "FAQ", value: "FAQ" },
  { label: "Q&A", value: "QNA" },
];

const EMPTY_MESSAGES: Record<TabValue, string> = {
  NOTICE: "등록된 공지사항이 없습니다.",
  FAQ: "등록된 FAQ가 없습니다.",
  QNA: "등록된 문의가 없습니다.",
};

const ERROR_MESSAGES: Record<TabValue, string> = {
  NOTICE: "공지사항을 불러오지 못했습니다.",
  FAQ: "FAQ를 불러오지 못했습니다.",
  QNA: "Q&A 목록을 불러오지 못했습니다.",
};

const QNA_STATUS_LABELS: Record<QnaStatus, string> = {
  PENDING: "답변대기",
  ANSWERED: "답변완료",
};

interface QnaFormState {
  title: string;
  content: string;
  isSecret: boolean;
  password: string;
  guestName: string;
  guestEmail: string;
  agreed: boolean;
}

const EMPTY_QNA_FORM: QnaFormState = {
  title: "",
  content: "",
  isSecret: false,
  password: "",
  guestName: "",
  guestEmail: "",
  agreed: false,
};

export default function BoardListPage() {
  const [tab, setTab] = useState<TabValue>("NOTICE");
  const [page, setPage] = useState(1);
  const [qnaMode, setQnaMode] = useState<QnaMode>("list");
  const [qnaForm, setQnaForm] = useState<QnaFormState>(EMPTY_QNA_FORM);
  const navigate = useNavigate();
  const { toast } = useCustomToast();
  const { role } = useAuthStore();
  const isGuest = role === "guest";

  const isBoardTab = tab === "NOTICE" || tab === "FAQ";
  const {
    data: boardData,
    isLoading: isBoardLoading,
    isError: isBoardError,
  } = useBoards({ page, limit: PAGE_SIZE, category: isBoardTab ? tab : "NOTICE" }, isBoardTab);
  const {
    data: qnaData,
    isLoading: isQnaLoading,
    isError: isQnaError,
  } = useQnaList({ page, limit: PAGE_SIZE }, tab === "QNA" && qnaMode === "list");
  const { mutate: createQna, isPending: isCreatingQna } = useCreateQna();

  const handleTabChange = (value: string) => {
    setTab(value as TabValue);
    setPage(1);
    setQnaMode("list");
  };

  const boards = boardData?.result ?? [];
  const qnaList = qnaData?.result ?? [];
  const totalCount = isBoardTab ? (boardData?.totalCount ?? 0) : (qnaData?.totalCount ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const isLoading = isBoardTab ? isBoardLoading : isQnaLoading;
  const isError = isBoardTab ? isBoardError : isQnaError;

  const canSubmitQna =
    qnaForm.title.trim() &&
    qnaForm.content.trim() &&
    (!qnaForm.isSecret || qnaForm.password.trim()) &&
    (!isGuest ||
      (qnaForm.guestName.trim() && qnaForm.guestEmail.trim() && qnaForm.password.trim() && qnaForm.agreed));

  const handleSubmitQna = () => {
    createQna(
      {
        title: qnaForm.title,
        content: qnaForm.content,
        isSecret: qnaForm.isSecret,
        password: qnaForm.password || undefined,
        guestName: isGuest ? qnaForm.guestName : undefined,
        guestEmail: isGuest ? qnaForm.guestEmail : undefined,
      },
      {
        onSuccess: () => {
          toast({ description: "문의가 등록되었습니다." });
          setQnaForm(EMPTY_QNA_FORM);
          setQnaMode("list");
        },
        onError: () => {
          toast({ description: "문의 등록 중 오류가 발생했습니다.", variant: "destructive" });
        },
      }
    );
  };

  const isQnaFormMode = tab === "QNA" && qnaMode === "form";

  return (
    <Layout>
      <Helmet>
        <title>공지사항 · FAQ · Q&A - 데나무</title>
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">공지사항 · FAQ · Q&A</h1>

          {tab === "QNA" && qnaMode === "list" && (
            <Button size="sm" onClick={() => setQnaMode("form")}>
              문의하기
            </Button>
          )}
        </div>

        {!isQnaFormMode && (
          <Tabs value={tab} onValueChange={handleTabChange} className="mt-6">
            <TabsList>
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {isQnaFormMode ? (
          <section className="mt-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 px-2 text-xs text-gray-400"
                onClick={() => setQnaMode("list")}
              >
                <ArrowLeft className="h-4 w-4" />
                목록으로
              </Button>
              <h2 className="text-lg font-semibold">문의하기</h2>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="qna-title">제목</Label>
              <Input
                id="qna-title"
                value={qnaForm.title}
                onChange={(e) => setQnaForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="제목을 입력하세요"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="qna-content">내용</Label>
              <Textarea
                id="qna-content"
                rows={6}
                value={qnaForm.content}
                onChange={(e) => setQnaForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="문의 내용을 입력하세요"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="qna-secret"
                checked={qnaForm.isSecret}
                onCheckedChange={(checked) => setQnaForm((prev) => ({ ...prev, isSecret: checked }))}
              />
              <Label htmlFor="qna-secret">비공개로 작성</Label>
            </div>

            {isGuest && (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="qna-guest-name">닉네임</Label>
                  <Input
                    id="qna-guest-name"
                    value={qnaForm.guestName}
                    onChange={(e) => setQnaForm((prev) => ({ ...prev, guestName: e.target.value }))}
                    placeholder="닉네임"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="qna-guest-email">이메일</Label>
                  <Input
                    id="qna-guest-email"
                    type="email"
                    value={qnaForm.guestEmail}
                    onChange={(e) => setQnaForm((prev) => ({ ...prev, guestEmail: e.target.value }))}
                    placeholder="답변 알림을 받을 이메일"
                  />
                </div>
              </>
            )}

            {(isGuest || qnaForm.isSecret) && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="qna-password">비밀번호</Label>
                <Input
                  id="qna-password"
                  type="password"
                  value={qnaForm.password}
                  onChange={(e) => setQnaForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="추가 질문/열람 시 필요한 비밀번호"
                />
              </div>
            )}

            {isGuest && (
              <div className="flex items-start gap-2">
                <input
                  id="qna-agree"
                  type="checkbox"
                  className="mt-1"
                  checked={qnaForm.agreed}
                  onChange={(e) => setQnaForm((prev) => ({ ...prev, agreed: e.target.checked }))}
                />
                <Label htmlFor="qna-agree" className="text-xs font-normal leading-5 text-gray-500">
                  닉네임, 이메일, 비밀번호를 문의 접수 및 답변 통지 목적으로 수집하는 것에 동의합니다.{" "}
                  <Link to="/privacy" target="_blank" className="underline">
                    개인정보처리방침
                  </Link>
                </Label>
              </div>
            )}

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setQnaMode("list")}>
                취소
              </Button>
              <Button onClick={handleSubmitQna} disabled={!canSubmitQna || isCreatingQna}>
                등록
              </Button>
            </div>
          </section>
        ) : (
          <>
            <div className="mt-4 divide-y border-t border-b">
              {isLoading ? (
                <p className="py-12 text-center text-sm text-gray-400">불러오는 중...</p>
              ) : isError ? (
                <p className="py-12 text-center text-sm text-red-500">{ERROR_MESSAGES[tab]}</p>
              ) : isBoardTab ? (
                boards.length === 0 ? (
                  <p className="py-12 text-center text-sm text-gray-400">{EMPTY_MESSAGES[tab]}</p>
                ) : (
                  boards.map((board) => (
                    <button
                      key={board.id}
                      onClick={() => navigate(`/board/${board.id}`)}
                      className="flex w-full items-center gap-3 py-4 text-left hover:bg-accent"
                    >
                      {board.isPinned && (
                        <Badge variant="secondary" className="shrink-0 gap-1">
                          <Pin className="h-3 w-3" />
                          고정
                        </Badge>
                      )}
                      <span className="flex-1 truncate font-medium">{board.title}</span>
                      <span className="shrink-0 text-xs text-gray-400">
                        {new Date(board.createdAt).toLocaleDateString()}
                      </span>
                    </button>
                  ))
                )
              ) : qnaList.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-400">{EMPTY_MESSAGES[tab]}</p>
              ) : (
                qnaList.map((qna) => (
                  <button
                    key={qna.id}
                    onClick={() => navigate(`/qna/${qna.id}`)}
                    className="flex w-full items-center gap-3 py-4 text-left hover:bg-accent"
                  >
                    {qna.isSecret && <Lock className="h-3.5 w-3.5 shrink-0 text-gray-400" />}
                    <Badge variant={qna.status === "ANSWERED" ? "default" : "outline"} className="shrink-0">
                      {QNA_STATUS_LABELS[qna.status]}
                    </Badge>
                    <span className="flex-1 truncate font-medium">{qna.title}</span>
                    <span className="shrink-0 text-xs text-gray-400">{qna.authorLabel}</span>
                    <span className="shrink-0 text-xs text-gray-400">
                      {new Date(qna.createdAt).toLocaleDateString()}
                    </span>
                  </button>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
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
          </>
        )}
      </div>
    </Layout>
  );
}
