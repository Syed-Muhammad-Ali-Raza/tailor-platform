export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'FEATURE_DISABLED'
  | 'PAYLOAD_TOO_LARGE'
  | 'INTERNAL';

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  FEATURE_DISABLED: 501,
  PAYLOAD_TOO_LARGE: 413,
  INTERNAL: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = details;
  }
}

export const notFound = (message = 'Resource not found') =>
  new AppError('NOT_FOUND', message);

export const unauthorized = (message = 'Authentication required') =>
  new AppError('UNAUTHORIZED', message);

export const forbidden = (message = 'You do not have access to this resource') =>
  new AppError('FORBIDDEN', message);

export const conflict = (message: string) => new AppError('CONFLICT', message);

export const badRequest = (message: string, details?: unknown) =>
  new AppError('VALIDATION_ERROR', message, details);
