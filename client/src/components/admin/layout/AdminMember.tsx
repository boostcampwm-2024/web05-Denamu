import { useState } from "react";

import { AxiosError } from "axios";
import { Eye, EyeOff, Trash2 } from "lucide-react";

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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";

import { useAdminChildDelete, useAdminChildren, useAdminRegister } from "@/hooks/queries/useAdminAuth";

import { DeleteChildResponse, RegisterResponse, RegisterRequest } from "@/types/admin";

export default function AdminMember() {
  const [viewPassword, setViewPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<RegisterRequest>({ loginId: "", password: "", name: "" });

  const onSuccess = (data: RegisterResponse) => {
    alert(`관리자 등록 성공: ${data.message}`);
    setFormData({ loginId: "", password: "", name: "" });
  };

  const onError = (error: AxiosError) => {
    const errorMessage =
      typeof error.response?.data === "string" ? error.response.data : error.response?.data || error.message;
    alert(`관리자 등록 실패: ${JSON.stringify(errorMessage)}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onDeleteSuccess = (data: DeleteChildResponse) => {
    alert(`관리자 삭제 성공: ${data.message}`);
  };

  const onDeleteError = (error: AxiosError) => {
    const errorMessage =
      typeof error.response?.data === "string" ? error.response.data : error.response?.data || error.message;
    alert(`관리자 삭제 실패: ${JSON.stringify(errorMessage)}`);
  };

  const { mutate } = useAdminRegister(onSuccess, onError);
  const { data: children, isLoading: isChildrenLoading } = useAdminChildren();
  const { mutate: deleteChild } = useAdminChildDelete(onDeleteSuccess, onDeleteError);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(formData);
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row items-center justify-center gap-8 py-8">
      <Card className="shadow">
        <CardHeader>
          <CardTitle>관리자 계정 생성</CardTitle>
          <CardDescription>새로운 관리자 계정을 생성합니다.</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} autoCapitalize="off" autoCorrect="off" className="w-[30rem]">
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="R-ID">ID</Label>
              <Input
                type="text"
                autoComplete="off"
                id="R-ID"
                value={formData.loginId}
                onChange={(e) => handleChange(e, "loginId")}
                className="appearance-none"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="R-Name">이름</Label>
              <Input
                type="text"
                required
                autoComplete="off"
                id="R-Name"
                value={formData.name}
                onChange={(e) => handleChange(e, "name")}
                className="appearance-none"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
            <div className="flex flex-col gap-2 relative">
              <Label htmlFor="R-Password">Password</Label>
              <Input
                type={viewPassword ? "text" : "password"}
                id="R-Password"
                autoComplete="off"
                value={formData.password}
                onChange={(e) => handleChange(e, "password")}
                className="appearance-none"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              <Toggle
                aria-label="Toggle bold"
                variant={"outline"}
                className="absolute right-1 bottom-0 hover:bg-transparent active:bg-transparent focus:bg-transparent"
                onPressedChange={setViewPassword}
              >
                {viewPassword ? <Eye /> : <EyeOff />}
              </Toggle>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit">가입</Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="shadow w-[30rem]">
        <CardHeader>
          <CardTitle>내가 만든 계정</CardTitle>
          <CardDescription>내가 생성한 관리자 계정 목록입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {isChildrenLoading ? (
            <p className="text-sm text-muted-foreground">불러오는 중...</p>
          ) : !children || children.length === 0 ? (
            <p className="text-sm text-muted-foreground">생성한 계정이 없습니다.</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {children.map((child) => (
                <li key={child.id} className="flex items-center justify-between py-3">
                  <div className="flex flex-col">
                    <span className="font-medium">{child.name}</span>
                    <span className="text-sm text-muted-foreground">{child.loginId}</span>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`${child.name} 삭제`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>관리자 계정 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                          <span className="font-medium">{child.name}</span> ({child.loginId}) 계정을 삭제하시겠습니까?
                          <br />이 계정이 생성한 하위 관리자 계정도 함께 삭제되며, 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteChild(child.id)}>삭제</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
