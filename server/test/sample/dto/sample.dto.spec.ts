/*
 * 본 테스트 코드는 DTO 샘플 테스트 코드에요.
 * 주석들은 테스트 코드를 작성하면서 완료된 부분들을 확인 후 제거하시면서 작업하면 편해요.
 */
import { IsInt, IsNotEmpty, IsString, Min, validate } from 'class-validator';

/*
 * SampleRequestDto는 지우고 테스트 코드만 수정해주시면 돼요.
 */
class SampleRequestDto {
  @IsInt({ message: '샘플 ID는 정수여야 합니다.' })
  @Min(1, { message: '샘플 ID는 1 이상이어야 합니다.' })
  id: number;

  @IsNotEmpty({
    message: '이름이 입력해주세요.',
  })
  @IsString({
    message: '문자열로 입력해주세요.',
  })
  name: string;

  constructor(partial: Partial<SampleRequestDto>) {
    Object.assign(this, partial);
  }
}

/*
 * SUITE 멘트: `${DTO.name} Test`
 */
describe(`${SampleRequestDto.name} Test`, () => {
  let dto: SampleRequestDto;

  beforeEach(() => {
    dto = new SampleRequestDto({
      id: 1,
      name: 'test',
    });
  });

  /*
   *
   * 테스트 코드는 속성 순서로 배치를 해주세요.
   * 모든 검증 행위를 테스트하는지 확인해주세요.
   *
   * 주석은 다음을 설명해요.
   * // given: 사전 데이터 설정
   * // when: 검증 요청
   * // then: 검증
   *
   */

  /*
   *
   * 성공 테스트 케이스
   * TEST 멘트: '~일 경우 ~ {성공/실패}한다.'
   *
   */
  it('id 값이 1 이상의 정수이고 문자열이 존재할 경우 유효성 검사에 성공한다.', async () => {
    // when
    const errors = await validate(dto);

    // then
    expect(errors).toHaveLength(0);
  });

  /*
   *
   * 실패 테스트 케이스 (속성별로 describe 분리)
   * TEST 멘트: '~일 경우 ~에 {성공/실패}한다.'
   *
   */
  describe('id', () => {
    it('ID가 없을 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.id = null;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('ID가 1 미만의 정수일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.id = -1;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });

  describe('name', () => {
    it('이름이 없을 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.name = null;

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('이름이 빈 문자열일 경우 유효성 검사에 실패한다.', async () => {
      //given
      dto.name = '';

      //when
      const errors = await validate(dto);

      //then
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });
});
