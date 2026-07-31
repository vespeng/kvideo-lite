import assert from 'node:assert/strict';
import test from 'node:test';
import {
  findDuplicateSignatureBlockIndices,
  parseBlocks,
  scoreBlock,
  learnMainPattern,
} from '../lib/utils/m3u8-ad-detector';
import { filterM3u8Ad } from '../lib/utils/m3u8-utils';

function buildBlockPlaylist(blocks: number[][]): string {
  const lines = ['#EXTM3U', '#EXT-X-VERSION:3', '#EXT-X-TARGETDURATION:10'];
  blocks.forEach((durations, blockIndex) => {
    if (blockIndex > 0) {
      lines.push('#EXT-X-DISCONTINUITY');
    }
    durations.forEach((duration, segmentIndex) => {
      lines.push(`#EXTINF:${duration.toFixed(3)},`);
      lines.push(`https://cdn.example.com/content/seg-${blockIndex}-${segmentIndex}.ts`);
    });
  });
  lines.push('#EXT-X-ENDLIST');
  return lines.join('\n');
}

test('findDuplicateSignatureBlockIndices flags repeated ad duration fingerprints', () => {
  const playlist = buildBlockPlaylist([
    [2.0, 2.0, 2.0], // ad A
    [6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0], // main content
    [2.0, 2.0, 2.0], // ad A again
    [1.5, 1.5, 1.5], // unique short block
  ]);
  const blocks = parseBlocks(playlist.split('\n'));
  const duplicates = findDuplicateSignatureBlockIndices(blocks);

  assert.equal(duplicates.has(0), true);
  assert.equal(duplicates.has(2), true);
  assert.equal(duplicates.has(1), false);
  assert.equal(duplicates.has(3), false);
});

test('scoreBlock returns max score for duplicate signature blocks', () => {
  const playlist = buildBlockPlaylist([
    [2.0, 2.0, 2.0],
    [6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0, 6.0],
    [2.0, 2.0, 2.0],
  ]);
  const blocks = parseBlocks(playlist.split('\n'));
  const mainPattern = learnMainPattern(blocks);
  const score = scoreBlock(blocks[0], mainPattern, [], true);
  assert.equal(score, 10);
});

test('filterM3u8Ad removes duplicate-signature ad blocks while keeping main content', () => {
  const playlist = buildBlockPlaylist([
    [2.002, 2.002, 2.002],
    [6.006, 6.006, 6.006, 6.006, 6.006, 6.006, 6.006, 6.006, 6.006, 6.006],
    [2.002, 2.002, 2.002],
  ]);

  const filtered = filterM3u8Ad(playlist, 'https://cdn.example.com/content/index.m3u8', 'heuristic');

  assert.equal(filtered.includes('seg-0-0.ts'), false);
  assert.equal(filtered.includes('seg-2-0.ts'), false);
  assert.equal(filtered.includes('seg-1-0.ts'), true);
  assert.equal(filtered.includes('seg-1-9.ts'), true);
});

test('filterM3u8Ad still strips interstitial DATERANGE metadata', () => {
  const playlist = [
    '#EXTM3U',
    '#EXT-X-VERSION:3',
    '#EXT-X-DATERANGE:ID="ad1",CLASS="com.apple.hls.interstitial",START-DATE="2024-01-01T00:00:00Z",X-ASSET-URI="https://ads.example.com/ad.m3u8"',
    '#EXTINF:6.000,',
    'https://cdn.example.com/main/seg-0.ts',
    '#EXT-X-ENDLIST',
  ].join('\n');

  const filtered = filterM3u8Ad(playlist, 'https://cdn.example.com/main/index.m3u8', 'heuristic');
  assert.equal(filtered.includes('com.apple.hls.interstitial'), false);
  assert.equal(filtered.includes('seg-0.ts'), true);
});
