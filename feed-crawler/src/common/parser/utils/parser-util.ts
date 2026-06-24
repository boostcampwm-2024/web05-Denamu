import { injectable } from 'tsyringe';

import axios from 'axios';
import { unescape } from 'html-escaper';
import { parse } from 'node-html-parser';

import logger from '@common/logger/logger';

@injectable()
export class ParserUtil {
  async getThumbnailUrl(feedUrl: string) {
    const response = await axios.get<string>(feedUrl, {
      headers: {
        Accept: 'text/html',
      },
      responseType: 'text',
      validateStatus: () => true,
    });
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`썸네일 GET 요청 실패 (HTTP ${response.status})`);
    }

    const htmlData = response.data;
    const htmlRootElement = parse(htmlData);
    const metaImage = htmlRootElement.querySelector(
      'meta[property="og:image"]',
    );
    let thumbnailUrl = metaImage?.getAttribute('content') ?? '';

    if (!thumbnailUrl.length) {
      logger.warn(`${feedUrl}에서 썸네일 추출 실패`);
      return thumbnailUrl;
    }

    if (!this.isUrlPath(thumbnailUrl)) {
      thumbnailUrl = this.getHttpOriginPath(feedUrl) + thumbnailUrl;
    }
    return thumbnailUrl;
  }

  private isUrlPath(thumbnailUrl: string) {
    const reg = /^(http|https):\/\//;
    return reg.test(thumbnailUrl);
  }

  private getHttpOriginPath(feedUrl: string) {
    return new URL(feedUrl).origin;
  }

  customUnescape(feedTitle: string): string {
    const escapeEntity = {
      '&middot;': '·',
      '&nbsp;': ' ',
    };
    Object.keys(escapeEntity).forEach((escapeKey) => {
      const value = escapeEntity[escapeKey];
      const regex = new RegExp(escapeKey, 'g');
      feedTitle = feedTitle.replace(regex, value);
    });

    return unescape(feedTitle);
  }
}
