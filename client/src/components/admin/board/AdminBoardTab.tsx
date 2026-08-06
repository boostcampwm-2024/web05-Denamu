import { useRef, useState } from "react";

import { ArrowLeft, HelpCircle, Loader2, MessageCircle, Pencil, Pin, Plus, Trash2 } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useCustomToast } from "@/hooks/common/useCustomToast";
import { useCreateBoard, useAdminBoards, useDeleteBoard, useUpdateBoard } from "@/hooks/queries/useAdminBoards";

import { adminBoard } from "@/api/services/admin/board";
import { BoardCategory, BoardStatus, BoardSummary } from "@/types/board";
import { html } from "@codemirror/lang-html";
import { useQueryClient } from "@tanstack/react-query";
import { Editor } from "@tinymce/tinymce-react";
import CodeMirror from "@uiw/react-codemirror";

type StatusFilter = BoardStatus | "ALL";
type CategoryFilter = BoardCategory | "ALL";

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "전체", value: "ALL" },
  { label: "임시저장", value: "DRAFT" },
  { label: "발행됨", value: "PUBLISHED" },
];

const STATUS_LABELS: Record<BoardStatus, string> = {
  DRAFT: "임시저장",
  PUBLISHED: "발행됨",
};

const CATEGORY_FILTERS: { label: string; value: CategoryFilter }[] = [
  { label: "전체", value: "ALL" },
  { label: "공지사항", value: "NOTICE" },
  { label: "FAQ", value: "FAQ" },
];

const CATEGORY_LABELS: Record<BoardCategory, string> = {
  NOTICE: "공지사항",
  FAQ: "FAQ",
};

const PAGE_SIZE = 10;

const EDITOR_INIT = {
  min_height: 480,
  menubar: false,
  branding: false,
  plugins: "link image lists",
  toolbar:
    "blocks | bold italic underline strikethrough | forecolor backcolor | bullist numlist | link image | removeformat | code",
  block_formats: "본문=p; 제목1=h1; 제목2=h2; 제목3=h3",
  file_picker_types: "image",
  automatic_uploads: true,
  paste_data_images: true,
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
  question: string;
  isPinned: boolean;
  status: BoardStatus;
  category: BoardCategory;
  startAt: string;
  endAt: string;
}

const EMPTY_FORM: BoardFormState = {
  id: null,
  title: "",
  content: "",
  question: "",
  isPinned: false,
  status: "DRAFT",
  category: "NOTICE",
  startAt: "",
  endAt: "",
};

type ViewMode = "list" | "form";

export default function AdminBoardTab() {
  const [mode, setMode] = useState<ViewMode>("list");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<BoardFormState>(EMPTY_FORM);
  const [loadingEditId, setLoadingEditId] = useState<number | null>(null);
  const { toast } = useCustomToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useAdminBoards({
    page,
    limit: PAGE_SIZE,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    category: categoryFilter === "ALL" ? undefined : categoryFilter,
  });

  const { mutate: createBoard, isPending: isCreating } = useCreateBoard();
  const { mutate: updateBoard, isPending: isUpdating } = useUpdateBoard();
  const { mutate: deleteBoard } = useDeleteBoard();

  const boards = data?.result ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.totalCount ?? 0) / PAGE_SIZE));

  const openCreateForm = () => {
    setForm({ ...EMPTY_FORM, category: categoryFilter === "ALL" ? "NOTICE" : categoryFilter });
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
        question: detail.question ?? "",
        isPinned: board.isPinned,
        status: board.status,
        category: board.category,
        startAt: toDatetimeLocal(board.startAt),
        endAt: toDatetimeLocal(board.endAt),
      });
      setMode("form");
    } catch {
      toast({ description: "게시글을 불러오지 못했습니다.", variant: "destructive" });
    } finally {
      setLoadingEditId(null);
    }
  };

  const handleImageUpload = async (blobInfo: { blob: () => Blob; filename: () => string }): Promise<string> => {
    const file = new File([blobInfo.blob()], blobInfo.filename(), { type: blobInfo.blob().type });
    try {
      return await adminBoard.uploadImage(file);
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
      adminBoard
        .uploadImage(file)
        .then((url) => callback(url, { alt: file.name }))
        .catch(() => toast({ description: "이미지 업로드에 실패했습니다.", variant: "destructive" }));
    };
    input.click();
  };

  const editorRef = useRef<TinyMCEEditor | null>(null);
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [sourceDraft, setSourceDraft] = useState("");

  const applySourceDraft = () => {
    editorRef.current?.setContent(sourceDraft);
    setIsSourceOpen(false);
  };

  const questionEditorRef = useRef<TinyMCEEditor | null>(null);
  const [isQuestionSourceOpen, setIsQuestionSourceOpen] = useState(false);
  const [questionSourceDraft, setQuestionSourceDraft] = useState("");

  const applyQuestionSourceDraft = () => {
    questionEditorRef.current?.setContent(questionSourceDraft);
    setIsQuestionSourceOpen(false);
  };

  const handleSubmit = () => {
    const onSuccess = () => {
      const label = CATEGORY_LABELS[form.category];
      toast({ description: form.id ? `${label} 수정을 완료했습니다.` : `${label} 작성을 완료했습니다.` });
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
            question: form.category === "FAQ" ? form.question : undefined,
            isPinned: form.isPinned,
            status: form.status,
            category: form.category,
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
          question: form.category === "FAQ" ? form.question : undefined,
          isPinned: form.isPinned,
          status: form.status,
          category: form.category,
          startAt: fromDatetimeLocal(form.startAt),
          endAt: fromDatetimeLocal(form.endAt),
        },
        { onSuccess, onError }
      );
    }
  };

  const handleDelete = (id: number) => {
    deleteBoard(id, {
      onSuccess: () => toast({ description: "삭제를 완료했습니다." }),
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
          <h2 className="text-lg font-semibold">
            {CATEGORY_LABELS[form.category]} {form.id ? "수정" : "작성"}
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="board-title">제목</Label>
            <Input
              id="board-title"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="제목을 입력하세요"
            />
          </div>

          {form.category === "FAQ" && (
            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 dark:text-blue-400">
                <HelpCircle className="h-4 w-4" />
                질문
              </Label>
              <Editor
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                licenseKey="gpl"
                value={form.question}
                onEditorChange={(question) => setForm((prev) => ({ ...prev, question }))}
                init={{
                  ...EDITOR_INIT,
                  images_upload_handler: handleImageUpload,
                  file_picker_callback: handleFilePick,
                  setup: (editor: TinyMCEEditor) => {
                    questionEditorRef.current = editor;
                    editor.ui.registry.addButton("code", {
                      icon: "sourcecode",
                      tooltip: "HTML 소스 편집",
                      onAction: () => {
                        setQuestionSourceDraft(editor.getContent({ format: "html" }));
                        setIsQuestionSourceOpen(true);
                      },
                    });
                  },
                }}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            {form.category === "FAQ" ? (
              <Label className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                <MessageCircle className="h-4 w-4" />
                답변
              </Label>
            ) : (
              <Label>본문</Label>
            )}
            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              licenseKey="gpl"
              value={form.content}
              onEditorChange={(content) => setForm((prev) => ({ ...prev, content }))}
              init={{
                ...EDITOR_INIT,
                images_upload_handler: handleImageUpload,
                file_picker_callback: handleFilePick,
                setup: (editor: TinyMCEEditor) => {
                  editorRef.current = editor;
                  editor.ui.registry.addButton("code", {
                    icon: "sourcecode",
                    tooltip: "HTML 소스 편집",
                    onAction: () => {
                      setSourceDraft(editor.getContent({ format: "html" }));
                      setIsSourceOpen(true);
                    },
                  });
                },
              }}
            />
          </div>

          <Dialog open={isQuestionSourceOpen} onOpenChange={setIsQuestionSourceOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>HTML 소스 편집</DialogTitle>
              </DialogHeader>
              <CodeMirror
                value={questionSourceDraft}
                height="480px"
                extensions={[html()]}
                onChange={setQuestionSourceDraft}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsQuestionSourceOpen(false)}>
                  취소
                </Button>
                <Button onClick={applyQuestionSourceDraft}>적용</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isSourceOpen} onOpenChange={setIsSourceOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>HTML 소스 편집</DialogTitle>
              </DialogHeader>
              <CodeMirror value={sourceDraft} height="480px" extensions={[html()]} onChange={setSourceDraft} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSourceOpen(false)}>
                  취소
                </Button>
                <Button onClick={applySourceDraft}>적용</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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

            <div className="flex items-center gap-2">
              <Select
                value={form.category}
                onValueChange={(value) => setForm((prev) => ({ ...prev, category: value as BoardCategory }))}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOTICE">공지사항</SelectItem>
                  <SelectItem value="FAQ">FAQ</SelectItem>
                </SelectContent>
              </Select>

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
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setMode("list")}>
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !form.title.trim() ||
                (form.category === "FAQ" && !form.question.trim()) ||
                isCreating ||
                isUpdating
              }
            >
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
        <div className="flex items-center gap-2">
          <Tabs
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value as CategoryFilter);
              setPage(1);
            }}
          >
            <TabsList>
              {CATEGORY_FILTERS.map((filter) => (
                <TabsTrigger key={filter.value} value={filter.value}>
                  {filter.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
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
        </div>
        <Button size="sm" className="gap-1" onClick={openCreateForm}>
          <Plus className="h-4 w-4" />
          {categoryFilter === "ALL" ? "공지사항" : CATEGORY_LABELS[categoryFilter]} 작성
        </Button>
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-gray-400">불러오는 중...</p>
      ) : isError ? (
        <p className="py-12 text-center text-sm text-red-500">목록을 불러오지 못했습니다.</p>
      ) : boards.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400">등록된 게시글이 없습니다.</p>
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
        <Badge variant="outline">{CATEGORY_LABELS[board.category]}</Badge>
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
              <AlertDialogTitle>{CATEGORY_LABELS[board.category]} 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-medium">{board.title}</span>을(를) 삭제하시겠습니까? 되돌릴 수 없습니다.
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
