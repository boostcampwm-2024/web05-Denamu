import DOMPurify from "dompurify";

interface BoardContentProps {
  content: string;
}

export const BoardContent = ({ content }: BoardContentProps) => {
  return <div className="prose max-w-full" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />;
};
