import { FastifyRequest } from 'fastify';
import { ZodSchema, ZodError } from 'zod';

import { ValidationError } from '../errors/app-error';

export interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validateRequest<T = unknown>(
  request: FastifyRequest,
  schemas: ValidationSchemas
): T {
  const errors: ZodError[] = [];

  if (schemas.body) {
    try {
      request.body = schemas.body.parse(request.body);
    } catch (error) {
      if (error instanceof ZodError) {
        errors.push(error);
      }
    }
  }

  if (schemas.query) {
    try {
      request.query = schemas.query.parse(request.query);
    } catch (error) {
      if (error instanceof ZodError) {
        errors.push(error);
      }
    }
  }

  if (schemas.params) {
    try {
      request.params = schemas.params.parse(request.params);
    } catch (error) {
      if (error instanceof ZodError) {
        errors.push(error);
      }
    }
  }

  if (errors.length > 0) {
    const combinedErrors = errors.flatMap((err) => err.errors);
    const combinedZodError = new ZodError(combinedErrors);
    throw ValidationError.fromZodError(combinedZodError);
  }

  return request as T;
}
