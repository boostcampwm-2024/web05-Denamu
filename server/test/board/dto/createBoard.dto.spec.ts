import { BoardCategory, BoardStatus } from '@board/constant/board.constant';
import { CreateBoardRequestDto } from '@board/dto/request/createBoard.dto';
import { validate } from 'class-validator';

describe(`${CreateBoardRequestDto.name} Test`, () => {
  let dto: CreateBoardRequestDto;

  beforeEach(() => {
    dto = new CreateBoardRequestDto({
      title: '서비스 점검 안내',
      content: '<p>2026년 8월 1일 서비스 점검이 진행됩니다.</p>',
      isPinned: true,
      status: BoardStatus.PUBLISHED,
      startAt: '2026-08-01T00:00:00.000Z',
      endAt: '2026-08-31T00:00:00.000Z',
    });
  });

  it('제목, 본문, 상단 고정 여부, 공개 상태, 노출 기간이 모두 올바를 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  it('선택 항목이 입력되지 않고 제목과 본문만 존재할 경우 유효성 검사에 성공한다.', async () => {
    // given
    const requiredOnlyDto = new CreateBoardRequestDto({
      title: '서비스 점검 안내',
      content: '<p>2026년 8월 1일 서비스 점검이 진행됩니다.</p>',
    });

    // when
    const errors = await validate(requiredOnlyDto);

    // then
    expect(errors).toHaveLength(0);
  });

  describe('title', () => {
    it('제목이 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.title = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('제목이 문자열이 아닌 숫자일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.title = 1 as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('제목이 255자를 초과할 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.title = 'a'.repeat(256);

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('content', () => {
    it('본문이 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.content = null;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('본문이 문자열이 아닌 객체일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.content = { text: 'test' } as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('첨부 이미지가 최대 개수(5장)까지면 유효성 검사에 성공한다.', async () => {
      // given
      dto.content = Array.from(
        { length: 5 },
        (_, i) => `<img src="/objects/BOARD_IMAGE/2026-08-01/${i}.png">`,
      ).join('');

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(0);
    });

    it('첨부 이미지가 최대 개수(5장)를 초과하면 유효성 검사에 실패한다.', async () => {
      // given
      dto.content = Array.from(
        { length: 6 },
        (_, i) => `<img src="/objects/BOARD_IMAGE/2026-08-01/${i}.png">`,
      ).join('');

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('maxBoardImageCount');
    });
  });

  describe('question', () => {
    it('분류가 FAQ인데 질문이 없을 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.category = BoardCategory.FAQ;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('분류가 NOTICE이고 질문이 없을 경우 유효성 검사에 성공한다.', async () => {
      // given
      dto.category = BoardCategory.NOTICE;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(0);
    });
  });

  describe('isPinned', () => {
    it('상단 고정 여부가 boolean이 아닌 문자열일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.isPinned = 'true' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });
  });

  describe('status', () => {
    it('공개 상태가 공개 상태 목록에 없는 값일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.status = 'DELETED' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('category', () => {
    it('분류가 입력되지 않을 경우 유효성 검사에 성공한다.', async () => {
      // given
      const requiredOnlyDto = new CreateBoardRequestDto({
        title: '서비스 점검 안내',
        content: '<p>2026년 8월 1일 서비스 점검이 진행됩니다.</p>',
      });

      // when
      const errors = await validate(requiredOnlyDto);

      // then
      expect(errors).toHaveLength(0);
    });

    it('분류가 FAQ이고 질문이 존재할 경우 유효성 검사에 성공한다.', async () => {
      // given
      dto.category = BoardCategory.FAQ;
      dto.question = '<p>환불은 언제까지 가능한가요?</p>';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(0);
    });

    it('분류가 분류 목록에 없는 값일 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.category = 'EVENT' as any;

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('startAt', () => {
    it('노출 시작 일시가 ISO 8601 형식이 아닐 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.startAt = '2026년 8월 1일';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isIso8601');
    });
  });

  describe('endAt', () => {
    it('노출 종료 일시가 ISO 8601 형식이 아닐 경우 유효성 검사에 실패한다.', async () => {
      // given
      dto.endAt = '2026-13-45';

      // when
      const errors = await validate(dto);

      // then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isIso8601');
    });
  });
});
