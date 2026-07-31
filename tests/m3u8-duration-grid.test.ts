import assert from 'node:assert/strict';
import test from 'node:test';

import { filterM3u8Ad } from '../lib/utils/m3u8-utils';

interface PlaylistBlock {
  durations: number[];
  prefix: string;
}

function buildPlaylist(blocks: PlaylistBlock[]): string {
  const lines = ['#EXTM3U'];
  blocks.forEach((block, blockIndex) => {
    if (blockIndex > 0) lines.push('#EXT-X-DISCONTINUITY');
    block.durations.forEach((duration, segmentIndex) => {
      lines.push(`#EXTINF:${duration.toFixed(3)},`);
      lines.push(`https://cdn.example.com/content/${block.prefix}-${segmentIndex}.ts`);
    });
  });
  return lines.join('\n');
}

test('NTSC-like duration residues remove a small block only with another signal', () => {
  const playlist = buildPlaylist([
    { durations: [4, 4, 4, 4, 4], prefix: 'main-a' },
    { durations: [4.867, 3.333], prefix: 'ad' },
    { durations: [4, 4, 4], prefix: 'main-b' },
  ]);

  const filtered = filterM3u8Ad(playlist, 'https://cdn.example.com/content/index.m3u8');
  assert.equal(filtered.includes('/ad-0.ts'), false);
  assert.equal(filtered.includes('/main-a-0.ts'), true);
  assert.equal(filtered.includes('/main-b-2.ts'), true);
});

test('one legitimate NTSC-like segment is not deleted from an integer-duration stream', () => {
  const playlist = buildPlaylist([
    { durations: [4, 4.033, 4, 4, 4], prefix: 'main' },
  ]);

  const filtered = filterM3u8Ad(playlist, 'https://cdn.example.com/content/index.m3u8');
  assert.equal(filtered.includes('/main-1.ts'), true);
});

test('a dominant NTSC-like main stream keeps later matching content blocks', () => {
  const playlist = buildPlaylist([
    { durations: [4.033, 4.867, 3.333, 4.167], prefix: 'main-a' },
    { durations: [4.033, 4.867, 3.333], prefix: 'main-b' },
  ]);

  const filtered = filterM3u8Ad(playlist, 'https://cdn.example.com/content/index.m3u8');
  assert.equal(filtered.includes('/main-a-0.ts'), true);
  assert.equal(filtered.includes('/main-b-2.ts'), true);
});

test('integer-duration inserts are detected inside a film-24-like stream', () => {
  const playlist = buildPlaylist([
    { durations: [4.004, 4.004, 4.004, 4.004], prefix: 'main-a' },
    { durations: [4, 4, 4, 0.56], prefix: 'ad' },
    { durations: [4.004, 4.004], prefix: 'main-b' },
  ]);

  const filtered = filterM3u8Ad(playlist, 'https://cdn.example.com/content/index.m3u8');
  assert.equal(filtered.includes('/ad-0.ts'), false);
  assert.equal(filtered.includes('/ad-3.ts'), false);
  assert.equal(filtered.includes('/main-b-1.ts'), true);
});
