import { useEffect, useState } from "react";

import { RotateCw } from "lucide-react";

import { useUpdatePost } from "@/hooks/queries/useUpdatePost";

const calculateTime = () => {
  const now = new Date();
  const currentMinutes = now.getMinutes();

  const targetMinutes = currentMinutes < 31 ? 31 : 1;
  let targetHours = now.getHours();

  if (currentMinutes >= 31) {
    targetHours = (targetHours + 1) % 24;
  }

  const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHours, targetMinutes, 0);
  return Math.floor((targetTime.getTime() - now.getTime()) / 1000);
};

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} 초`;
};

export default function LatestSectionTimer() {
  const { mutate, isPending, isError } = useUpdatePost();
  const [timer, setTimer] = useState<number>(calculateTime);

  useEffect(() => {
    const interval = setInterval(() => {
      const time = calculateTime();
      setTimer(time);
      if (time === 0) mutate();
    }, 1000);

    return () => clearInterval(interval);
  }, [mutate]);

  return (
    <span className="text-sm text-gray-500 bg-gray-50 p-2 rounded-lg mr-5">
      {isError && <button onClick={() => mutate()}>reload</button>}
      {isPending ? <RotateCw /> : <span>{formatTime(timer)} 후 업데이트</span>}
    </span>
  );
}
