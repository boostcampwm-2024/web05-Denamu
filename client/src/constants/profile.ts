import type { User } from "@/types/profile";

const generateDailyActivities = () => {
  const activities = [];
  const today = new Date();

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const randomVariation = Math.floor(Math.random() * 10);
    const recencyBoost = Math.floor((364 - i) / 60);

    activities.push({
      date: date.toISOString().split("T")[0],
      viewCount: randomVariation + recencyBoost,
    });
  }

  return activities;
};

export const mockUser: User = {
  name: "채준혁",
  email: "cjh4302@gmail.com",
  avatar: "https://avatars.githubusercontent.com/u/18231524?v=4",
  bio: "Frontend Developer | Denamu | Kyungpook Nat'l Univ. CSE 21",
  blogUrl: "https://laurent.tistory.com",
  rssRegistered: true,
  lastPosted: "2024-02-18",
  totalPosts: 256,
  totalViews: 401262,
  topics: ["JavaScript", "React", "TypeScript"],
  dailyActivities: generateDailyActivities(),
  streakCount: 23,
  longestStreak: 45,
};
