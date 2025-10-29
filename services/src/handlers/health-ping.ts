import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { z } from 'zod';

import { logger } from '../lib/logger';

const querySchema = z
  .object({
    tenantId: z.string().min(1).optional(),
  })
  .default({});

export const handler = (
  event: APIGatewayProxyEventV2,
): APIGatewayProxyStructuredResultV2 => {
  const parsedQuery = querySchema.safeParse(event.queryStringParameters ?? {});
  if (!parsedQuery.success) {
    logger.warn('Health ping query parameters invalid', { issues: parsedQuery.error.issues });
    return {
      statusCode: 400,
      body: JSON.stringify({
        status: 'error',
        message: 'Invalid query parameters',
        issues: parsedQuery.error.issues,
      }),
    };
  }

  logger.info('Health check invoked', {
    requestId: event.requestContext.requestId,
    tenantId: parsedQuery.data.tenantId ?? 'anonymous',
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: 'ok',
      tenantId: parsedQuery.data.tenantId ?? null,
      timestamp: new Date().toISOString(),
    }),
    headers: {
      'content-type': 'application/json',
    },
  };
};
