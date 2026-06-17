import { useEffect, useState } from "react";

import { AxiosError } from "axios";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";

import { useAdminCheck, useAdminUpdate, useAdminWithdraw } from "@/hooks/queries/useAdminAuth";

import { AdminUpdateResponse } from "@/types/auth";

const PASSWORD_REG = /^(?=.*[!@#$%^&*()_+])[A-Za-z0-9!@#$%^&*()_+]+$/;
const isValidPassword = (value: string) => PASSWORD_REG.test(value) && value.length >= 6 && value.length <= 60;
const PASSWORD_RULE_MESSAGE = "6자 이상 60자 이하, 특수문자(!@#$%^&*()_+) 1개 이상 포함해야 합니다.";

const extractErrorMessage = (error: AxiosError) => {
  const data = error.response?.data as { message?: string | string[] } | string | undefined;
  if (typeof data === "string") return data;
  const message = data?.message;
  if (Array.isArray(message)) return message.join("\n");
  return message ?? error.message;
};

export default function AdminMyPage({ onBack }: { onBack: () => void }) {
  const { data } = useAdminCheck();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [viewPassword, setViewPassword] = useState(false);

  useEffect(() => {
    if (data?.name) setName(data.name);
  }, [data?.name]);

  const onError = (error: AxiosError) => {
    alert(`수정 실패: ${extractErrorMessage(error)}`);
  };

  const { mutate: updateProfile, isPending } = useAdminUpdate((res: AdminUpdateResponse) => {
    alert(res.message);
    setIsEditing(false);
    setPassword("");
    setPasswordConfirm("");
  }, onError);

  const { mutate: updateNotification } = useAdminUpdate(() => {}, onError);

  const { mutate: withdraw, isPending: isWithdrawing } = useAdminWithdraw(
    (res) => alert(res.message),
    (error) => alert(`회원 탈퇴 요청 실패: ${extractErrorMessage(error)}`)
  );

  const handleSubmit = () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (password && !isValidPassword(password)) {
      return;
    }

    if (password && password !== passwordConfirm) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    updateProfile({
      name: name.trim(),
      ...(password ? { password } : {}),
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(data?.name ?? "");
    setPassword("");
    setPasswordConfirm("");
  };

  const handleNotificationChange = (checked: boolean) => {
    updateNotification({ emailNotification: checked });
  };

  const passwordError = password.length > 0 && !isValidPassword(password);

  if (!data) return null;

  return (
    <div className="w-full max-w-2xl mx-auto py-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="뒤로가기" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">관리자 마이페이지</h1>
        </div>
        <div className="flex gap-2">
          {isEditing && (
            <Button variant="outline" onClick={handleCancel} disabled={isPending}>
              취소
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={isPending}>
            {isEditing ? "수정 완료" : "수정하기"}
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-8 pl-12">본인 계정 정보를 확인하고 수정합니다.</p>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="MP-Email">이메일</Label>
          <Input id="MP-Email" type="email" value={data.email} disabled readOnly />
          <p className="text-xs text-muted-foreground">이메일은 변경할 수 없습니다.</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="MP-Name">이름</Label>
          <Input
            id="MP-Name"
            type="text"
            value={name}
            disabled={!isEditing}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>부모 계정 닉네임</Label>
          <Input type="text" value={data.parent ? data.parent.name : "Root 계정"} disabled readOnly />
        </div>

        <div className="flex flex-col gap-2 relative">
          <Label htmlFor="MP-Password">비밀번호</Label>
          <Input
            id="MP-Password"
            type={viewPassword ? "text" : "password"}
            value={password}
            disabled={!isEditing}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEditing ? "변경할 경우에만 입력" : ""}
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <Toggle
            aria-label="비밀번호 표시 전환"
            variant="outline"
            disabled={!isEditing}
            className="absolute right-1 bottom-0 hover:bg-transparent active:bg-transparent focus:bg-transparent"
            onPressedChange={setViewPassword}
          >
            {viewPassword ? <Eye /> : <EyeOff />}
          </Toggle>
          {passwordError && <p className="text-xs text-red-600">{PASSWORD_RULE_MESSAGE}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="MP-PasswordConfirm">비밀번호 확인</Label>
          <Input
            id="MP-PasswordConfirm"
            type={viewPassword ? "text" : "password"}
            value={passwordConfirm}
            disabled={!isEditing}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>

        <div className="flex items-center justify-between border-t pt-6">
          <div className="flex flex-col">
            <Label htmlFor="MP-Notification">이메일 수신 여부</Label>
            <span className="text-xs text-muted-foreground">알림 이메일 수신을 켜거나 끕니다.</span>
          </div>
          <Switch id="MP-Notification" checked={data.emailNotification} onCheckedChange={handleNotificationChange} />
        </div>

        <div className="flex items-center justify-between border-t border-destructive/30 pt-6">
          <div className="flex flex-col">
            <Label className="text-destructive">회원 탈퇴</Label>
            <span className="text-xs text-muted-foreground">
              탈퇴 시 본인이 생성한 하위 관리자 계정도 함께 삭제되며, 되돌릴 수 없습니다.
            </span>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isWithdrawing}>
                회원 탈퇴
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>관리자 회원 탈퇴</AlertDialogTitle>
                <AlertDialogDescription>
                  <br />
                  정말 탈퇴하시겠습니까? 입력한 이메일({data.email})로 인증 메일이 발송됩니다.
                  <br />
                  인증을 완료하면 본인 계정과 하위 관리자 계정이 모두 삭제되며, 되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={() => withdraw()}>인증 메일 발송</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
