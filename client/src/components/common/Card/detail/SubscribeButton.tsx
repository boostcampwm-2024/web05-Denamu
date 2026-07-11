import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { QueryKey } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Rss } from "lucide-react";

import { useCustomToast } from "@/hooks/common/useCustomToast.ts";
import { useToggleSubscription } from "@/hooks/queries/useSubscription.ts";

import { cn } from "@/lib/utils.ts";

import { useAuthStore } from "@/store/useAuthStore.ts";

interface SubscribeButtonProps {
  rssId: number;
  isSubscribed: boolean;
  invalidateKeys?: QueryKey[];
}

export const SubscribeButton = ({ rssId, isSubscribed, invalidateKeys = [] }: SubscribeButtonProps) => {
  const navigate = useNavigate();
  const { toast } = useCustomToast();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [subscribed, setSubscribed] = useState(isSubscribed);
  const toggleMutation = useToggleSubscription(rssId, invalidateKeys);
  
  useEffect(() => {
    setSubscribed(isSubscribed);
  }, [isSubscribed]);

  const handleClick = () => {
    if (!isAuthenticated) {
      toast({ title: "로그인이 필요합니다", description: "구독하려면 로그인해주세요." });
      navigate("/signin");
      return;
    }
    if (toggleMutation.isPending) return;

    const prev = subscribed;
    setSubscribed(!prev);
    toggleMutation.mutate(prev, {
      onError: () => {
        setSubscribed(prev);
        toast({ title: "요청 실패", description: "다시 시도해주세요." });
      },
    });
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={toggleMutation.isPending}
      whileTap={{ scale: 0.92 }}
      animate={subscribed ? { scale: [1, 1.12, 1] } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      aria-pressed={subscribed}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
        subscribed
          ? "bg-[#FF870D] text-white hover:bg-[#e6790b]"
          : "border border-[#FF870D] text-[#FF870D] hover:bg-[#FF870D]/10"
      )}
    >
      {subscribed ? <Check className="w-4 h-4" /> : <Rss className="w-4 h-4" />}
      {subscribed ? "구독 중" : "구독"}
    </motion.button>
  );
};
