const BOARD_IMAGE_SRC_PATTERN = /<img[^>]+src="(\/objects\/BOARD_IMAGE\/[^"]+)"/g;

export function extractBoardImageUrls(content: string): string[] {
  return [...content.matchAll(BOARD_IMAGE_SRC_PATTERN)].map((match) => match[1]);
}
