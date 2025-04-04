import { TriangleAlert } from "lucide-react";

export default function EmptyPost() {
  return (
    <div className="flex flex-1 flex-col justify-center items-center gap-3">
      <div className="bg-gray-300 p-5 rounded-full flex justify-center items-center">
        <TriangleAlert color="gray" />
      </div>
      <div className="flex flex-col items-center ">
        <p className="font-bold">오늘의 트렌딩 포스트가 없습니다.</p>
        <p className="text-gray-400 font-bold">여러분의 읽은 글이 인기 포스트로 올라갈 수 있어요!</p>
      </div>
    </div>
  );
}
