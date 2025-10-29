import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { handler } from '../src/handlers/health-ping';

function createEvent(overrides: Partial<APIGatewayProxyEventV2> = {}): APIGatewayProxyEventV2 {
  return {
    version: '2.0',
    routeKey: 'GET /health',
    rawPath: '/health',
    rawQueryString: '',
    headers: {},
    requestContext: {
      accountId: 'test',
      apiId: 'local',
      domainName: 'example.com',
      domainPrefix: 'example',
      http: {
        method: 'GET',
        path: '/health',
        protocol: 'HTTP/1.1',
        sourceIp: '127.0.0.1',
        userAgent: 'vitest',
      },
      routeKey: 'GET /health',
      requestId: 'test-request',
      stage: 'test',
      time: new Date().toISOString(),
      timeEpoch: Date.now(),
    },
    isBase64Encoded: false,
    ...overrides,
  };
}

const successSchema = z.object({
  status: z.literal('ok'),
  tenantId: z.string().nullable(),
  timestamp: z.string(),
});

const errorSchema = z.object({
  status: z.literal('error'),
  message: z.string(),
  issues: z.unknown().optional(),
});

describe('health-ping handler', () => {
  it('returns ok status for simple invocation', () => {
    const response = handler(createEvent());
    expect(response.statusCode).toBe(200);
    const { body } = response;
    if (typeof body !== 'string') {
      throw new Error('Expected response body to be defined');
    }
    const bodyJson: unknown = JSON.parse(body);
    const payload = successSchema.parse(bodyJson);
    expect(payload.status).toBe('ok');
  });

  it('rejects invalid query parameters', () => {
    const response = handler(
      createEvent({
        queryStringParameters: {
          tenantId: '',
        },
      }),
    );

    expect(response.statusCode).toBe(400);
    const { body } = response;
    if (typeof body !== 'string') {
      throw new Error('Expected response body to be defined');
    }
    const bodyJson: unknown = JSON.parse(body);
    const payload = errorSchema.parse(bodyJson);
    expect(payload.status).toBe('error');
  });
});
