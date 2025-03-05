import { Rss } from "lucide-react";

import { Section } from "@/components/profile/common/Section.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";

import { User } from "@/types/profile.ts";

interface ProfileRecentPostsProps {
  user: User;
}

export const RecentPosts = ({ user }: ProfileRecentPostsProps) => {
  if (!user.rssRegistered) {
    return (
      <section id="recent-posts">
        <Card className="mb-8 overflow-hidden">
          <CardContent className="p-8 text-center">
            <Rss className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">RSS 피드를 등록해보세요!</h3>
            <p className="text-gray-600 mb-4">블로그 RSS를 등록하고 더 많은 독자들과 만나보세요.</p>
            <Button>
              <Rss className="w-4 h-4 mr-2" />
              RSS 등록하기
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section id="recent-posts">
      <Section title="최근 작성한 글" />
    </section>
  );
};
