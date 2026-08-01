const COMMENT_PREVIEW_LENGTH = 40;

export function toCommentPreview(content: string | null) {
  if (!content) return null;
  return content.length > COMMENT_PREVIEW_LENGTH
    ? `${content.slice(0, COMMENT_PREVIEW_LENGTH)}...`
    : content;
}
