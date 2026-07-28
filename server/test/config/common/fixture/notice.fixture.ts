import * as uuid from 'uuid';

import { NoticeStatus } from '@notice/constant/notice.constant';
import { Notice } from '@notice/entity/notice.entity';

export const NOTICE_DEFAULT_CONTENT = '<p>테스트 공지사항 본문입니다.</p>';

export class NoticeFixture {
  static createGeneralNotice() {
    return {
      title: `notice${uuid.v4()}`,
      content: NOTICE_DEFAULT_CONTENT,
      status: NoticeStatus.PUBLISHED,
      isPinned: false,
      startAt: null,
      endAt: null,
      author: null,
    };
  }

  static createNoticeFixture(overwrites: Partial<Notice> = {}): Notice {
    const notice = new Notice();
    return Object.assign(notice, this.createGeneralNotice(), overwrites);
  }
}
