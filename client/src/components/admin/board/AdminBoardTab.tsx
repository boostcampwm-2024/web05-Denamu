import { useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import { ArrowLeft, Loader2, Pencil, Pin, Plus, Trash2 } from "lucide-react";

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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useCustomToast } from "@/hooks/common/useCustomToast";
import { useCreateBoard, useAdminBoards, useDeleteBoard, useUpdateBoard } from "@/hooks/queries/useAdminBoards";

import { adminBoard } from "@/api/services/admin/board";
import { BoardStatus, BoardSummary } from "@/types/board";
import { useQueryClient } from "@tanstack/react-query";

type StatusFilter = BoardStatus | "ALL";

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "전체", value: "ALL" },
  { label: "임시저장", value: "DRAFT" },
  { label: "발행됨", value: "PUBLISHED" },
];

const STATUS_LABELS: Record<BoardStatus, string> = {
  DRAFT: "임시저장",
  PUBLISHED: "발행됨",
};

const PAGE_SIZE = 10;

// Quill 인스턴스가 modules 객체 identity 변경마다 재생성되는 것을 막기 위해 모듈 스코프 상수로 분리.
const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

const toDatetimeLocal = (iso: string | null): string => {
  if (!iso) return "";
  const date = new Date(iso);
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const fromDatetimeLocal = (value: string): string | undefined => {
  if (!value) return undefined;
  return new Date(value).toISOString();
};

interface BoardFormState {
  id: number | null;
  title: string;
  content: string;
  isPinned: boolean;
  status: BoardStatus;
  startAt: string;
  endAt: string;
}

const EMPTY_FORM: BoardFormState = {
  id: null,
  title: "",
  content: "",
  isPinned: false,
  status: "DRAFT",
  startAt: "",
  endAt: "",
};

type ViewMode = "list" | "form";

export default function AdminBoardTab() {
  const [mode, setMode] = useState<ViewMode>("list");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<BoardFormState>(EMPTY_FORM);
  const [loadingEditId, setLoadingEditId] = useState<number | null>(null);
  const { toast } = useCustomToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useAdminBoards({
    page,
    limit: PAGE_SIZE,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const { mutate: createBoard, isPending: isCreating } = useCreateBoard();
  const { mutate: updateBoard, isPending: isUpdating } = useUpdateBoard();
  const { mutate: deleteBoard } = useDeleteBoard();

  const boards = data?.result ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.totalCount ?? 0) / PAGE_SIZE));

  const openCreateForm = () => {
    setForm(EMPTY_FORM);
    setMode("form");
  };

  const openEditForm = async (board: BoardSummary) => {
    setLoadingEditId(board.id);
    try {
      const detail = await queryClient.fetchQuery({
        queryKey: ["adminBoard", board.id],
        queryFn: () => adminBoard.getDetail(board.id),
      });
      setForm({
        id: board.id,
        title: board.title,
        content: detail.content,
        isPinned: board.isPinned,
        status: board.status,
        startAt: toDatetimeLocal(board.startAt),
        endAt: toDatetimeLocal(board.endAt),
      });
      setMode("form");
    } catch {
      toast({ description: "공지사항을 불러오지 못했습니다.", variant: "destructive" });
    } finally {
      setLoadingEditId(null);
    }
  };

  const handleSubmit = () => {
    const onSuccess = () => {
      toast({ description: form.id ? "공지사항이 수정되었습니다." : "공지사항이 작성되었습니다." });
      setMode("list");
    };
    const onError = () => {
      toast({ description: "요청 처리 중 오류가 발생했습니다.", variant: "destructive" });
    };

    if (form.id) {
      // startAt/endAt은 null을 명시해야 서버에 전달된다. undefined는 axios가 JSON 직렬화 시 제거해
      // 필드를 비웠을 때 기존 값이 그대로 남는다.
      updateBoard(
        {
          id: form.id,
          payload: {
            title: form.title,
            content: form.content,
            isPinned: form.isPinned,
            status: form.status,
            startAt: fromDatetimeLocal(form.startAt) ?? null,
            endAt: fromDatetimeLocal(form.endAt) ?? null,
          },
        },
        { onSuccess, onError }
      );
    } else {
      createBoard(
        {
          title: form.title,
          content: form.content,
          isPinned: form.isPinned,
          status: form.status,
          startAt: fromDatetimeLocal(form.startAt),
          endAt: fromDatetimeLocal(form.endAt),
        },
        { onSuccess, onError }
      );
    }
  };

  const handleDelete = (id: number) => {
    deleteBoard(id, {
      onSuccess: () => toast({ description: "공지사항이 삭제되었습니다." }),
      onError: () => toast({ description: "삭제 중 오류가 발생했습니다.", variant: "destructive" }),
    });
  };

  if (mode === "form") {
    return (
      <section className="flex flex-col gap-4 min-h-[300px]">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 px-2 text-xs text-gray-400"
            onClick={() => setMode("list")}
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로
          </Button>
          <h2 className="text-lg font-semibold">{form.id ? "공지사항 수정" : "공지사항 작성"}</h2>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="board-title">제목</Label>
            <Input
              id="board-title"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="공지사항 제목"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>본문</Label>
            <div className="[&_.ql-container]:min-h-[480px] [&_.ql-editor]:min-h-[480px] [&_.ql-editor]:text-base">
              <ReactQuill
                theme="snow"
                value={form.content}
                onChange={(content) => setForm((prev) => ({ ...prev, content }))}
                modules={QUILL_MODULES}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="board-start">노출 시작</Label>
              <Input
                id="board-start"
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => setForm((prev) => ({ ...prev, startAt: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="board-end">노출 종료</Label>
              <Input
                id="board-end"
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => setForm((prev) => ({ ...prev, endAt: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                id="board-pinned"
                checked={form.isPinned}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isPinned: checked }))}
              />
              <Label htmlFor="board-pinned">상단 고정</Label>
            </div>

            <Select
              value={form.status}
              onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as BoardStatus }))}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">임시저장</SelectItem>
                <SelectItem value="PUBLISHED">발행</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setMode("list")}>
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={!form.title.trim() || isCreating || isUpdating}>
              {form.id ? "수정" : "작성"}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4 min-h-[300px]">
      <div className="flex items-center justify-between">
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
        <Button size="sm" className="gap-1" onClick={openCreateForm}>
          <Plus className="h-4 w-4" />
          공지사항 작성
        </Button>
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-gray-400">불러오는 중...</p>
      ) : isError ? (
        <p className="py-12 text-center text-sm text-red-500">공지사항 목록을 불러오지 못했습니다.</p>
      ) : boards.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400">등록된 공지사항이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              isEditLoading={loadingEditId === board.id}
              onEdit={() => openEditForm(board)}
              onDelete={() => handleDelete(board.id)}
            />
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

interface BoardCardProps {
  board: BoardSummary;
  isEditLoading: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const BoardCard = ({ board, isEditLoading, onEdit, onDelete }: BoardCardProps) => {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        {board.isPinned && (
          <Badge variant="secondary" className="shrink-0 gap-1">
            <Pin className="h-3 w-3" />
            고정
          </Badge>
        )}
        <Badge variant={board.status === "PUBLISHED" ? "default" : "outline"}>{STATUS_LABELS[board.status]}</Badge>
        <span className="flex-1 truncate font-medium">{board.title}</span>
        <span className="shrink-0 text-xs text-gray-400">{new Date(board.createdAt).toLocaleString()}</span>

        <Button variant="ghost" size="icon" aria-label="수정" onClick={onEdit} disabled={isEditLoading}>
          {isEditLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="삭제">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>공지사항 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-medium">{board.title}</span> 공지사항을 삭제하시겠습니까? 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>삭제</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};
