import { useEffect } from "react";

import { Copy } from "lucide-react";

import { Kakao } from "@/components/icons/social/Kakao";

import { useCustomToast } from "@/hooks/common/useCustomToast";

import { TOAST_MESSAGES } from "@/constants/messages.ts";

import { useMediaStore } from "@/store/useMediaStore";
import { Post } from "@/types/post";

declare global {
  interface Window {
    Kakao: any;
  }
}
type ButtonType = {
  handleCopy: () => void;
  shareKakao: () => void;
};
export default function ShareButton({ post }: { post: Post }) {
  const postUrl = `https://denamu.site/${post.id}`;
  const { toast } = useCustomToast();
  const isMobile = useMediaStore((state) => state.isMobile);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://denamu.site/${post.id}`);
      toast(TOAST_MESSAGES.COPY_COMPLETE);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (window.Kakao && window.Kakao.cleanup) {
      window.Kakao.cleanup();
    }
    window.Kakao.init("8d3c34e34749e7bd399a388d59b1af24");
  }, []);

  const shareKakao = () => {
    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: post.title,
        imageUrl: post.thumbnail,
        link: {
          webUrl: postUrl,
        },
      },
    });
  };
  return isMobile ? (
    <MobileButton handleCopy={handleCopy} shareKakao={shareKakao} />
  ) : (
    <DesktopButton handleCopy={handleCopy} shareKakao={shareKakao} />
  );
}

const DesktopButton = ({ handleCopy, shareKakao }: ButtonType) => {
  return (
    <div className="flex gap-3">
      <button
        onClick={handleCopy}
        className="flex items-center px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <Copy className="w-4 h-4 mr-2" />
        링크 복사
      </button>

      <button
        className="flex items-center px-4 py-2 rounded-full bg-yellow-300 hover:bg-yellow-400 transition-colors"
        onClick={shareKakao}
      >
        <Kakao className="w-4 h-4 mr-2" />
        카카오톡 공유하기
      </button>
    </div>
  );
};
const MobileButton = ({ handleCopy, shareKakao }: ButtonType) => {
  return (
    <div className="flex gap-3">
      <button
        onClick={handleCopy}
        className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-colors"
      >
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-2">
          <Copy className="w-6 h-6 text-gray-700" />
        </div>
        <span>링크 복사</span>
      </button>

      <button
        className="flex flex-col items-center p-4 rounded-xl hover:bg-yellow-50 transition-colors"
        onClick={shareKakao}
      >
        <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center mb-2">
          <Kakao className="w-6 h-6 " />
        </div>
        <span>카카오톡</span>
      </button>
    </div>
  );
};
