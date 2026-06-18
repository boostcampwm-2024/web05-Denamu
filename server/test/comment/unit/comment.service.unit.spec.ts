import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { CommentService } from '@comment/service/comment.service';
import { GetCommentResponseDto } from '@comment/dto/response/getComment.dto';
import { GetUserCommentsResponseDto } from '@comment/dto/response/getUserComments.dto';
import { Comment } from '@comment/entity/comment.entity';
import { CommentRepository } from '@comment/repository/comment.repository';

import { Payload } from '@common/guard/jwt.guard';

import { FeedService } from '@feed/service/feed.service';

import { UserService } from '@user/service/user.service';

describe(`${CommentService.name} Unit Test`, () => {
  let commentService: CommentService;
  let commentRepository: jest.Mocked<
    Pick<
      CommentRepository,
      'findOne' | 'getCommentInformation' | 'getCommentsByUser' | 'save'
    >
  >;
  let feedService: jest.Mocked<Pick<FeedService, 'getFeed'>>;
  let userService: jest.Mocked<Pick<UserService, 'getUser'>>;
  let manager: { save: jest.Mock; remove: jest.Mock };
  let dataSource: jest.Mocked<Pick<DataSource, 'transaction'>>;

  const user: Payload = {
    id: 1,
    email: 'user@test.com',
    userName: 'tester',
    role: 'user',
  };

  beforeEach(() => {
    commentRepository = {
      findOne: jest.fn(),
      getCommentInformation: jest.fn(),
      getCommentsByUser: jest.fn(),
      save: jest.fn(),
    };
    feedService = { getFeed: jest.fn() };
    userService = { getUser: jest.fn() };
    manager = { save: jest.fn(), remove: jest.fn() };
    dataSource = {
      transaction: jest.fn((cb: any) => cb(manager)),
    } as any;

    commentService = new CommentService(
      commentRepository as unknown as CommentRepository,
      dataSource as unknown as DataSource,
      feedService as unknown as FeedService,
      userService as unknown as UserService,
    );
  });

  describe('get', () => {
    it('피드 존재를 확인하고 댓글 목록을 응답으로 변환한다.', async () => {
      // given
      const dto = { feedId: 10 };
      const comments = [
        {
          id: 1,
          comment: 'c',
          date: new Date('2025-01-01'),
          user: { id: 1, userName: 'tester', profileImage: null },
        },
      ] as any;
      feedService.getFeed.mockResolvedValue({ id: 10 } as any);
      commentRepository.getCommentInformation.mockResolvedValue(comments);

      // when
      const result = await commentService.get(dto);

      // then
      expect(feedService.getFeed).toHaveBeenCalledWith(10);
      expect(commentRepository.getCommentInformation).toHaveBeenCalledWith(10);
      expect(result).toEqual(
        GetCommentResponseDto.toResponseDtoArray(comments),
      );
    });
  });

  describe('getCommentsByUser', () => {
    const makeComment = (id: number) =>
      ({
        id,
        comment: `c${id}`,
        date: new Date('2025-01-01'),
        feed: { id, title: `t${id}`, path: `https://example.com/${id}` },
      }) as any;

    it('존재하지 않는 유저면 NotFoundException을 던진다.', async () => {
      // given
      userService.getUser.mockRejectedValue(
        new NotFoundException('존재하지 않는 유저입니다.'),
      );

      // when & then
      await expect(
        commentService.getCommentsByUser(999, { limit: 10 }),
      ).rejects.toThrow(NotFoundException);
      expect(commentRepository.getCommentsByUser).not.toHaveBeenCalled();
    });

    it('limit+1개가 조회되면 마지막 항목을 잘라내고 hasMore=true로 응답한다.', async () => {
      // given
      const dto = { lastId: undefined, limit: 2 };
      const rows = [makeComment(5), makeComment(4), makeComment(3)];
      userService.getUser.mockResolvedValue({ id: 1 } as any);
      commentRepository.getCommentsByUser.mockResolvedValue(rows);

      // when
      const result = await commentService.getCommentsByUser(1, dto);

      // then
      expect(userService.getUser).toHaveBeenCalledWith(1);
      expect(commentRepository.getCommentsByUser).toHaveBeenCalledWith(
        1,
        undefined,
        2,
      );
      expect(result).toEqual(
        GetUserCommentsResponseDto.toResponseDto(
          [makeComment(5), makeComment(4)],
          4,
          true,
        ),
      );
    });

    it('마지막 페이지면 hasMore=false, lastId는 마지막 댓글 ID로 응답한다.', async () => {
      // given
      const dto = { lastId: 6, limit: 2 };
      const rows = [makeComment(5), makeComment(4)];
      userService.getUser.mockResolvedValue({ id: 1 } as any);
      commentRepository.getCommentsByUser.mockResolvedValue(rows);

      // when
      const result = await commentService.getCommentsByUser(1, dto);

      // then
      expect(result.hasMore).toBe(false);
      expect(result.lastId).toBe(4);
      expect(result.result).toHaveLength(2);
    });

    it('댓글이 없으면 빈 목록과 lastId=0으로 응답한다.', async () => {
      // given
      userService.getUser.mockResolvedValue({ id: 1 } as any);
      commentRepository.getCommentsByUser.mockResolvedValue([]);

      // when
      const result = await commentService.getCommentsByUser(1, { limit: 10 });

      // then
      expect(result.result).toEqual([]);
      expect(result.lastId).toBe(0);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('create', () => {
    it('트랜잭션 안에서 댓글 수를 증가시키고 댓글을 저장한다.', async () => {
      // given
      const feed = { id: 10, commentCount: 2 };
      feedService.getFeed.mockResolvedValue(feed as any);
      const dto = { comment: '새 댓글' };

      // when
      await commentService.create(user, 10, dto);

      // then
      expect(feed.commentCount).toBe(3);
      expect(manager.save).toHaveBeenCalledWith(feed);
      expect(manager.save).toHaveBeenCalledWith(Comment, {
        comment: '새 댓글',
        feed,
        user: { id: user.id },
      });
    });
  });

  describe('delete', () => {
    const dto = { commentId: 5 };

    it('존재하지 않는 댓글이면 NotFoundException을 던진다.', async () => {
      // given
      commentRepository.findOne.mockResolvedValue(null);

      // when & then
      await expect(commentService.delete(user, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('본인 댓글이 아니면 ForbiddenException을 던진다.', async () => {
      // given
      commentRepository.findOne.mockResolvedValue({
        id: 5,
        user: { id: 999 },
        feed: { id: 10, commentCount: 3 },
      } as any);

      // when & then
      await expect(commentService.delete(user, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('본인 댓글이면 댓글 수를 감소시키고 댓글을 제거한다.', async () => {
      // given
      const feed = { id: 10, commentCount: 3 };
      const comment = { id: 5, user: { id: user.id }, feed } as any;
      commentRepository.findOne.mockResolvedValue(comment);

      // when
      await commentService.delete(user, dto);

      // then
      expect(feed.commentCount).toBe(2);
      expect(manager.save).toHaveBeenCalledWith(feed);
      expect(manager.remove).toHaveBeenCalledWith(comment);
    });
  });

  describe('update', () => {
    it('본인 댓글의 내용을 수정하고 저장한다.', async () => {
      // given
      const comment = {
        id: 5,
        comment: '이전',
        user: { id: user.id },
        feed: { id: 10 },
      };
      commentRepository.findOne.mockResolvedValue(comment as any);
      const dto = { newComment: '수정됨' };

      // when
      await commentService.update(user, 5, dto);

      // then
      expect(comment.comment).toBe('수정됨');
      expect(commentRepository.save).toHaveBeenCalledWith(comment);
    });

    it('본인 댓글이 아니면 ForbiddenException을 던지고 저장하지 않는다.', async () => {
      // given
      commentRepository.findOne.mockResolvedValue({
        id: 5,
        user: { id: 999 },
        feed: { id: 10 },
      } as any);

      // when & then
      await expect(
        commentService.update(user, 5, {
          newComment: '수정됨',
        }),
      ).rejects.toThrow(ForbiddenException);
      expect(commentRepository.save).not.toHaveBeenCalled();
    });
  });
});
