import { PermanentError, RetryableError, isRetryable } from '@common/errors';

describe('isRetryable', () => {
  it('PermanentError는 재시도 불가', () => {
    expect(isRetryable(new PermanentError('삭제된 게시글'))).toBe(false);
  });

  it('RetryableError는 재시도 가능', () => {
    expect(isRetryable(new RetryableError('일시적 서버 오류'))).toBe(true);
  });

  it('4xx 클라이언트 오류(status)는 재시도 불가', () => {
    expect(isRetryable({ status: 401 })).toBe(false);
    expect(isRetryable({ status: 404 })).toBe(false);
    expect(isRetryable({ status: 400 })).toBe(false);
  });

  it('429는 4xx 규칙보다 우선해 재시도 가능', () => {
    expect(isRetryable({ status: 429 })).toBe(true);
  });

  it('5xx 서버 오류(status)는 재시도 가능', () => {
    expect(isRetryable({ status: 503 })).toBe(true);
    expect(isRetryable({ status: 500 })).toBe(true);
  });

  it('axios 형태(response.status)도 분류', () => {
    expect(isRetryable({ response: { status: 400 } })).toBe(false);
    expect(isRetryable({ response: { status: 502 } })).toBe(true);
  });

  it('분류 불가능한 일반 에러는 기본 재시도(at-least-once)', () => {
    expect(isRetryable(new Error('알 수 없는 오류'))).toBe(true);
    expect(isRetryable(null)).toBe(true);
    expect(isRetryable(undefined)).toBe(true);
  });
});
