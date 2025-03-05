import { CheckCircle2 } from "lucide-react";

import { Avatar as AvatarUI, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";

import { User } from "@/types/profile.ts";

interface ProfileHeaderAvatarProps {
  user: User;
}

export const Avatar = ({ user }: ProfileHeaderAvatarProps) => {
  return (
    <div className="relative w-24 h-24">
      <AvatarUI className="w-24 h-24 border-4 border-white">
        <AvatarImage src={user.avatar} />
        <AvatarFallback>KD</AvatarFallback>
      </AvatarUI>
      {user.rssRegistered && (
        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
          <CheckCircle2 className="w-5 h-5 text-blue-500" />
        </div>
      )}
    </div>
  );
};
