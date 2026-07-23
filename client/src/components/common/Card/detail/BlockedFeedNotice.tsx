import { Ban } from "lucide-react";

export const BlockedFeedNotice = () => (
  <div className="flex flex-col items-center justify-center py-32 text-center">
    <Ban className="w-12 h-12 mb-4 text-gray-400" />
    <h2 className="text-xl font-semibold text-gray-800">차단된 RSS의 게시글입니다.</h2>
  </div>
);
