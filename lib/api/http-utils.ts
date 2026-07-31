/**
 * HTTP Utilities for API calls
 * Handles timeouts and retries
 */

// Disable SSL verification for video sources with invalid certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const REQUEST_TIMEOUT = 15000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 200;

/**
 * Fetch with timeout support
 * Accepts an optional external AbortSignal for cancellation cascade.
 */
export async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout: number = REQUEST_TIMEOUT
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // If an external signal is provided, propagate its abort
    const externalSignal = options.signal;
    let onAbort: (() => void) | undefined;
    if (externalSignal) {
        if (externalSignal.aborted) {
            controller.abort();
        } else {
            onAbort = () => controller.abort();
            externalSignal.addEventListener('abort', onAbort, { once: true });
        }
    }

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } finally {
        clearTimeout(timeoutId);
        if (externalSignal && onAbort) {
            externalSignal.removeEventListener('abort', onAbort);
        }
    }
}

/**
 * Retry logic wrapper
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    retries: number = MAX_RETRIES
): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (lastError?.name === 'AbortError') {
                throw lastError;
            }

            if (i < retries) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
            }
        }
    }

    throw lastError;
}
