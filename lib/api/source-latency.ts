export interface SourceLatencyResult {
  latency: number;
  success: boolean;
  timeout: boolean;
  method: 'HEAD' | 'GET';
}

type ProbeAttemptResult = SourceLatencyResult;

interface ProbeSourceLatencyOptions {
  fetcher?: typeof fetch;
  timeoutMs?: number;
  now?: () => number;
}

async function probeAttempt(
  url: string,
  method: 'HEAD' | 'GET',
  fetcher: typeof fetch,
  timeoutMs: number,
  now: () => number,
): Promise<ProbeAttemptResult> {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const startedAt = now();

  try {
    await fetcher(url, {
      method,
      signal: controller.signal,
      redirect: 'follow',
      ...(method === 'GET' ? { headers: { Range: 'bytes=0-0' } } : {}),
    });

    return {
      latency: Math.max(0, Math.round(now() - startedAt)),
      success: true,
      timeout: false,
      method,
    };
  } catch (error) {
    return {
      latency: Math.max(0, Math.round(now() - startedAt)),
      success: false,
      timeout: timedOut || (error instanceof Error && error.name === 'AbortError'),
      method,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function probeSourceLatency(
  url: string,
  options: ProbeSourceLatencyOptions = {},
): Promise<SourceLatencyResult> {
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? 5000;
  const now = options.now ?? (() => performance.now());

  const headResult = await probeAttempt(url, 'HEAD', fetcher, timeoutMs, now);
  if (headResult.success) return headResult;

  return probeAttempt(url, 'GET', fetcher, timeoutMs, now);
}
