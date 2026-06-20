import { useEffect, useRef, useState } from "react";

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
} from "@/components/ui/alert-dialog.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";

import { useCustomToast } from "@/hooks/common/useCustomToast.ts";
import { useUserProfile } from "@/hooks/queries/useProfile.ts";
import {
  useChangePassword,
  useRequestDeleteAccount,
  useUpdateProfile,
  useUploadProfileImage,
} from "@/hooks/queries/useProfileSettings.ts";

import { checkUserNameAvailability } from "@/api/services/profile.ts";
import { useAuthStore } from "@/store/useAuthStore.ts";
import { UpdateProfilePayload } from "@/types/profile.ts";

interface ProfileEditTabProps {
  userId: number;
  email: string;
}

type NameStatus = "idle" | "checking" | "available" | "taken";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "response" in error) {
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
    if (message) return message;
  }
  return fallback;
};

export const ProfileEditTab = ({ userId, email }: ProfileEditTabProps) => {
  const { toast } = useCustomToast();
  const { setUserName: setAuthUserName } = useAuthStore();

  const { data: profile } = useUserProfile(userId);

  const [userName, setUserName] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [nameStatus, setNameStatus] = useState<NameStatus>("idle");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [deleteRss, setDeleteRss] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProfile = useUpdateProfile(userId);
  const uploadImage = useUploadProfileImage();
  const changePassword = useChangePassword();
  const requestDelete = useRequestDeleteAccount();

  useEffect(() => {
    if (profile) {
      setUserName(profile.userName);
      setIntroduction(profile.introduction ?? "");
      setProfileImage(profile.profileImage ?? null);
    }
  }, [profile]);

  const initials = userName ? userName.substring(0, 2).toUpperCase() : "사용자";

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const result = await uploadImage.mutateAsync(file);
      setProfileImage(result.url);
      toast({ title: "이미지 업로드 성공", description: "저장을 눌러 변경사항을 반영하세요." });
    } catch (error) {
      toast({
        title: "이미지 업로드 실패",
        description: getErrorMessage(error, "이미지 업로드에 실패했습니다."),
        variant: "destructive",
      });
    }
  };

  const handleCheckUserName = async () => {
    const trimmed = userName.trim();
    if (!trimmed) {
      toast({ title: "닉네임을 입력해주세요.", variant: "destructive" });
      return;
    }
    if (trimmed === profile?.userName) {
      setNameStatus("available");
      return;
    }
    setNameStatus("checking");
    try {
      const exists = await checkUserNameAvailability(trimmed);
      setNameStatus(exists ? "taken" : "available");
    } catch (error) {
      setNameStatus("idle");
      toast({
        title: "중복 확인 실패",
        description: getErrorMessage(error, "중복 확인에 실패했습니다."),
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = () => {
    const payload: UpdateProfilePayload = {};
    const trimmedName = userName.trim();

    if (trimmedName !== profile?.userName) {
      if (nameStatus !== "available") {
        toast({ title: "닉네임 중복 확인을 해주세요.", variant: "destructive" });
        return;
      }
      payload.userName = trimmedName;
    }
    if (introduction !== (profile?.introduction ?? "")) {
      payload.introduction = introduction;
    }
    if (profileImage && profileImage !== (profile?.profileImage ?? null)) {
      payload.profileImage = profileImage;
    }

    if (Object.keys(payload).length === 0) {
      toast({ title: "변경사항이 없습니다." });
      return;
    }

    updateProfile.mutate(payload, {
      onSuccess: () => {
        if (payload.userName) setAuthUserName(payload.userName);
        setNameStatus("idle");
        toast({ title: "프로필 수정 성공", description: "프로필이 성공적으로 수정되었습니다." });
      },
      onError: (error) => {
        toast({
          title: "프로필 수정 실패",
          description: getErrorMessage(error, "프로필 수정에 실패했습니다."),
          variant: "destructive",
        });
      },
    });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "새 비밀번호가 일치하지 않습니다.", variant: "destructive" });
      return;
    }
    changePassword.mutate(
      { currentPassword: currentPassword || undefined, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          toast({
            title: "비밀번호 변경 성공",
            description: "비밀번호가 성공적으로 적용되었습니다.",
          });
        },
        onError: (error) => {
          toast({
            title: "비밀번호 변경 실패",
            description: getErrorMessage(error, "비밀번호 변경에 실패했습니다."),
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDeleteAccount = () => {
    requestDelete.mutate(deleteRss, {
      onSuccess: () => {
        toast({
          title: "회원 탈퇴 신청 완료",
          description: "이메일로 발송된 링크에서 탈퇴를 완료해주세요.",
        });
      },
      onError: (error) => {
        toast({
          title: "회원 탈퇴 신청 실패",
          description: getErrorMessage(error, "회원 탈퇴 신청에 실패했습니다."),
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="max-w-2xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>프로필 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6">
            <Avatar className="w-24 h-24 border-4 border-white shadow">
              {profileImage && <AvatarImage src={profileImage} alt={userName} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleImageChange}
              />
              <Button
                variant="outline"
                disabled={uploadImage.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadImage.isPending ? "업로드 중..." : "이미지 변경"}
              </Button>
              <p className="mt-2 text-xs text-gray-400">PNG, JPG, WEBP, GIF (최대 5MB)</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" value={email} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userName">닉네임</Label>
            <div className="flex space-x-2">
              <Input
                id="userName"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                  setNameStatus("idle");
                }}
                maxLength={60}
              />
              <Button
                variant="outline"
                className="shrink-0"
                disabled={nameStatus === "checking"}
                onClick={handleCheckUserName}
              >
                {nameStatus === "checking" ? "확인 중..." : "중복 확인"}
              </Button>
            </div>
            {nameStatus === "available" && <p className="text-xs text-green-600">사용 가능한 닉네임입니다.</p>}
            {nameStatus === "taken" && <p className="text-xs text-red-500">이미 사용 중인 닉네임입니다.</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="introduction">자기소개</Label>
            <Textarea
              id="introduction"
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="자기소개를 입력해주세요."
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "저장 중..." : "저장"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>비밀번호 변경</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">현재 비밀번호</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">새 비밀번호</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="8~32자, 영문/숫자/특수문자 중 2종류 이상"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleChangePassword} disabled={changePassword.isPending || !newPassword}>
              {changePassword.isPending ? "처리 중..." : "비밀번호 변경"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">회원 탈퇴</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-gray-500">탈퇴 시 계정이 영구적으로 삭제됩니다.</p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-500 border-red-300 hover:text-red-600">
                회원 탈퇴
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>정말 탈퇴하시겠습니까?</AlertDialogTitle>
                <AlertDialogDescription>
                  탈퇴 확인 링크를 이메일로 발송합니다. 링크에서 확인하면 계정이 영구적으로 삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="flex items-start justify-between gap-4 rounded-md border p-4">
                <div className="space-y-1">
                  <Label htmlFor="deleteRss" className="font-medium">
                    소유한 RSS 함께 삭제
                  </Label>
                  <p className="text-sm text-gray-500">
                    {deleteRss
                      ? "소유한 RSS와 연관 피드도 함께 삭제됩니다."
                      : "RSS는 서비스에 유지되고 소유 연결만 해제됩니다."}
                  </p>
                </div>
                <Switch
                  id="deleteRss"
                  checked={deleteRss}
                  onCheckedChange={setDeleteRss}
                  className="mt-1 shrink-0"
                />
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteAccount}
                  disabled={requestDelete.isPending}
                >
                  탈퇴 신청
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};
