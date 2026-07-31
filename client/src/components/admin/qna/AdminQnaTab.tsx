import { useState } from "react";

import { ArrowLeft, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { useCustomToast } from "@/hooks/common/useCustomToast";
import { useAdminQna, useAdminQnaList, useAnswerQna } from "@/hooks/queries/useAdminQna";

import { QnaStatus, QnaSummary } from "@/types/qna";

type StatusFilter = QnaStatus | "ALL";

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "전체", value: "ALL" },
  { label: "답변대기", value: "PENDING" },
  { label: "답변완료", value: "ANSWERED" },
];

const STATUS_LABELS: Record<QnaStatus, string> = {
  PENDING: "답변대기",
  ANSWERED: "답변완료",
};

const PAGE_SIZE = 10;

export default function AdminQnaTab() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [answerContent, setAnswerContent] = useState("");
  const { toast } = useCustomToast();

  const { data, isLoading, isError } = useAdminQnaList({
    page,
    limit: PAGE_SIZE,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });
  const { data: detail } = useAdminQna(selectedId);
  const { mutate: answerQna, isPending: isAnswering } = useAnswerQna(selectedId ?? 0);

  const qnaList = data?.result ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.totalCount ?? 0) / PAGE_SIZE));

  const handleAnswer = () => {
    answerQna(
      { content: answerContent },
      {
        onSuccess: () => {
          setAnswerContent("");
          toast({ description: "답변을 등록했습니다." });
        },
        onError: () => {
          toast({ description: "답변 등록 중 오류가 발생했습니다.", variant: "destructive" });
        },
      }
    );
  };

  if (selectedId !== null && detail && !detail.requiresPassword) {
    return (
      <section className="flex flex-col gap-4 min-h-[300px]">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1 px-2 text-xs text-gray-400" onClick={() => setSelectedId(null)}>
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </Button>
          <Badge variant={detail.status === "ANSWERED" ? "default" : "outline"}>
            {STATUS_LABELS[detail.status]}
          </Badge>
          {detail.isSecret && <Lock className="h-4 w-4 text-gray-400" />}
          <h2 className="text-lg font-semibold">{detail.title}</h2>
        </div>
        <p className="text-xs text-gray-400">{detail.authorLabel}</p>

        <div className="flex flex-col gap-8">
          {detail.messages.map((message, index) => (
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

        <div className="flex flex-col gap-2 border-t pt-4">
          <Textarea
            rows={4}
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
            placeholder="답변을 입력하세요"
          />
          <div className="flex justify-end">
            <Button onClick={handleAnswer} disabled={!answerContent.trim() || isAnswering}>
              답변 등록
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4 min-h-[300px]">
      <Tabs
        value={statusFilter}
        onValueChange={(value) => {
          setStatusFilter(value as StatusFilter);
          setPage(1);
        }}
      >
        <TabsList>
          {STATUS_FILTERS.map((filter) => (
            <TabsTrigger key={filter.value} value={filter.value}>
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-gray-400">불러오는 중...</p>
      ) : isError ? (
        <p className="py-12 text-center text-sm text-red-500">목록을 불러오지 못했습니다.</p>
      ) : qnaList.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400">등록된 문의가 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {qnaList.map((qna) => (
            <QnaCard key={qna.id} qna={qna} onClick={() => setSelectedId(qna.id)} />
          ))}
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
    </section>
  );
}

interface QnaCardProps {
  qna: QnaSummary;
  onClick: () => void;
}

const QnaCard = ({ qna, onClick }: QnaCardProps) => {
  return (
    <Card className="cursor-pointer hover:bg-accent" onClick={onClick}>
      <CardContent className="flex items-center gap-3 p-4">
        {qna.isSecret && <Lock className="h-3.5 w-3.5 shrink-0 text-gray-400" />}
        <Badge variant={qna.status === "ANSWERED" ? "default" : "outline"}>{STATUS_LABELS[qna.status]}</Badge>
        <span className="flex-1 truncate font-medium">{qna.title}</span>
        <span className="shrink-0 text-xs text-gray-400">{qna.authorLabel}</span>
        <span className="shrink-0 text-xs text-gray-400">{new Date(qna.createdAt).toLocaleString()}</span>
      </CardContent>
    </Card>
  );
};
