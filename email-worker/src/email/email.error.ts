import { NodeMailerError } from '@email/types';

export interface EmailErrorClassification {
  retryable: boolean;
  failureType: 'SMTP_PERMANENT_FAILURE' | 'UNKNOWN_ERROR' | null;
}

const TRANSIENT_NETWORK_CODES = new Set([
  'ESOCKET',
  'ECONNECTION',
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'EAI_AGAIN',
  'EDNS',
]);

function isNetworkError(error: NodeMailerError): boolean {
  return (
    (error.code !== undefined && TRANSIENT_NETWORK_CODES.has(error.code)) ||
    error.message?.includes('Unexpected socket close')
  );
}

export function classifyEmailError(
  error: NodeMailerError,
): EmailErrorClassification {
  if (isNetworkError(error)) {
    return { retryable: true, failureType: null };
  }

  if (typeof error.responseCode === 'number') {
    if (error.responseCode >= 500) {
      return { retryable: false, failureType: 'SMTP_PERMANENT_FAILURE' };
    }
    if (error.responseCode >= 400) {
      return { retryable: true, failureType: null };
    }
  }

  return { retryable: false, failureType: 'UNKNOWN_ERROR' };
}
