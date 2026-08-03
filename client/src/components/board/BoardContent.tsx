import DOMPurify from "dompurify";

interface BoardContentProps {
  content: string;
}

export const BoardContent = ({ content }: BoardContentProps) => {
  return (
    <div
      className="prose max-w-full prose-p:my-2 [&_p:empty]:min-h-[1.75em]"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
    />
  );
};
