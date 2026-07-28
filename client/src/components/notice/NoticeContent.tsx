import DOMPurify from "dompurify";

interface NoticeContentProps {
  content: string;
}

export const NoticeContent = ({ content }: NoticeContentProps) => {
  return <div className="prose max-w-full" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />;
};
