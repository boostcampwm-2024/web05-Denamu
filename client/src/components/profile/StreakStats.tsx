interface StreakStatsProps {
  maxStreak: number;
  currentStreak: number;
  totalViews: number;
}

const stats = (maxStreak: number, currentStreak: number, totalViews: number) => [
  { label: "최장 스트릭", value: `${maxStreak.toLocaleString()}일` },
  { label: "현재 스트릭", value: `${currentStreak.toLocaleString()}일` },
  { label: "총 읽은 수", value: totalViews.toLocaleString() },
];

export const StreakStats = ({ maxStreak, currentStreak, totalViews }: StreakStatsProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {stats(maxStreak, currentStreak, totalViews).map((stat) => (
        <div key={stat.label} className="p-4 text-center bg-white border-0 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
          <p className="mt-1 text-sm text-gray-600">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};
