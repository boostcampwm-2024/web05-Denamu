import { useState } from "react";

import clsx from "clsx";

import { CATEGORIES, CATEGORIES_KEY, CATEGORIES_MAP } from "@/constants/filter";

import { useFilterStore } from "@/store/useFilterStore";

export default function Filter() {
  const [lastActiveCategory, setLastActiveCategory] = useState<string>("FrontEnd");
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const handleFilterOpen = () => {
    setFilterOpen(!filterOpen);
  };

  const handleCategoryChange = (category: string) => {
    setLastActiveCategory(category);
  };

  return (
    <div className={`px-4 md:px-0 mt-0 md:pt-3 rounded-lg flex flex-col gap-1`}>
      <div className="flex gap-6">
        <span className="font-bold">카테고리</span>
        <button className="text-sm text-red-400" onClick={handleFilterOpen}>
          {filterOpen ? "닫기" : "열기"}
        </button>
      </div>
      {filterOpen && (
        <Filters
          filters={CATEGORIES[CATEGORIES_MAP[lastActiveCategory as keyof typeof CATEGORIES_MAP]]}
          keys={CATEGORIES_KEY}
          activeCategory={lastActiveCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}
    </div>
  );
}

function Filters({
  filters,
  keys,
  activeCategory,
  onCategoryChange,
}: {
  filters: string[];
  keys: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}) {
  const { filters: pickedFilter, addFilter, removeFilter } = useFilterStore();
  const commonClass = `w-fit select-none cursor-pointer`;
  return (
    <div className="flex flex-col">
      <ul className="py-2 flex gap-2">
        {keys.map((category, index) => (
          <li
            key={index}
            onClick={() => onCategoryChange(category)}
            className={clsx(
              "px-1 md:px-3 py-1 rounded cursor-pointer transition text-xs md:text-base",
              category === activeCategory ? "bg-secondary text-white" : "bg-white fext-secondary hover:bg-gray-100"
            )}
          >
            {category}
          </li>
        ))}
      </ul>
      <ul className="flex flex-wrap gap-x-2 gap-y-2 place-items-start w-fit gap-1 py-2">
        {filters.map((filter, index) => (
          <li
            key={index}
            className={clsx(
              pickedFilter.includes(filter) ? "bg-primary text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800",
              commonClass,
              "px-2 md:px-3 text-xs md:text-sm  py-1 rounded-full "
            )}
            onClick={() => (pickedFilter.includes(filter) ? removeFilter(filter) : addFilter(filter))}
          >
            {filter}
          </li>
        ))}
      </ul>
    </div>
  );
}
