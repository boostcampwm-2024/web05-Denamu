import { CheckCircle2 } from "lucide-react";

interface ProfileHeaderBannerProps {
  lastPosted: string;
}

export const Banner = ({ lastPosted }: ProfileHeaderBannerProps) => {
  return (
    <div className="bg-blue-500 px-6 py-2 text-white flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <CheckCircle2 className="w-5 h-5" />
        <span>인증된 RSS 블로거</span>
      </div>
      <span className="text-sm">마지막 포스팅: {lastPosted}</span>
    </div>
  );
};
