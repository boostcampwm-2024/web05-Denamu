import Avvvatars from "avvvatars-react";

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
  if (chatItem.username === "system")
    return <div className="flex justify-center">{formatDate(chatItem.timestamp)}</div>;
  return (
    <div className="flex flex-col ">
      {!isSameUser ? (
        <span className="flex gap-1 items-center text-left">
          <Avatar>
            <Avvvatars value={chatItem.username} style="shape" />
          </Avatar>
          {/* 이름, 시간 */}
          <span className="flex gap-2 items-center inline-block">
            <span className="text-sm">{chatItem.username}</span>
            <span className="text-xs">{formatTime(chatItem.timestamp)}</span>
          </span>
        </span>
      ) : (
        <></>
      )}
      <div className="w-full ml-[2rem]">
        {!isSameUser ? <FirstChat message={chatItem.message} /> : <OtherChat message={chatItem.message} />}
      </div>
    </div>
  );
}

function FirstChat({ message }: { message: string }) {
  return (
    <span className={`${chatStyle} relative `}>
      {message}
      <div className="absolute top-[-5px] left-[0px] w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px]"></div>
    </span>
  );
}

function OtherChat({ message }: { message: string }) {
  return <span className={`${chatStyle}`}>{message}</span>;
}
