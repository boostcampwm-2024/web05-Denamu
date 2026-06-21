import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";

interface ProfileHeaderProps {
  name: string;
  email: string;
  profileImage: string | null;
  introduction: string | null;
}

export const ProfileHeader = ({ name, email, profileImage, introduction }: ProfileHeaderProps) => {
  const initials = name ? name.substring(0, 2).toUpperCase() : "사용자";

  return (
    <Card className="mb-8 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start space-x-6">
          <Avatar className="flex-shrink-0 w-24 h-24 border-4 border-white shadow">
            {profileImage && <AvatarImage src={profileImage} alt={name} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{name}</h1>
            {email && <p className="mt-1 text-gray-600">{email}</p>}
            <p className="mt-4 text-gray-800 whitespace-pre-wrap">
              {introduction ? introduction : <span className="text-gray-400">자기소개가 없습니다.</span>}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
