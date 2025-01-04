import { useEffect, useState } from "react";

import { RotateCw } from "lucide-react";

import { useUpdatePost } from "@/hooks/queries/useUpdatePost";

import { UpdatePostsApiResponse } from "@/types/post";
import { Post } from "@/types/post";
import { useQueryClient } from "@tanstack/react-query";

export default function LatestSectionTimer() {
  const queryClient = useQueryClient();
  const update = useUpdatePost();
  const [timer, setTimer] = useState<number>(0);

  const calculateTime = () => {
    const now = new Date();
    const currentMinutes = now.getMinutes();

    const targetMinutes = currentMinutes < 31 ? 31 : 1;
    let targetHours = now.getHours();

    if (currentMinutes >= 31) {
      targetHours = (targetHours + 1) % 24;
    }

    const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHours, targetMinutes, 0);
    const remainingTime = Math.floor((targetTime.getTime() - now.getTime()) / 1000);

    return remainingTime;
  };

  useEffect(() => {
    setTimer(calculateTime());
    const interval = setInterval(() => {
      const time = calculateTime();
      setTimer(time);
      if (time === 0) {
        handleUpdate();
        setTimer(calculateTime());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = async () => {
    const oldPosts = queryClient.getQueryData<{
      pageParams: number;
      pages: { hasMore: boolean; lastId: string; result: Post[] }[];
    }>(["latest-posts"]);
    if (update.data && oldPosts) {
      oldPosts.pages.forEach((oldPost) =>
        oldPost.result.forEach((post) => {
          post.isNew = false;
        })
      );
      queryClient.setQueryData(["latest-posts"], {
        ...oldPosts,
        pages: [
          {
            ...oldPosts.pages[0],
            result: [...update.data.data, ...oldPosts.pages[0].result],
          },
        ],
      });
    }
  };

  return <Timer time={timer} handleUpdate={handleUpdate} update={update} />;
}

function Timer({
  time,
  handleUpdate,
  update,
}: {
  time: number;
  handleUpdate: () => void;
  update: { data?: UpdatePostsApiResponse; isLoading: boolean; error: Error | null };
}) {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} 초`;
  };

  return (
    <span className="text-sm text-gray-500 bg-gray-50 p-2 rounded-lg mr-5">
      {update.error && <button onClick={handleUpdate}>reload</button>}
      {update.isLoading ? <RotateCw /> : <span>{formatTime(time)} 후 업데이트</span>}
    </span>
  );
}
