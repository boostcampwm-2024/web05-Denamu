import { Heart } from "lucide-react";

import { useCustomToast } from "@/hooks/common/useCustomToast";

import { TOAST_MESSAGES } from "@/constants/messages";

import { useMediaStore } from "@/store/useMediaStore";

export default function LikeButton() {
  const isMobile = useMediaStore((state) => state.isMobile);
  return isMobile ? <MobileButton /> : <DesktopButton />;
}

const DesktopButton = () => {
  const { toast } = useCustomToast();

  return (
    <button
      className="flex items-center px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
      onClick={() => toast(TOAST_MESSAGES.SERVICE_NOT_PREPARED)}
    >
      <Heart className="w-4 h-4 mr-2" />
      좋아요
    </button>
  );
};
const MobileButton = () => {
  const { toast } = useCustomToast();

  return (
    <button
      className="flex flex-col items-center p-4 rounded-xl hover:bg-yellow-50 transition-colors"
      onClick={() => toast(TOAST_MESSAGES.SERVICE_NOT_PREPARED)}
    >
      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-2">
        <Heart className="w-6 h-6" />
      </div>
      <span> 좋아요</span>
    </button>
  );
};
