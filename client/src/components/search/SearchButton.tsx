import { Search } from "lucide-react";

export default function SearchButton({ handleSearchModal }: { handleSearchModal: () => void }) {
  return (
    <button
      className="w-full px-4 py-3 
                   bg-white 
                   border border-primary 
                   rounded-xl 
                   shadow-sm 
                   cursor-pointer
                   text-primary
                   flex 
                   justify-between 
                   items-center 
                   hover:bg-primary/5 
                   max-w-[400px]
                   hover:bg-seconary
                   "
      onClick={handleSearchModal}
    >
      <span className="text-sm font-medium">검색</span>
      <Search size={16} className="text-primary group-hover:text-secondary transition-colors" />
    </button>
  );
}
