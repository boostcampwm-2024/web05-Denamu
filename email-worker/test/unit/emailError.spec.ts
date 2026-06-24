import 'reflect-metadata';

import { classifyEmailError } from '@email/email.error';
import { NodeMailerError } from '@email/types';

function makeError(
  message: string,
  extra: Partial<NodeMailerError> = {},
): NodeMailerError {
  const error = new Error(message) as NodeMailerError;
  Object.assign(error, extra);
  return error;
}

describe('classifyEmailError unit test', () => {
  describe('네트워크 에러 → retryable', () => {
    const transientCodes = [
      'ESOCKET',
      'ECONNECTION',
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'EAI_AGAIN',
      'EDNS',
    ];

    transientCodes.forEach((code) => {
      it(`error.code가 ${code}이면 retryable=true, failureType=null`, () => {
        const error = makeError('network failure', { code });

        expect(classifyEmailError(error)).toEqual({
          retryable: true,
          failureType: null,
        });
      });
    });

    it('메시지에 "Unexpected socket close"가 포함되면 retryable=true', () => {
      const error = makeError('Unexpected socket close');

      expect(classifyEmailError(error)).toEqual({
        retryable: true,
        failureType: null,
      });
    });

    it('code는 없지만 메시지에 네트워크 코드 문자열이 포함되면 retryable=true', () => {
      const error = makeError('connect ETIMEDOUT 1.2.3.4:587');

      expect(classifyEmailError(error)).toEqual({
        retryable: true,
        failureType: null,
      });
    });

    it('message가 비어있고 code도 없으면 네트워크 에러로 판단하지 않는다', () => {
      const error = makeError('');

      expect(classifyEmailError(error)).toEqual({
        retryable: false,
        failureType: 'UNKNOWN_ERROR',
      });
    });
  });

  describe('SMTP responseCode 기반 분류', () => {
    it('responseCode >= 500이면 SMTP_PERMANENT_FAILURE, retryable=false', () => {
      const error = makeError('Mailbox unavailable', { responseCode: 550 });

      expect(classifyEmailError(error)).toEqual({
        retryable: false,
        failureType: 'SMTP_PERMANENT_FAILURE',
      });
    });

    it('responseCode가 400~499이면 retryable=true, failureType=null', () => {
      const error = makeError('Mailbox busy', { responseCode: 450 });

      expect(classifyEmailError(error)).toEqual({
        retryable: true,
        failureType: null,
      });
    });

    it('responseCode가 400 미만이면 UNKNOWN_ERROR로 분류한다', () => {
      const error = makeError('Unexpected response', { responseCode: 250 });

      expect(classifyEmailError(error)).toEqual({
        retryable: false,
        failureType: 'UNKNOWN_ERROR',
      });
    });
  });

  describe('분류 불가 에러', () => {
    it('code도 responseCode도 없으면 UNKNOWN_ERROR', () => {
      const error = makeError('Something went wrong');

      expect(classifyEmailError(error)).toEqual({
        retryable: false,
        failureType: 'UNKNOWN_ERROR',
      });
    });
  });
});
