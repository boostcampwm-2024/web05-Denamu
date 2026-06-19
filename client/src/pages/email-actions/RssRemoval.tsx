import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { useRssRemoval } from "@/hooks/common/useRssRemoval";

export default function RssRemoval() {
  const navigate = useNavigate();
  const { hasCode, isDeleting, isSuccess, confirmRemoval } = useRssRemoval();

  const handleGoToHome = () => {
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>
            {!hasCode ? "삭제 실패" : isDeleting ? "삭제 처리 중..." : isSuccess ? "삭제 완료" : "RSS 삭제 확인"}
          </CardTitle>
          <CardDescription>
            {!hasCode
              ? "유효하지 않은 인증 링크입니다."
              : isDeleting
                ? "RSS 삭제를 처리하고 있습니다."
                : isSuccess
                  ? "RSS 삭제가 완료되었습니다."
                  : "아래 버튼을 누르면 RSS가 삭제됩니다."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasCode ? (
            <div className="text-center text-red-600">
              <p>유효하지 않은 삭제 링크입니다.</p>
              <p>데나무 사이트에서 삭제를 다시 요청해주세요.</p>
            </div>
          ) : isDeleting ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : isSuccess ? (
            <div className="text-center text-green-600">
              <p>해당 RSS 정보가 삭제되었습니다.</p>
            </div>
          ) : (
            <div className="text-center text-red-600">
              <p className="font-bold">⚠️ 삭제 후에는 복구할 수 없습니다.</p>
              <p>정말 삭제하시려면 아래 버튼을 눌러주세요.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          {hasCode && !isSuccess && !isDeleting && (
            <>
              <Button variant="destructive" onClick={confirmRemoval}>
                삭제 확인
              </Button>
              <Button variant="outline" onClick={handleGoToHome}>
                취소
              </Button>
            </>
          )}
          {(!hasCode || isSuccess) && <Button onClick={handleGoToHome}>홈으로 가기</Button>}
        </CardFooter>
      </Card>
    </div>
  );
}
