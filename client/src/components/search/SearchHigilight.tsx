import { useMemo } from "react";

interface SearchHighlightProps {
  text: string;
  highlight: string;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function SearchHighlight({ text, highlight }: SearchHighlightProps) {
  const parts = useMemo(() => {
    if (!highlight) return [text];
    const escapedHighlight = escapeRegExp(highlight);
    return text.split(new RegExp(`(${escapedHighlight})`, "gi"));
  }, [text, highlight]);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={index} className="font-black text-black">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}
