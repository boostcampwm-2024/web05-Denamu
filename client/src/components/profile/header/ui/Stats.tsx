interface ProfileStatsProps {
  totalPosts: number;
  totalViews: number;
  topicsCount: number;
}

export const Stats = ({ totalPosts, totalViews, topicsCount }: ProfileStatsProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 mt-8 p-4 bg-gray-50 rounded-lg">
      <div className="text-center">
        <p className="text-2xl font-bold text-blue-600">{totalPosts}</p>
        <p className="text-sm text-gray-600">총 포스팅</p>
      </div>
      <div className="text-center border-l border-r border-gray-200">
        <p className="text-2xl font-bold text-blue-600">{totalViews.toLocaleString()}</p>
        <p className="text-sm text-gray-600">월간 조회수</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-blue-600">{topicsCount}</p>
        <p className="text-sm text-gray-600">관심 토픽</p>
      </div>
    </div>
  );
};
