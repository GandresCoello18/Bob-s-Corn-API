import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { Logger } from '@config/logger';

export function registerRequestLogger(app: FastifyInstance, logger: Logger): void {
  app.addHook('onRequest', (request: FastifyRequest, _reply: FastifyReply, done) => {
    // Store start time in request context
    (request as FastifyRequest & { startTime?: number }).startTime = Date.now();
    done();
  });

  app.addHook('onSend', (request: FastifyRequest, reply: FastifyReply, payload, done) => {
    const reqWithTime = request as FastifyRequest & { startTime?: number };
    const startTime = reqWithTime.startTime || Date.now();
    const duration = Date.now() - startTime;

    const logData = {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: `${duration}ms`,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    };

    if (reply.statusCode >= 500) {
      logger.error(logData, 'Request completed with error');
    } else if (reply.statusCode >= 400) {
      logger.warn(logData, 'Request completed with client error');
    } else {
      logger.info(logData, 'Request completed');
    }

    done(null, payload);
  });
}
