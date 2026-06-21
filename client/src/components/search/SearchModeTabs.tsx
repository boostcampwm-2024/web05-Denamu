import { FileText, Users } from "lucide-react";

import { cn } from "@/lib/utils";

import { useSearchStore } from "@/store/useSearchStore";
import { SearchMode } from "@/types/search";

interface ModeOption {
  label: string;
  mode: SearchMode;
  icon: JSX.Element;
}

const modeOptions: ModeOption[] = [
  { label: "게시글", mode: "feed", icon: <FileText size={16} /> },
  { label: "유저", mode: "user", icon: <Users size={16} /> },
];

export default function SearchModeTabs() {
  const { searchMode, setSearchMode, setPage } = useSearchStore();

  const handleModeClick = (mode: SearchMode) => {
    if (mode === searchMode) return;
    setSearchMode(mode);
    setPage(1);
  };

  return (
    <div className="my-3 inline-flex w-full gap-1 rounded-lg bg-gray-100 p-1">
      {modeOptions.map(({ label, mode, icon }) => (
        <button
          key={mode}
          onClick={() => handleModeClick(mode)}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm transition-all duration-200",
            mode === searchMode
              ? "bg-white font-semibold text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-800"
          )}
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
