import { useState } from "react";

export default function CommentAction({ id, handleModify }: { id: number; handleModify: (id: number) => void }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const handleOpen = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div className="flex gap-2 text-sm">
      <button onClick={() => handleModify(id)}>수정</button>
      <button onClick={handleOpen}>삭제</button>
      {isOpen && <DeleteButton id={id} handleOpen={handleOpen} />}
    </div>
  );
}

function DeleteButton({ id, handleOpen }: { id: number; handleOpen: () => void }) {
  return (
    <div className="w-[100%] h-[100%] absolute top-0 left-0 z-[1000] bg-white/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
      <div className="flex flex-col fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-xs md:max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
        <header className="flex flex-col space-y-2 text-center sm:text-left">
          <span className="text-lg font-semibold">댓글 삭제</span>
        </header>
        <section>
          <p className="text-sm text-muted-foreground text-center md:text-start">댓글을 정말로 삭제하시겠습니까?</p>
        </section>
        <footer className="flex flex-row justify-end space-x-2">
          <button onClick={handleOpen} className="py-2 px-4 rounded-sm hover:bg-gray-100">
            취소
          </button>
          <button className="bg-primary py-2 px-4 text-white rounded-sm hover:bg-primary/90">확인</button>
        </footer>
      </div>
    </div>
  );
}
