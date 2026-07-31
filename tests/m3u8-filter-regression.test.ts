import assert from 'node:assert/strict';
import test from 'node:test';

import { filterM3u8Ad } from '../lib/utils/m3u8-utils';

function addBlock(
  lines: string[],
  durations: number[],
  origin: string,
  prefix: string,
): void {
  if (lines.length > 1) lines.push('#EXT-X-DISCONTINUITY');
  durations.forEach((duration, index) => {
    lines.push(`#EXTINF:${duration.toFixed(3)},`);
    lines.push(`${origin}/content/${prefix}-${index}.ts`);
  });
}

test('equal-size repeated content blocks are not treated as duplicate ads', () => {
  const lines = ['#EXTM3U'];
  addBlock(lines, [6, 6.1, 5.9], 'https://cdn.example.com', 'chapter-a');
  addBlock(lines, [6, 6.1, 5.9], 'https://cdn.example.com', 'chapter-b');

  const filtered = filterM3u8Ad(lines.join('\n'), 'https://cdn.example.com/content/index.m3u8');
  assert.equal(filtered.includes('/chapter-a-0.ts'), true);
  assert.equal(filtered.includes('/chapter-b-2.ts'), true);
});

test('uniform fixed-GOP content matching the main duration is protected', () => {
  const lines = ['#EXTM3U'];
  addBlock(lines, [2, 2, 2], 'https://cdn.example.com', 'chapter-a');
  addBlock(lines, [2, 2, 2, 2, 2], 'https://cdn.example.com', 'chapter-b');
  addBlock(lines, [2, 2, 2], 'https://cdn.example.com', 'chapter-c');

  const filtered = filterM3u8Ad(lines.join('\n'), 'https://cdn.example.com/content/index.m3u8');
  assert.equal(filtered.includes('/chapter-a-0.ts'), true);
  assert.equal(filtered.includes('/chapter-c-2.ts'), true);
});

test('a same-path cross-origin insert needs a filename mismatch before removal', () => {
  const lines = ['#EXTM3U'];
  addBlock(lines, [6, 6, 6, 6], 'https://media.example.com', 'main-a');
  addBlock(lines, [6, 6], 'https://ads.example.net', 'ad');
  addBlock(lines, [6, 6], 'https://media.example.com', 'main-b');

  const filtered = filterM3u8Ad(lines.join('\n'), 'https://media.example.com/content/index.m3u8');
  assert.equal(filtered.includes('ads.example.net'), false);
  assert.equal(filtered.includes('/main-a-0.ts'), true);
  assert.equal(filtered.includes('/main-b-1.ts'), true);
});

test('off mode returns the original playlist byte-for-byte', () => {
  const playlist = [
    '#EXTM3U',
    '#EXT-X-CUE-IN',
    '#EXTINF:4.000,',
    'relative/segment.ts',
  ].join('\n');

  assert.equal(filterM3u8Ad(playlist, 'https://cdn.example.com/index.m3u8', 'off'), playlist);
});
