import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { useAdminWithdrawCertification } from "@/hooks/common/useAdminWithdrawCertification";

export default function AdminWithdraw() {
  const navigate = useNavigate();
  const { isLoading, isSuccess } = useAdminWithdrawCertification();

  const handleGoToAdmin = () => {
    navigate("/admin");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>{isLoading ? "탈퇴 처리 중..." : isSuccess ? "탈퇴 완료" : "탈퇴 실패"}</CardTitle>
          <CardDescription>
            {isLoading
              ? "관리자 회원탈퇴를 처리하고 있습니다."
              : isSuccess
                ? "관리자 계정 탈퇴가 완료되었습니다."
                : "관리자 회원탈퇴에 실패했습니다."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : isSuccess ? (
            <div className="text-center text-green-600">
              <p>그동안 Denamu를 이용해 주셔서 감사합니다.</p>
              <p>본인이 생성한 하위 관리자 계정도 함께 삭제되었습니다.</p>
            </div>
          ) : (
            <div className="text-center text-red-600">
              <p>인증 링크가 만료되었거나 유효하지 않습니다.</p>
              <p>관리자 페이지에서 탈퇴를 다시 요청해주세요.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!isLoading && (
            <Button onClick={handleGoToAdmin} disabled={isLoading}>
              관리자 페이지로 가기
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
