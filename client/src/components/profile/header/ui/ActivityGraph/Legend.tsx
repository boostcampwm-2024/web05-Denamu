export const Legend = () => (
  <div className="mt-4 flex items-center text-xs text-gray-500 space-x-2">
    <span>Less</span>
    <div className="flex space-x-0.5">
      <div className="w-3 h-3 bg-gray-100 rounded-sm" />
      <div className="w-3 h-3 bg-green-200 rounded-sm" />
      <div className="w-3 h-3 bg-green-300 rounded-sm" />
      <div className="w-3 h-3 bg-green-400 rounded-sm" />
      <div className="w-3 h-3 bg-green-500 rounded-sm" />
    </div>
    <span>More</span>
  </div>
);
