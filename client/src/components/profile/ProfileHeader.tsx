import { useState } from "react";

import { MoreVertical, Ban } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";

import { useCustomToast } from "@/hooks/common/useCustomToast.ts";
import { useBlockUser } from "@/hooks/queries/useBlock.ts";

interface ProfileHeaderProps {
  name: string;
  email: string;
  profileImage: string | null;
  introduction: string | null;
  blockableUserId?: number;
}

export const ProfileHeader = ({ name, email, profileImage, introduction, blockableUserId }: ProfileHeaderProps) => {
  const initials = name ? name.substring(0, 2).toUpperCase() : "사용자";
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const { toast } = useCustomToast();
  const { mutate: blockUser } = useBlockUser();

  const handleBlock = () => {
    if (!blockableUserId) return;
    blockUser(blockableUserId, {
      onSuccess: () => {
        toast({ title: "차단 완료", description: `${name}님을 차단했습니다.` });
      },
      onError: () => {
        toast({ title: "차단 실패", description: "잠시 후 다시 시도해주세요." });
      },
    });
    setShowBlockConfirm(false);
  };

  return (
    <Card className="mb-8 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start space-x-6">
          <Avatar className="flex-shrink-0 w-24 h-24 border-4 border-white shadow">
            {profileImage && <AvatarImage src={profileImage} alt={name} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold">{name}</h1>
            {email && <p className="mt-1 text-gray-600">{email}</p>}
            <p className="mt-4 text-gray-800 whitespace-pre-wrap">
              {introduction ? introduction : <span className="text-gray-400">자기소개가 없습니다.</span>}
            </p>
          </div>
          {blockableUserId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-gray-500 transition-colors rounded-lg hover:bg-gray-100"
                  aria-label="더보기"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setShowBlockConfirm(true)}>
                  <Ban className="w-4 h-4 mr-2" />
                  차단하기
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>

      <AlertDialog open={showBlockConfirm} onOpenChange={setShowBlockConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{name} 유저를 차단하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>댓글, 프로필 페이지 열람이 제한됩니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleBlock}>
              차단
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
