import { BadRequestException, NotFoundException } from '@nestjs/common';

import { BoardCategory, BoardStatus } from '@board/constant/board.constant';
import { CreateBoardRequestDto } from '@board/dto/request/createBoard.dto';
import { GetAdminBoardsRequestDto } from '@board/dto/request/getAdminBoards.dto';
import { GetBoardsRequestDto } from '@board/dto/request/getBoards.dto';
import { UpdateBoardRequestDto } from '@board/dto/request/updateBoard.dto';
import { Board } from '@board/entity/board.entity';
import { BoardRepository } from '@board/repository/board.repository';
import { BoardService } from '@board/service/board.service';

import { AdminRepository } from '@admin/repository/admin.repository';

import { EmailProducer } from '@common/email/email.producer';
import { WinstonLoggerService } from '@common/logger/logger.service';

import { FileService } from '@file/service/file.service';

import { UserRepository } from '@user/repository/user.repository';

import { BoardFixture } from '@test/config/common/fixture/board.fixture';

describe(`${BoardService.name} Unit Test`, () => {
  let boardService: BoardService;
  let boardRepository: Record<
    | 'findPublicList'
    | 'findPublicById'
    | 'findAdminList'
    | 'findOne'
    | 'findOneBy'
    | 'create'
    | 'save'
    | 'delete',
    jest.Mock
  >;
  let adminRepository: Record<'findOneBy', jest.Mock>;
  let userRepository: jest.Mocked<
    Pick<UserRepository, 'findNoticeAgreedUsers'>
  >;
  let emailProducer: jest.Mocked<Pick<EmailProducer, 'produceNoticePublished'>>;
  let fileService: jest.Mocked<Pick<FileService, 'deleteUntracked'>>;
  let logger: jest.Mocked<Pick<WinstonLoggerService, 'error'>>;

  const createBoard = (overwrites: Partial<Board> = {}): Board =>
    BoardFixture.createBoardFixture({
      id: 1,
      createdAt: new Date('2026-07-01T00:00:00.000Z'),
      updatedAt: new Date('2026-07-01T00:00:00.000Z'),
      ...overwrites,
    });

  beforeEach(() => {
    boardRepository = {
      findPublicList: jest.fn(),
      findPublicById: jest.fn(),
      findAdminList: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn((entityLike) => entityLike),
      save: jest.fn((entity) => entity),
      delete: jest.fn(),
    };
    adminRepository = {
      findOneBy: jest.fn(),
    };
    userRepository = {
      findNoticeAgreedUsers: jest.fn().mockResolvedValue([]),
    };
    emailProducer = {
      produceNoticePublished: jest.fn(),
    };
    fileService = {
      deleteUntracked: jest.fn().mockResolvedValue(undefined),
    };
    logger = { error: jest.fn() };

    boardService = new BoardService(
      boardRepository as unknown as BoardRepository,
      adminRepository as unknown as AdminRepository,
      userRepository as unknown as UserRepository,
      emailProducer as unknown as EmailProducer,
      fileService as unknown as FileService,
      logger as unknown as WinstonLoggerService,
    );
  });

  describe('getPublicBoards', () => {
    it('페이지네이션 값과 현재 시각을 리포지토리에 위임하고 목록을 반환한다.', async () => {
      // given
      const boards = [createBoard({ id: 2 }), createBoard({ id: 1 })];
      boardRepository.findPublicList.mockResolvedValue({
        items: boards,
        totalCount: 25,
      });

      // when
      const result = await boardService.getPublicBoards(
        new GetBoardsRequestDto({ page: 2, limit: 10 }),
      );

      // then
      expect(boardRepository.findPublicList).toHaveBeenCalledWith(
        2,
        10,
        expect.any(Date),
        BoardCategory.NOTICE,
      );
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.totalCount).toBe(25);
      expect(result.hasMore).toBe(true);
      expect(result.result).toHaveLength(2);
    });

    it('마지막 페이지일 경우 hasMore가 false로 반환된다.', async () => {
      // given
      boardRepository.findPublicList.mockResolvedValue({
        items: [createBoard()],
        totalCount: 10,
      });

      // when
      const result = await boardService.getPublicBoards(
        new GetBoardsRequestDto({ page: 1, limit: 10 }),
      );

      // then
      expect(result.hasMore).toBe(false);
    });

    it('목록 응답에는 본문이 포함되지 않는다.', async () => {
      // given
      boardRepository.findPublicList.mockResolvedValue({
        items: [createBoard()],
        totalCount: 1,
      });

      // when
      const result = await boardService.getPublicBoards(
        new GetBoardsRequestDto({ page: 1, limit: 10 }),
      );

      // then
      expect(result.result[0]).not.toHaveProperty('content');
    });

    it('분류를 지정하지 않을 경우 NOTICE 분류를 리포지토리에 위임한다.', async () => {
      // given
      boardRepository.findPublicList.mockResolvedValue({
        items: [],
        totalCount: 0,
      });

      // when
      await boardService.getPublicBoards(
        new GetBoardsRequestDto({ page: 1, limit: 10 }),
      );

      // then
      expect(boardRepository.findPublicList).toHaveBeenCalledWith(
        1,
        10,
        expect.any(Date),
        BoardCategory.NOTICE,
      );
    });

    it('분류를 FAQ로 지정할 경우 FAQ 분류를 리포지토리에 위임한다.', async () => {
      // given
      boardRepository.findPublicList.mockResolvedValue({
        items: [],
        totalCount: 0,
      });

      // when
      await boardService.getPublicBoards(
        new GetBoardsRequestDto({
          page: 1,
          limit: 10,
          category: BoardCategory.FAQ,
        }),
      );

      // then
      expect(boardRepository.findPublicList).toHaveBeenCalledWith(
        1,
        10,
        expect.any(Date),
        BoardCategory.FAQ,
      );
    });
  });

  describe('getPublicBoard', () => {
    it('공개 조건을 만족하는 게시글이 없을 경우 NotFoundException을 던진다.', async () => {
      // given
      boardRepository.findPublicById.mockResolvedValue(null);

      // when & then
      await expect(boardService.getPublicBoard(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('공개된 게시글의 상세 정보를 작성자 이름과 함께 반환한다.', async () => {
      // given
      const board = createBoard({ author: { name: '관리자' } as any });
      boardRepository.findPublicById.mockResolvedValue(board);

      // when
      const result = await boardService.getPublicBoard(1);

      // then
      expect(boardRepository.findPublicById).toHaveBeenCalledWith(
        1,
        expect.any(Date),
      );
      expect(result.id).toBe(board.id);
      expect(result.content).toBe(board.content);
      expect(result.authorName).toBe('관리자');
    });

    it('작성자가 없는 게시글일 경우 작성자 이름을 null로 반환한다.', async () => {
      // given
      boardRepository.findPublicById.mockResolvedValue(
        createBoard({ author: null }),
      );

      // when
      const result = await boardService.getPublicBoard(1);

      // then
      expect(result.authorName).toBeNull();
    });
  });

  describe('getAdminBoards', () => {
    it('페이지네이션 값과 공개 상태 필터를 리포지토리에 위임한다.', async () => {
      // given
      boardRepository.findAdminList.mockResolvedValue({
        items: [createBoard({ status: BoardStatus.DRAFT })],
        totalCount: 1,
      });

      // when
      const result = await boardService.getAdminBoards(
        new GetAdminBoardsRequestDto({
          page: 1,
          limit: 10,
          status: BoardStatus.DRAFT,
        }),
      );

      // then
      expect(boardRepository.findAdminList).toHaveBeenCalledWith(
        1,
        10,
        BoardStatus.DRAFT,
        undefined,
      );
      expect(result.totalCount).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    it('공개 상태 필터가 없을 경우 undefined를 그대로 위임한다.', async () => {
      // given
      boardRepository.findAdminList.mockResolvedValue({
        items: [],
        totalCount: 0,
      });

      // when
      await boardService.getAdminBoards(
        new GetAdminBoardsRequestDto({ page: 1, limit: 10 }),
      );

      // then
      expect(boardRepository.findAdminList).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
      );
    });

    it('분류 필터를 지정할 경우 해당 분류를 리포지토리에 위임한다.', async () => {
      // given
      boardRepository.findAdminList.mockResolvedValue({
        items: [],
        totalCount: 0,
      });

      // when
      await boardService.getAdminBoards(
        new GetAdminBoardsRequestDto({
          page: 1,
          limit: 10,
          category: BoardCategory.FAQ,
        }),
      );

      // then
      expect(boardRepository.findAdminList).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        BoardCategory.FAQ,
      );
    });
  });

  describe('getAdminBoard', () => {
    it('게시글이 존재하지 않을 경우 NotFoundException을 던진다.', async () => {
      // given
      boardRepository.findOne.mockResolvedValue(null);

      // when & then
      await expect(boardService.getAdminBoard(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('임시저장 상태의 게시글도 작성자와 함께 조회한다.', async () => {
      // given
      const board = createBoard({
        status: BoardStatus.DRAFT,
        author: { name: '관리자' } as any,
      });
      boardRepository.findOne.mockResolvedValue(board);

      // when
      const result = await boardService.getAdminBoard(1);

      // then
      expect(boardRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['author'],
      });
      expect(result.status).toBe(BoardStatus.DRAFT);
      expect(result.authorName).toBe('관리자');
    });
  });

  describe('createBoard', () => {
    it('노출 시작일이 종료일과 같을 경우 BadRequestException을 던진다.', async () => {
      // given
      const dto = new CreateBoardRequestDto({
        title: '제목',
        content: '<p>본문</p>',
        startAt: '2026-08-01T00:00:00.000Z',
        endAt: '2026-08-01T00:00:00.000Z',
      });

      // when & then
      await expect(
        boardService.createBoard('admin@test.com', dto),
      ).rejects.toThrow(BadRequestException);
      expect(boardRepository.save).not.toHaveBeenCalled();
    });

    it('노출 시작일이 종료일보다 늦을 경우 BadRequestException을 던진다.', async () => {
      // given
      const dto = new CreateBoardRequestDto({
        title: '제목',
        content: '<p>본문</p>',
        startAt: '2026-09-01T00:00:00.000Z',
        endAt: '2026-08-01T00:00:00.000Z',
      });

      // when & then
      await expect(
        boardService.createBoard('admin@test.com', dto),
      ).rejects.toThrow(BadRequestException);
      expect(boardRepository.save).not.toHaveBeenCalled();
    });

    it('공개 상태와 상단 고정 여부가 없을 경우 임시저장 및 고정 해제 상태로 저장한다.', async () => {
      // given
      const author = { id: 1, name: '관리자', email: 'admin@test.com' };
      adminRepository.findOneBy.mockResolvedValue(author);
      const dto = new CreateBoardRequestDto({
        title: '제목',
        content: '<p>본문</p>',
      });

      // when
      const result = await boardService.createBoard('admin@test.com', dto);

      // then
      expect(adminRepository.findOneBy).toHaveBeenCalledWith({
        email: 'admin@test.com',
      });
      expect(boardRepository.create).toHaveBeenCalledWith({
        title: '제목',
        content: '<p>본문</p>',
        question: null,
        status: BoardStatus.DRAFT,
        category: BoardCategory.NOTICE,
        isPinned: false,
        startAt: null,
        endAt: null,
        author,
      });
      expect(boardRepository.save).toHaveBeenCalled();
      expect(result.status).toBe(BoardStatus.DRAFT);
      expect(result.isPinned).toBe(false);
      expect(result.authorName).toBe('관리자');
    });

    it('노출 기간과 공개 상태를 지정할 경우 지정한 값으로 저장한다.', async () => {
      // given
      adminRepository.findOneBy.mockResolvedValue(null);
      const dto = new CreateBoardRequestDto({
        title: '제목',
        content: '<p>본문</p>',
        status: BoardStatus.PUBLISHED,
        isPinned: true,
        startAt: '2026-08-01T00:00:00.000Z',
        endAt: '2026-08-31T00:00:00.000Z',
      });

      // when
      const result = await boardService.createBoard('admin@test.com', dto);

      // then
      expect(boardRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: BoardStatus.PUBLISHED,
          isPinned: true,
          startAt: new Date('2026-08-01T00:00:00.000Z'),
          endAt: new Date('2026-08-31T00:00:00.000Z'),
          author: null,
        }),
      );
      expect(result.authorName).toBeNull();
    });

    it('공지사항이 공개 상태로 즉시 노출될 경우 알림 수신에 동의한 사용자에게 이메일을 발행한다.', async () => {
      // given
      adminRepository.findOneBy.mockResolvedValue(null);
      boardRepository.save.mockImplementation((entity: Board) => {
        entity.id = 1;
        return entity;
      });
      userRepository.findNoticeAgreedUsers.mockResolvedValue([
        { email: 'a@test.com', userName: 'a' },
        { email: 'b@test.com', userName: 'b' },
      ]);
      const dto = new CreateBoardRequestDto({
        title: '점검 안내',
        content: '<p>본문</p>',
        category: BoardCategory.NOTICE,
        status: BoardStatus.PUBLISHED,
      });

      // when
      await boardService.createBoard('admin@test.com', dto);

      // then
      expect(userRepository.findNoticeAgreedUsers).toHaveBeenCalled();
      expect(emailProducer.produceNoticePublished).toHaveBeenCalledTimes(2);
      expect(emailProducer.produceNoticePublished).toHaveBeenCalledWith({
        email: 'a@test.com',
        userName: 'a',
        boardId: 1,
        title: '점검 안내',
      });
    });

    it('임시저장 상태일 경우 이메일을 발행하지 않는다.', async () => {
      // given
      adminRepository.findOneBy.mockResolvedValue(null);
      const dto = new CreateBoardRequestDto({
        title: '점검 안내',
        content: '<p>본문</p>',
      });

      // when
      await boardService.createBoard('admin@test.com', dto);

      // then
      expect(userRepository.findNoticeAgreedUsers).not.toHaveBeenCalled();
      expect(emailProducer.produceNoticePublished).not.toHaveBeenCalled();
    });

    it('FAQ 분류일 경우 이메일을 발행하지 않는다.', async () => {
      // given
      adminRepository.findOneBy.mockResolvedValue(null);
      const dto = new CreateBoardRequestDto({
        title: '질문',
        content: '<p>본문</p>',
        category: BoardCategory.FAQ,
        status: BoardStatus.PUBLISHED,
      });

      // when
      await boardService.createBoard('admin@test.com', dto);

      // then
      expect(emailProducer.produceNoticePublished).not.toHaveBeenCalled();
    });

    it('FAQ 분류일 경우 질문을 함께 저장한다.', async () => {
      // given
      adminRepository.findOneBy.mockResolvedValue(null);
      const dto = new CreateBoardRequestDto({
        title: '질문',
        content: '<p>답변</p>',
        question: '<p>환불은 언제까지 가능한가요?</p>',
        category: BoardCategory.FAQ,
      });

      // when
      const result = await boardService.createBoard('admin@test.com', dto);

      // then
      expect(boardRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ question: '<p>환불은 언제까지 가능한가요?</p>' }),
      );
      expect(result.question).toBe('<p>환불은 언제까지 가능한가요?</p>');
    });

    it('노출 시작일이 미래일 경우 이메일을 발행하지 않는다.', async () => {
      // given
      adminRepository.findOneBy.mockResolvedValue(null);
      const dto = new CreateBoardRequestDto({
        title: '점검 안내',
        content: '<p>본문</p>',
        status: BoardStatus.PUBLISHED,
        startAt: '2099-01-01T00:00:00.000Z',
      });

      // when
      await boardService.createBoard('admin@test.com', dto);

      // then
      expect(emailProducer.produceNoticePublished).not.toHaveBeenCalled();
    });

    it('이메일 발행에 실패해도 게시글 작성 자체는 성공한다.', async () => {
      // given
      adminRepository.findOneBy.mockResolvedValue(null);
      userRepository.findNoticeAgreedUsers.mockRejectedValue(
        new Error('DB 오류'),
      );
      const dto = new CreateBoardRequestDto({
        title: '점검 안내',
        content: '<p>본문</p>',
        status: BoardStatus.PUBLISHED,
      });

      // when
      const result = await boardService.createBoard('admin@test.com', dto);

      // then
      expect(result.title).toBe('점검 안내');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updateBoard', () => {
    it('게시글이 존재하지 않을 경우 NotFoundException을 던진다.', async () => {
      // given
      boardRepository.findOne.mockResolvedValue(null);

      // when & then
      await expect(
        boardService.updateBoard(
          1,
          new UpdateBoardRequestDto({ title: '수정' }),
        ),
      ).rejects.toThrow(NotFoundException);
      expect(boardRepository.save).not.toHaveBeenCalled();
    });

    it('기존 종료일보다 늦은 시작일만 수정할 경우 BadRequestException을 던진다.', async () => {
      // given
      boardRepository.findOne.mockResolvedValue(
        createBoard({
          startAt: new Date('2026-07-01T00:00:00.000Z'),
          endAt: new Date('2026-08-01T00:00:00.000Z'),
        }),
      );

      // when & then
      await expect(
        boardService.updateBoard(
          1,
          new UpdateBoardRequestDto({ startAt: '2026-09-01T00:00:00.000Z' }),
        ),
      ).rejects.toThrow(BadRequestException);
      expect(boardRepository.save).not.toHaveBeenCalled();
    });

    it('전달하지 않은 항목은 기존 값을 유지한다.', async () => {
      // given
      const board = createBoard({
        title: '기존 제목',
        content: '<p>기존 본문</p>',
        isPinned: true,
        status: BoardStatus.PUBLISHED,
        startAt: new Date('2026-07-01T00:00:00.000Z'),
        endAt: new Date('2026-08-01T00:00:00.000Z'),
      });
      boardRepository.findOne.mockResolvedValue(board);

      // when
      const result = await boardService.updateBoard(
        1,
        new UpdateBoardRequestDto({ title: '수정된 제목' }),
      );

      // then
      expect(result.title).toBe('수정된 제목');
      expect(result.content).toBe('<p>기존 본문</p>');
      expect(result.isPinned).toBe(true);
      expect(result.status).toBe(BoardStatus.PUBLISHED);
      expect(result.startAt).toEqual(new Date('2026-07-01T00:00:00.000Z'));
      expect(result.endAt).toEqual(new Date('2026-08-01T00:00:00.000Z'));
      expect(boardRepository.save).toHaveBeenCalledWith(board);
    });

    it('노출 기간을 null로 전달할 경우 노출 기간을 제거한다.', async () => {
      // given
      boardRepository.findOne.mockResolvedValue(
        createBoard({
          startAt: new Date('2026-07-01T00:00:00.000Z'),
          endAt: new Date('2026-08-01T00:00:00.000Z'),
        }),
      );

      // when
      const result = await boardService.updateBoard(
        1,
        new UpdateBoardRequestDto({ startAt: null, endAt: null }),
      );

      // then
      expect(result.startAt).toBeNull();
      expect(result.endAt).toBeNull();
    });

    it('공개 상태와 상단 고정 여부를 수정할 경우 변경된 값으로 저장한다.', async () => {
      // given
      boardRepository.findOne.mockResolvedValue(
        createBoard({ status: BoardStatus.DRAFT, isPinned: false }),
      );

      // when
      const result = await boardService.updateBoard(
        1,
        new UpdateBoardRequestDto({
          status: BoardStatus.PUBLISHED,
          isPinned: true,
        }),
      );

      // then
      expect(result.status).toBe(BoardStatus.PUBLISHED);
      expect(result.isPinned).toBe(true);
      expect(boardRepository.save).toHaveBeenCalled();
    });

    it('본문에서 제거된 이미지 파일을 삭제한다.', async () => {
      // given
      boardRepository.findOne.mockResolvedValue(
        createBoard({
          content:
            '<p>본문</p><img src="/objects/BOARD_IMAGE/2026-08-06/old.jpg">',
        }),
      );

      // when
      await boardService.updateBoard(
        1,
        new UpdateBoardRequestDto({
          content:
            '<p>본문</p><img src="/objects/BOARD_IMAGE/2026-08-06/new.jpg">',
        }),
      );

      // then
      expect(fileService.deleteUntracked).toHaveBeenCalledWith(
        '/objects/BOARD_IMAGE/2026-08-06/old.jpg',
      );
      expect(fileService.deleteUntracked).not.toHaveBeenCalledWith(
        '/objects/BOARD_IMAGE/2026-08-06/new.jpg',
      );
    });

    it('질문을 수정할 경우 질문 필드가 갱신되고 제거된 이미지 파일을 삭제한다.', async () => {
      // given
      boardRepository.findOne.mockResolvedValue(
        createBoard({
          question:
            '<p>질문</p><img src="/objects/BOARD_IMAGE/2026-08-06/old-question.jpg">',
        }),
      );

      // when
      const result = await boardService.updateBoard(
        1,
        new UpdateBoardRequestDto({
          question: '<p>수정된 질문</p>',
        }),
      );

      // then
      expect(result.question).toBe('<p>수정된 질문</p>');
      expect(fileService.deleteUntracked).toHaveBeenCalledWith(
        '/objects/BOARD_IMAGE/2026-08-06/old-question.jpg',
      );
    });
  });

  describe('deleteBoard', () => {
    it('게시글이 존재하지 않을 경우 NotFoundException을 던진다.', async () => {
      // given
      boardRepository.findOneBy.mockResolvedValue(null);

      // when & then
      await expect(boardService.deleteBoard(1)).rejects.toThrow(
        NotFoundException,
      );
      expect(boardRepository.delete).not.toHaveBeenCalled();
    });

    it('게시글 삭제에 성공한다.', async () => {
      // given
      boardRepository.findOneBy.mockResolvedValue(
        createBoard({ content: '<p>본문</p>' }),
      );

      // when
      await boardService.deleteBoard(1);

      // then
      expect(boardRepository.delete).toHaveBeenCalledWith(1);
      expect(fileService.deleteUntracked).not.toHaveBeenCalled();
    });

    it('본문에 포함된 이미지 파일도 함께 삭제한다.', async () => {
      // given
      boardRepository.findOneBy.mockResolvedValue(
        createBoard({
          content:
            '<p>본문</p><img src="/objects/BOARD_IMAGE/2026-08-06/a.jpg">',
        }),
      );

      // when
      await boardService.deleteBoard(1);

      // then
      expect(fileService.deleteUntracked).toHaveBeenCalledWith(
        '/objects/BOARD_IMAGE/2026-08-06/a.jpg',
      );
    });
  });
});
