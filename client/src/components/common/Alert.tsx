import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { AlertType } from "@/types/alert";

export default function Alert({ alertOpen, onClose }: { alertOpen: AlertType; onClose: () => void }) {
  return (
    <AlertDialog open={alertOpen.isOpen}>
      <AlertDialogContent data-testid="alert-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>{alertOpen.title}</AlertDialogTitle>
          <AlertDialogDescription>{alertOpen.content}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>확인</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
