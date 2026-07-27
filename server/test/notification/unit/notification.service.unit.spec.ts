import { NotFoundException } from '@nestjs/common';

import { NotificationRepository } from '@notification/repository/notification.repository';
import { NotificationService } from '@notification/service/notification.service';

describe(`${NotificationService.name} Unit Test`, () => {
  let notificationService: NotificationService;
  let notificationRepository: jest.Mocked<
    Pick<
      NotificationRepository,
      | 'upsertLike'
      | 'deleteLikeNotification'
      | 'countUnread'
      | 'findByRecipient'
      | 'markRead'
      | 'deleteExpired'
    >
  >;

  beforeEach(() => {
    notificationRepository = {
      upsertLike: jest.fn(),
      deleteLikeNotification: jest.fn(),
      countUnread: jest.fn(),
      findByRecipient: jest.fn(),
      markRead: jest.fn(),
      deleteExpired: jest.fn(),
    };

    notificationService = new NotificationService(
      notificationRepository as unknown as NotificationRepository,
    );
  });

  describe('upsertLikeNotification', () => {
    it('recipientId, feedId로 upsertLike를 호출한다.', async () => {
      // when
      await notificationService.upsertLikeNotification(1, 10);

      // then
      expect(notificationRepository.upsertLike).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('removeLikeNotificationIfEmpty', () => {
    it('좋아요가 남아있으면(likeCount > 0) 알림을 삭제하지 않는다.', async () => {
      // when
      await notificationService.removeLikeNotificationIfEmpty(10, 1);

      // then
      expect(notificationRepository.deleteLikeNotification).not.toHaveBeenCalled();
    });

    it('좋아요가 0개면 해당 게시글의 알림을 삭제한다.', async () => {
      // when
      await notificationService.removeLikeNotificationIfEmpty(10, 0);

      // then
      expect(notificationRepository.deleteLikeNotification).toHaveBeenCalledWith(10);
    });
  });

  describe('markAsRead', () => {
    it('본인 소유가 아니거나 존재하지 않는 알림이면 NotFoundException을 던진다.', async () => {
      // given
      notificationRepository.markRead.mockResolvedValue(false);

      // when & then
      await expect(notificationService.markAsRead(1, 2)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('본인 소유 알림이면 읽음 처리를 성공한다.', async () => {
      // given
      notificationRepository.markRead.mockResolvedValue(true);

      // when & then
      await expect(
        notificationService.markAsRead(1, 2),
      ).resolves.toBeUndefined();
      expect(notificationRepository.markRead).toHaveBeenCalledWith(1, 2);
    });
  });
});
