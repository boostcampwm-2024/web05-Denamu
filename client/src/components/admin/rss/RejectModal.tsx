import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface RejectModalProps {
  blogName?: string;
  rejectMessage: string;
  handleReason: (reason: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const RejectModal = ({ blogName, rejectMessage, handleReason, onSubmit, onCancel }: RejectModalProps) => {
  const handleSubmit = () => {
    onSubmit();
    onCancel();
  };

  return (
    <Dialog open={!!blogName} onOpenChange={() => onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>거부 사유 입력</DialogTitle>
        </DialogHeader>
        {blogName && <p className="text-sm text-muted-foreground">블로그: {blogName}</p>}
        <Textarea
          placeholder="거부 사유를 입력하세요..."
          className="min-h-[120px]"
          value={rejectMessage}
          onChange={(e) => handleReason(e.target.value)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={!rejectMessage.trim()}>
            거부하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
