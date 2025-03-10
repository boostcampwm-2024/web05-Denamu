import logger from "./logger";
import { parse } from "node-html-parser";
import { unescape } from "html-escaper";

export class RssParser {
  async getThumbnailUrl(feedUrl: string) {
    const response = await fetch(feedUrl, {
      headers: {
        Accept: "text/html",
      },
    });
    if (!response.ok) {
      throw new Error(`${feedUrl}에 GET 요청 실패`);
    }

    const htmlData = await response.text();
    const htmlRootElement = parse(htmlData);
    const metaImage = htmlRootElement.querySelector(
      'meta[property="og:image"]'
    );
    let thumbnailUrl = metaImage?.getAttribute("content") ?? "";

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
      "&middot;": "·",
      "&nbsp;": " ",
    };
    Object.keys(escapeEntity).forEach((escapeKey) => {
      const value = escapeEntity[escapeKey];
      const regex = new RegExp(escapeKey, "g");
      feedTitle = feedTitle.replace(regex, value);
    });

    return unescape(feedTitle);
  }
}
