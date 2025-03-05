import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const tagStyle = "text-[12px] text-[#6B7280] inline-block rounded-lg border border-[#E2E8F0] mr-[5px] px-2";

export default function PostTag({ tags }: { tags: string[] }) {
  if (tags.length <= 2) {
    return <SimpleTagList tags={tags} />;
  } else {
    return <EllipsisTagList tags={tags} />;
  }
}

export function SimpleTagList({ tags }: { tags: string[] }) {
  return (
    <>
      {tags.map((tag, index) => (
        <span key={index} className={tagStyle}>
          # {tag}
        </span>
      ))}
    </>
  );
}
function EllipsisTagList({ tags }: { tags: string[] }) {
  const firstTag = tags[0];
  const secondTag = tags[1];
  const extraCount = tags.length - 2;
  const extraTags = tags.slice(2);
  return (
    <>
      <span className={tagStyle}># {firstTag}</span>
      <span className={tagStyle}># {secondTag}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className={tagStyle}>+{extraCount}</TooltipTrigger>
          <TooltipContent>
            <SimpleTagList tags={extraTags} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
