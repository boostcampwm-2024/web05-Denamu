import { Edit } from "lucide-react";

import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";

import { User } from "@/types/profile.ts";

interface ProfileHeaderInfoProps {
  user: User;
}

export const Info = ({ user }: ProfileHeaderInfoProps) => {
  return (
    <div>
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <Button variant="outline" size="sm" className="flex items-center">
          <Edit className="w-4 h-4 mr-2" />
          프로필 수정
        </Button>
      </div>
      <p className="text-gray-600 mt-1">{user.email}</p>
      {user.blogUrl && (
        <a href={user.blogUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 mt-2 hover:underline">
          {user.blogUrl}
        </a>
      )}
      <p className="text-gray-800 mt-4">{user.bio}</p>
      <div className="flex flex-wrap gap-2 mt-4">
        {user.topics.map((topic) => (
          <Badge key={topic} variant="secondary">
            {topic}
          </Badge>
        ))}
      </div>
    </div>
  );
};
