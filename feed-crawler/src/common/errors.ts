export class RetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RetryableError';
  }
}

export class PermanentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermanentError';
  }
}

export function isRetryable(error: unknown): boolean {
  if (error instanceof PermanentError) return false;
  if (error instanceof RetryableError) return true;

  const status = extractHttpStatus(error);
  if (typeof status === 'number') {
    if (status === 429) return true;
    if (status >= 400 && status < 500) return false;
    if (status >= 500) return true;
  }

  return true;
}

function extractHttpStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const candidate = error as {
    status?: unknown;
    response?: { status?: unknown };
  };
  if (typeof candidate.status === 'number') return candidate.status;
  if (typeof candidate.response?.status === 'number') {
    return candidate.response.status;
  }
  return undefined;
}
