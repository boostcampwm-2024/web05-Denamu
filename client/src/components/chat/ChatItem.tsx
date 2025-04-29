import Avvvatars from "avvvatars-react";
import clsx from "clsx";

import { Avatar } from "@/components/ui/avatar";

import { formatDate } from "@/utils/date";
import { formatTime } from "@/utils/time";

import { ChatType } from "@/types/chat";

type ChatItemProps = {
  chatItem: ChatType;
  isSameUser: boolean;
};

const chatStyle = "p-3 bg-gray-200 text-black break-words whitespace-pre-wrap rounded-md inline-block max-w-[90%]";
export default function ChatItem({ chatItem, isSameUser }: ChatItemProps) {
  const isUser = localStorage.getItem("userID") === chatItem.userId;
  if (chatItem.username === "system")
    return <div className="flex justify-center">{formatDate(chatItem.timestamp)}</div>;
  return (
    <div className="flex flex-col ">
      {!isSameUser ? (
        <span className={clsx("flex gap-1 items-center", isUser ? "justify-end" : "justify-start")}>
          {!isUser && (
            <Avatar>
              <Avvvatars value={chatItem.username} style="shape" />
            </Avatar>
          )}

          <span className="flex gap-2 items-center">
            <span className="text-sm">{isUser ? "나" : chatItem.username}</span>
            <span className="text-xs">{formatTime(chatItem.timestamp)}</span>
          </span>
        </span>
      ) : (
        <></>
      )}
      {!isUser && (
        <div className="w-full ml-[2rem]">
          {!isSameUser ? (
            <FirstChat message={chatItem.message} isUser={isUser} />
          ) : (
            <OtherChat message={chatItem.message} />
          )}
        </div>
      )}
      {isUser && (
        <div className="w-full  flex justify-end">
          {!isSameUser ? (
            <FirstChat message={chatItem.message} isUser={isUser} />
          ) : (
            <OtherChat message={chatItem.message} />
          )}
        </div>
      )}
    </div>
  );
}

function FirstChat({ message, isUser }: { message: string; isUser: boolean }) {
  return (
    <span className={`${chatStyle} relative `}>
      {message}
      <div
        className={clsx(
          "absolute top-[-5px] w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px]",
          isUser ? "right-[0px]" : "left-[0px]"
        )}
      ></div>
    </span>
  );
}

function OtherChat({ message }: { message: string }) {
  return <span className={`${chatStyle}`}>{message}</span>;
}
