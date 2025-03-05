import { FileText, User, PanelBottom } from "lucide-react";

import { CommandGroup } from "@/components/ui/command";

import { useSearchStore } from "@/store/useSearchStore";
import { FilterType } from "@/types/search";

interface FilterOption {
  label: string;
  filter: FilterType;
  icon: JSX.Element;
}

export default function FilterButton() {
  const { currentFilter, setFilter, setPage } = useSearchStore();

  const filterOptions: FilterOption[] = [
    { label: "제목", filter: "title", icon: <FileText size={16} /> },
    { label: "블로거", filter: "blogName", icon: <User size={16} /> },
    { label: "블로거 + 제목", filter: "all", icon: <PanelBottom size={16} /> },
  ];

  const getItemClassName = (isActive: boolean) =>
    `rounded px-4 py-2 text-sm flex items-center gap-2 cursor-pointer ${
      isActive ? "bg-accent " : "bg-white hover:bg-gray-100 transition-colors duration-200"
    }`;

  const handleFilterClick = (filter: FilterType) => {
    setFilter(filter);
    setPage(1);
  };

  return (
    <CommandGroup heading="필터">
      <div className="flex flex-col gap-1">
        {filterOptions.map(({ label, filter, icon }) => (
          <button
            key={filter}
            className={getItemClassName(currentFilter === filter)}
            onClick={() => handleFilterClick(filter)}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </CommandGroup>
  );
}
