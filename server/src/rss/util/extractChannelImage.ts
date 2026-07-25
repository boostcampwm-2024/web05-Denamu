const CHANNEL_IMAGE_PATTERNS = [
  /<image>[\s\S]*?<url>([\s\S]*?)<\/url>[\s\S]*?<\/image>/i,
  /<logo>([\s\S]*?)<\/logo>/i,
  /<icon>([\s\S]*?)<\/icon>/i,
];

export function extractChannelImage(xmlData: string): string | null {
  for (const pattern of CHANNEL_IMAGE_PATTERNS) {
    const match = xmlData.match(pattern);
    const url = match?.[1]?.trim();
    if (url) {
      return url;
    }
  }
  return null;
}
