/*
 * 본 테스트 코드는 E2E 샘플 테스트 코드에요.
 * 주석들은 테스트 코드를 작성하면서 완료된 부분들을 확인 후 제거하시면서 작업하면 편해요.
 */

import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator'; // 제거

import * as supertest from 'supertest';
import { HttpStatus } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import { testApp } from '../../config/e2e/env/jest.setup';

const URL = 'API 경로';

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
 * SUITE 멘트: `{METHOD} ${URL} E2E TEST`
 */
describe(`GET ${URL} E2E Test`, () => {
  let agent: TestAgent;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
  });

  /*
   * 생성 E2E를 제외한 곳에서 공용 데이터를 생성하기 위한 구역입니다.
   */
  beforeEach(async () => {});

  /*
   * 생성 E2E를 제외한 곳에서 공용 데이터를 제거하기 위한 구역입니다.
   */
  afterEach(async () => {});

  /*
   *
   * 테스트 코드는 소스 코드 순서로 배치를 해주세요.
   * TEST 멘트: '[정수 응답 코드] ~ 경우 ~ {성공/실패}한다.'
   * 모든 응답 값을 반환하는지 확인해주세요.
   *
   * 주석은 다음을 설명해요.
   * // given: 사전 데이터 설정
   * // Http when: API 경로로 요청
   * // Http then: 응답 값 및 데이터 검증
   * // DB, Redis when: 데이터 저장소 요청
   * // DB, Redis then: 데이터 값 검증
   * // cleanup: 사전 데이터 정리
   */

  /*
   * response body가 있을 경우 toStrictEqual
   */
  it('[200] ~ 경우 ~조회를 성공한다.', async () => {
    // Http when
    const response = await agent.get(URL);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toStrictEqual({
      name: 'sample',
    });
  });

  /*
   * response body가 없을 경우 toBeUndefined
   * DB, Redis 데이터가 없을 경우 toBeNull
   */
  it('[404] ~ 경우 조회를 실패한다.', async () => {
    // given
    const id = 1;
    const requestDto = new SampleRequestDto({ id });

    // Http when
    const response = await agent.get(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });
});
