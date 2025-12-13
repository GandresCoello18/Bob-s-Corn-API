import { FastifyReply, FastifyRequest } from 'fastify';

import { NotFoundError } from '@/application/errors/app-error';

export function notFoundHandler(request: FastifyRequest, reply: FastifyReply): void {
  const error = new NotFoundError(`Route ${request.method} ${request.url} not found`);
  const response = {
    ...error.toJSON(),
    timestamp: new Date().toISOString(),
    path: request.url,
  };

  void reply.code(error.statusCode).send(response);
}
