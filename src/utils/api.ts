export class TransientHtmlResponseError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'TransientHtmlResponseError';
    this.status = status;
  }
}

export async function parseJsonResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  const rawText = await res.text();
  const trimmed = rawText.trimStart();

  let parsed: unknown = {};
  if (trimmed.length > 0) {
    const looksLikeHtml =
      contentType.toLowerCase().includes('text/html') ||
      trimmed.startsWith('<!') ||
      trimmed.toLowerCase().startsWith('<html');

    if (looksLikeHtml) {
      throw new TransientHtmlResponseError(
        res.ok
          ? 'The backend API returned an HTML page instead of JSON. Please wait a moment for the server to finish starting and try again.'
          : `Authentication/API server is currently unavailable (HTTP ${res.status}). Please retry in a moment.`,
        res.status,
      );
    }

    try {
      parsed = JSON.parse(rawText);
    } catch {
      if (!res.ok) {
        throw new Error(`Request failed (${res.status}). Please try again.`);
      }
      throw new Error('Server returned an invalid JSON response. Please try again.');
    }
  }

  if (!res.ok) {
    const errorMsg =
      parsed &&
      typeof parsed === 'object' &&
      'error' in parsed &&
      typeof (parsed as { error?: unknown }).error === 'string'
        ? (parsed as { error: string }).error
        : `Request failed (${res.status})`;
    throw new Error(errorMsg);
  }

  return parsed as T;
}

function isRetryableMethodOrPath(url: string, method: string): boolean {
  const normalizedMethod = method.toUpperCase();
  if (normalizedMethod === 'GET' || normalizedMethod === 'HEAD') return true;
  // Login is idempotent and safe to retry during server cold-start
  if (normalizedMethod === 'POST' && url.startsWith('/api/auth/login')) return true;
  return false;
}

function isTransientGatewayStatus(status: number): boolean {
  return status === 502 || status === 503 || status === 504;
}

const DEFAULT_RETRY_DELAYS_MS = [600, 1200, 2200];

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
  token?: string | null,
  retryDelaysMs: number[] = DEFAULT_RETRY_DELAYS_MS,
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const canRetry = isRetryableMethodOrPath(url, method);
  const maxAttempts = canRetry ? retryDelaysMs.length + 1 : 1;

  let lastError: unknown = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const res = await fetch(url, {
        ...options,
        method,
        cache: 'no-store',
        headers,
      });

      if (canRetry && attempt < maxAttempts - 1 && isTransientGatewayStatus(res.status)) {
        await new Promise((resolve) => setTimeout(resolve, retryDelaysMs[attempt]));
        continue;
      }

      return await parseJsonResponse<T>(res);
    } catch (err) {
      lastError = err;
      const isRetryableError =
        err instanceof TransientHtmlResponseError ||
        (err instanceof TypeError && /fetch|network/i.test(err.message));

      if (canRetry && isRetryableError && attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelaysMs[attempt]));
        continue;
      }
      throw err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Request failed. Please try again.');
}
