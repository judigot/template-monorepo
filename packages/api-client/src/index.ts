/**
 * Shared API contracts and a typed client for the Hono API.
 *
 * This package is runtime-agnostic: it only relies on the Web Standard
 * `fetch`, `Request`, and `Response` APIs available in Node.js, Bun,
 * and browsers.
 */

export interface IHelloResponse {
  message: string;
}

export interface IGetHelloOptions {
  /**
   * Base URL of the deployed API, e.g. `https://api.example.com`.
   * An empty string performs a same-origin request, which is what the
   * Vite dev-server proxy expects during local development.
   */
  baseUrl?: string;
  signal?: AbortSignal;
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.url = url;
  }
}

export function buildApiUrl(baseUrl: string, path: string): string {
  const trimmedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBase}${normalizedPath}`;
}

function isHelloResponse(value: unknown): value is IHelloResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  );
}

export async function getHello(
  options: IGetHelloOptions = {},
): Promise<IHelloResponse> {
  const { baseUrl = '', signal } = options;
  const url = buildApiUrl(baseUrl, '/api/hello');

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new ApiRequestError(
      `GET ${url} failed with status ${String(response.status)}`,
      response.status,
      url,
    );
  }

  const payload: unknown = await response.json();

  if (!isHelloResponse(payload)) {
    throw new ApiRequestError(
      `GET ${url} returned an unexpected response shape`,
      response.status,
      url,
    );
  }

  return payload;
}
