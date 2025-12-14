import { AppError, BadRequestError, NotFoundError, ValidationError } from './app-error';
import { ZodError } from 'zod';

describe('AppError', () => {
  it('should create an AppError with correct properties', () => {
    const error = new AppError('BAD_REQUEST' as any, 'Test error', 400);

    expect(error.code).toBe('BAD_REQUEST');
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('AppError');
  });

  it('should serialize to JSON correctly', () => {
    const error = new BadRequestError('Invalid input');
    const json = error.toJSON();

    expect(json).toHaveProperty('error');
    expect(json.error).toHaveProperty('code');
    expect(json.error).toHaveProperty('message');
    expect(json.error.code).toBe('BAD_REQUEST');
    expect(json.error.message).toBe('Invalid input');
  });

  it('should include details in JSON when provided', () => {
    const details = { field: 'email', reason: 'invalid format' };
    const error = new ValidationError('Validation failed', details);
    const json = error.toJSON();

    expect(json.error).toHaveProperty('details');
    expect(json.error.details).toEqual(details);
  });

  it('should create ValidationError from ZodError', () => {
    const zodError = new ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: ['email'],
        message: 'Expected string, received number',
      },
    ]);

    const error = ValidationError.fromZodError(zodError);

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.statusCode).toBe(422);
    expect(error.message).toBe('Validation failed');
    expect(error.details).toEqual([{ path: 'email', message: 'Expected string, received number' }]);
  });

  it('should create NotFoundError with default message', () => {
    const error = new NotFoundError();

    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
  });
});
