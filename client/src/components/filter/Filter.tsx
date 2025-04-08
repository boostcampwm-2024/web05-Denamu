import { useState } from "react";

import { Badge } from "@/components/ui/badge";

import { FILTER } from "@/constants/filter";

import { useFilterStore } from "@/store/useFilterStore";

export default function Filter() {
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  return (
    <div className={`mt-4 ${filterOpen ? "md:p-6" : "md: px-6"} md:pt-0 rounded-lg flex flex-col gap-3`}>
      <div className="flex gap-6">
        <span className="font-bold">태그로 필터링 하기</span>
        <button
          onClick={() => {
            setFilterOpen(!filterOpen);
          }}
          className="text-sm text-red-400"
        >
          {filterOpen ? "닫기" : "열기"}
        </button>
      </div>
      {filterOpen && <Filters />}
    </div>
  );
}

function Filters() {
  const { filters: pickedFilter, addFilter, removeFilter, addALL, removeAll } = useFilterStore();
  const commonClass = ` w-fit sm:text-sm md:text-md select-none cursor-pointer`;
  return (
    <ul className="flex flex-wrap gap-x-2 gap-y-2 place-items-start w-fit gap-1 ">
      <Badge
        className={`${pickedFilter.length === FILTER.length ? "bg-primary" : "bg-gray-400 hover:bg-gray-500"} ${commonClass}`}
        onClick={() => (pickedFilter.length === FILTER.length ? removeAll() : addALL())}
      >
        전체
      </Badge>
      {FILTER.map((filter, index) => (
        <Badge
          key={index}
          className={`${pickedFilter.includes(filter) ? "bg-primary" : "bg-gray-400 hover:bg-gray-500"} ${commonClass}`}
          onClick={() => (pickedFilter.includes(filter) ? removeFilter(filter) : addFilter(filter))}
        >
          {filter}
        </Badge>
      ))}
    </ul>
  );
}
