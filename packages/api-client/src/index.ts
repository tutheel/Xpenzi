import { z } from 'zod';

export type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface ApiClientOptions {
  baseUrl: string;
  getToken?: () => Promise<string | undefined>;
  fetcher?: Fetcher;
}

export interface ApiResult<T> {
  data: T;
  response: Response;
}

const defaultFetcher: Fetcher = (input, init) => fetch(input, init);

export function createApiClient(options: ApiClientOptions) {
  const fetchImpl = options.fetcher ?? defaultFetcher;

  async function request<TSchema extends z.ZodType>({
    path,
    method = 'GET',
    body,
    schema,
    headers,
    searchParams,
  }: {
    path: string;
    method?: string;
    body?: unknown;
    schema: TSchema;
    headers?: Record<string, string>;
    searchParams?: URLSearchParams | Record<string, string | number | boolean | undefined>;
  }): Promise<ApiResult<z.output<TSchema>>> {
    const url = new URL(path.replace(/^\//, ''), options.baseUrl);
    if (searchParams) {
      const params = searchParams instanceof URLSearchParams ? searchParams : new URLSearchParams();
      if (!(searchParams instanceof URLSearchParams)) {
        Object.entries(searchParams)
          .filter(([, value]) => value !== undefined)
          .forEach(([key, value]) => {
            params.append(key, String(value));
          });
      }
      url.search = params.toString();
    }

    const token = options.getToken ? await options.getToken() : undefined;
    const response = await fetchImpl(url, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });

    const json: unknown = await response.json().catch(() => undefined);
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      throw new Error('Response validation failed', { cause: parsed.error });
    }

    return {
      data: parsed.data,
      response,
    };
  }

  return {
    request,
  };
}

export const StandardApiErrorSchema = z.object({
  status: z.literal('error'),
  message: z.string(),
  code: z.string().optional(),
  issues: z.array(z.unknown()).optional(),
});

export type StandardApiError = z.infer<typeof StandardApiErrorSchema>;
