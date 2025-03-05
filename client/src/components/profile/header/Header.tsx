import { Avatar, Banner, Info, Stats } from "@/components/profile/header/index";
import { ActivityGraph } from "@/components/profile/header/ui/ActivityGraph/ActivityGraph.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";

import { User } from "@/types/profile.ts";

interface ProfileHeaderProps {
  user: User;
}

export const Header = ({ user }: ProfileHeaderProps) => {
  return (
    <Card className="mb-8 overflow-hidden">
      {user.rssRegistered && <Banner lastPosted={user.lastPosted} />}

      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex space-x-6">
            <Avatar user={user} />
            <Info user={user} />
          </div>
        </div>
        <Stats totalPosts={user.totalPosts} totalViews={user.totalViews} topicsCount={user.topics.length} />
        <div className="mt-6">
          <ActivityGraph dailyActivities={user.dailyActivities} />
        </div>
      </CardContent>
    </Card>
  );
};
