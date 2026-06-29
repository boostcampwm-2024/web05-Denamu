import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { useUserCertification } from "@/hooks/common/useUserCertification";

export default function UserCertificate() {
  const navigate = useNavigate();
  const { isLoading, isSuccess } = useUserCertification();

  const handleGoToLogin = () => {
    navigate("/signin");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>{isLoading ? "인증 처리 중..." : isSuccess ? "인증 성공" : "인증 실패"}</CardTitle>
          <CardDescription>
            {isLoading
              ? "회원가입 인증을 처리하고 있습니다."
              : isSuccess
                ? "회원가입이 완료되었습니다."
                : "회원가입 인증에 실패했습니다."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : isSuccess ? (
            <div className="text-center text-green-600">
              <p>이제 로그인해 서비스를 이용할 수 있습니다.</p>
            </div>
          ) : (
            <div className="text-center text-red-600">
              <p>인증 링크가 만료되었거나 유효하지 않습니다.</p>
              <p>다시 회원가입을 진행해주세요.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!isLoading && (
            <Button onClick={handleGoToLogin} disabled={isLoading}>
              {isSuccess ? "로그인하기" : "홈으로 가기"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
