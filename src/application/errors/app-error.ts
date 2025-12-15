import { ZodError } from 'zod';

export enum ErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly message: string,
    public readonly statusCode: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): { error: { code: ErrorCode; message: string; details?: unknown } } {
    const result: { error: { code: ErrorCode; message: string; details?: unknown } } = {
      error: {
        code: this.code,
        message: this.message,
      },
    };

    if (this.details) {
      result.error.details = this.details;
    }

    return result;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.BAD_REQUEST, message, 400, details);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details?: unknown) {
    super(ErrorCode.UNAUTHORIZED, message, 401, details);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details?: unknown) {
    super(ErrorCode.FORBIDDEN, message, 403, details);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?: unknown) {
    super(ErrorCode.NOT_FOUND, message, 404, details);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.CONFLICT, message, 409, details);
    this.name = 'ConflictError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.VALIDATION_ERROR, message, 422, details);
    this.name = 'ValidationError';
  }

  static fromZodError(zodError: ZodError): ValidationError {
    const details = zodError.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }));

    return new ValidationError('Validation failed', details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.TOO_MANY_REQUESTS, message, 429, details);
    this.name = 'TooManyRequestsError';
  }
}

export class InternalError extends AppError {
  constructor(message = 'Internal server error', details?: unknown) {
    super(ErrorCode.INTERNAL_ERROR, message, 500, details);
    this.name = 'InternalError';
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service unavailable', details?: unknown) {
    super(ErrorCode.SERVICE_UNAVAILABLE, message, 503, details);
    this.name = 'ServiceUnavailableError';
  }
}
