import React from "react";

import { X } from "lucide-react";

interface FixedHeaderProps {
  title: string;
  onClose: () => void;
  scrollbarWidth: number;
}

export const FixedHeader = React.memo(({ title, onClose, scrollbarWidth }: FixedHeaderProps) => (
  <div
    className="fixed top-0 left-1/2 w-[90%] max-w-4xl bg-gray-200 border-b flex justify-between items-center z-20"
    style={{ transform: `translateX(calc(-50% - ${scrollbarWidth / 2}px))` }}
  >
    <h2 className="text-lg font-semibold truncate p-4">{title}</h2>
    <button onClick={onClose} className="p-4 hover:bg-gray-100 transition-colors" aria-label="Close modal">
      <X size={20} />
    </button>
  </div>
));

FixedHeader.displayName = "FixedHeader";
