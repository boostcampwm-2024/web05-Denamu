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
  if (error.code !== undefined && TRANSIENT_NETWORK_CODES.has(error.code)) {
    return true;
  }

  const message = error.message;
  if (!message) {
    return false;
  }

  if (message.includes('Unexpected socket close')) {
    return true;
  }

  for (const code of TRANSIENT_NETWORK_CODES) {
    if (message.includes(code)) {
      return true;
    }
  }

  return false;
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
