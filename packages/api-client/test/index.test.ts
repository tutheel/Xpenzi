import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { createApiClient, StandardApiErrorSchema } from '../src';

const sampleSchema = z.object({
  status: z.literal('ok'),
  data: z.object({
    id: z.string(),
  }),
});

describe('api-client', () => {
  it('parses a successful response', async () => {
    const fetcher = async () =>
      new Response(
        JSON.stringify({
          status: 'ok',
          data: { id: '123' },
        }),
        { status: 200 },
      );

    const client = createApiClient({
      baseUrl: 'https://api.example.com/',
      fetcher,
    });

    const result = await client.request({
      path: '/demo',
      schema: sampleSchema,
    });

    expect(result.data.data.id).toBe('123');
  });

  it('raises on schema mismatch', async () => {
    const fetcher = async () =>
      new Response(JSON.stringify({ status: 'error', message: 'oops' }), { status: 200 });

    const client = createApiClient({
      baseUrl: 'https://api.example.com/',
      fetcher,
    });

    await expect(
      client.request({
        path: '/demo',
        schema: sampleSchema,
      }),
    ).rejects.toThrow('Response validation failed');
  });

  it('exposes shared error schema', () => {
    const parsed = StandardApiErrorSchema.safeParse({
      status: 'error',
      message: 'Invalid request',
      code: 'BadRequest',
    });

    expect(parsed.success).toBe(true);
  });
});
