import { NodeMailerError } from '@email/types';

export interface EmailErrorClassification {
  retryable: boolean;
  failureType: 'SMTP_PERMANENT_FAILURE' | 'UNKNOWN_ERROR' | null;
}

function isNetworkError(error: NodeMailerError): boolean {
  return (
    error.code === 'ESOCKET' ||
    error.message?.includes('ECONNREFUSED') ||
    error.message?.includes('ETIMEDOUT') ||
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
