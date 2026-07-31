import test from 'node:test';
import assert from 'node:assert/strict';

import { withRetry } from '@/lib/api/http-utils';
import { probeSourceLatency } from '@/lib/api/source-latency';
import { processSearchStream } from '@/lib/utils/search-stream';
import { probeLatencyTargets } from '@/lib/utils/latency';

test('search stream does not complete during a slow but active source search', async () => {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode('data: {"type":"start","totalSources":1}\n\n'));

      setTimeout(() => {
        controller.enqueue(encoder.encode(
          'data: {"type":"videos","source":"slow","videos":[{"vod_id":1,"vod_name":"测试影片","source":"slow"}]}\n\n',
        ));
        controller.enqueue(encoder.encode(
          'data: {"type":"complete","totalVideosFound":1,"totalSources":1}\n\n',
        ));
        controller.close();
      }, 3200);
    },
  });

  let completionCount = 0;
  const receivedTitles: string[] = [];

  await processSearchStream({
    reader: stream.getReader(),
    currentQuery: '测试',
    onStart: () => {},
    onVideos: (videos) => receivedTitles.push(...videos.map((video) => video.vod_name)),
    onProgress: () => {},
    onComplete: () => { completionCount += 1; },
    onError: (message) => assert.fail(message),
  });

  assert.deepEqual(receivedTitles, ['测试影片']);
  assert.equal(completionCount, 1);
});

test('GET fallback latency excludes the failed HEAD attempt duration', async () => {
  const timestamps = [0, 5000, 5000, 5250];
  const methods: string[] = [];
  const fetcher: typeof fetch = async (_input, init) => {
    methods.push(init?.method ?? 'GET');
    if (init?.method === 'HEAD') {
      throw new Error('HEAD unsupported');
    }
    return new Response(null, { status: 200 });
  };

  const result = await probeSourceLatency('https://example.com', {
    fetcher,
    now: () => timestamps.shift() ?? 5250,
  });

  assert.deepEqual(methods, ['HEAD', 'GET']);
  assert.deepEqual(result, {
    latency: 250,
    success: true,
    timeout: false,
    method: 'GET',
  });
});

test('latency probes cap concurrent outbound requests', async () => {
  const targets = Array.from({ length: 10 }, (_, index) => ({
    id: `source-${index}`,
    baseUrl: `https://example.com/${index}`,
  }));
  let active = 0;
  let maxActive = 0;

  const results = await probeLatencyTargets(targets, async () => {
    active += 1;
    maxActive = Math.max(maxActive, active);
    await new Promise((resolve) => setTimeout(resolve, 10));
    active -= 1;
    return 42;
  }, 3);

  assert.equal(maxActive, 3);
  assert.equal(results.length, targets.length);
  assert.equal(results.every((result) => result.latency === 42), true);
});

test('aborted source requests are not retried', async () => {
  let attempts = 0;
  const abortError = new Error('aborted');
  abortError.name = 'AbortError';

  await assert.rejects(
    withRetry(async () => {
      attempts += 1;
      throw abortError;
    }),
    { name: 'AbortError' },
  );

  assert.equal(attempts, 1);
});
