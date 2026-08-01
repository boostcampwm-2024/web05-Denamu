import axios from 'axios';

import { extractChannelImage } from '@rss/util/extractChannelImage';

export async function fetchChannelImage(
  rssUrl: string,
): Promise<string | null> {
  try {
    const { data } = await axios.get<string>(rssUrl, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
      responseType: 'text',
      timeout: 5000,
      maxContentLength: 5 * 1024 * 1024,
    });
    return typeof data === 'string' ? extractChannelImage(data) : null;
  } catch {
    return null;
  }
}
