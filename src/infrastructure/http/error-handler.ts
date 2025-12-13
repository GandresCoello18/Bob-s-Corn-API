import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

import { AppError, ErrorCode, ValidationError } from '@/application/errors/app-error';

import { Logger } from '@config/logger';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  path: string;
}

export function createErrorHandler(logger: Logger) {
  return function errorHandler(
    error: FastifyError | AppError | Error,
    request: FastifyRequest,
    reply: FastifyReply
  ): void {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const validationError = ValidationError.fromZodError(error);
      const response: ErrorResponse = {
        ...validationError.toJSON(),
        timestamp: new Date().toISOString(),
        path: request.url,
      };

      logger.warn(
        {
          error: validationError.code,
          path: request.url,
          method: request.method,
          details: validationError.details,
        },
        'Validation error'
      );

      reply.code(validationError.statusCode).send(response);
      return;
    }

    // Handle AppError (our custom errors)
    if (error instanceof AppError) {
      const response: ErrorResponse = {
        ...error.toJSON(),
        timestamp: new Date().toISOString(),
        path: request.url,
      };

      const logLevel =
        error.statusCode >= 500 ? 'error' : error.statusCode >= 400 ? 'warn' : 'info';

      logger[logLevel](
        {
          error: error.code,
          statusCode: error.statusCode,
          path: request.url,
          method: request.method,
          details: error.details,
        },
        error.message
      );

      reply.code(error.statusCode).send(response);
      return;
    }

    // Handle Fastify errors
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      const fastifyError = error;
      const response: ErrorResponse = {
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: fastifyError.message || 'Internal server error',
        },
        timestamp: new Date().toISOString(),
        path: request.url,
      };

      logger.error(
        {
          error: fastifyError.name,
          statusCode: fastifyError.statusCode,
          path: request.url,
          method: request.method,
          stack: fastifyError.stack,
        },
        'Fastify error'
      );

      reply.code(fastifyError.statusCode || 500).send(response);
      return;
    }

    // Handle unknown errors
    const response: ErrorResponse = {
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Internal server error',
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    logger.error(
      {
        error: error.name,
        message: error.message,
        stack: error.stack,
        path: request.url,
        method: request.method,
      },
      'Unhandled error'
    );

    void reply.code(500).send(response);
  };
}
