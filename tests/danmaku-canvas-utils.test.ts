import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampDanmakuY,
  resolveDanmakuCanvasMetrics,
  scaleDanmakuCoordinate,
} from '@/lib/player/danmaku-canvas-utils';

test('resolveDanmakuCanvasMetrics prefers layout dimensions over transformed bounding dimensions', () => {
  const metrics = resolveDanmakuCanvasMetrics({
    computedWidth: 320,
    computedHeight: 568,
    clientWidth: 320,
    clientHeight: 568,
    boundingWidth: 568,
    boundingHeight: 320,
    devicePixelRatio: 3,
  });

  assert.deepEqual(metrics, {
    width: 320,
    height: 568,
    dpr: 3,
    bitmapWidth: 960,
    bitmapHeight: 1704,
  });
});

test('resolveDanmakuCanvasMetrics falls back to bounding dimensions when layout dimensions are unavailable', () => {
  const metrics = resolveDanmakuCanvasMetrics({
    boundingWidth: 640,
    boundingHeight: 360,
    devicePixelRatio: 2,
  });

  assert.deepEqual(metrics, {
    width: 640,
    height: 360,
    dpr: 2,
    bitmapWidth: 1280,
    bitmapHeight: 720,
  });
});

test('resolveDanmakuCanvasMetrics ignores invalid sizes and invalid device pixel ratios', () => {
  const metrics = resolveDanmakuCanvasMetrics({
    computedWidth: 0,
    computedHeight: Number.NaN,
    clientWidth: 375,
    clientHeight: 211,
    devicePixelRatio: Number.NaN,
  });

  assert.deepEqual(metrics, {
    width: 375,
    height: 211,
    dpr: 1,
    bitmapWidth: 375,
    bitmapHeight: 211,
  });
});

test('scaleDanmakuCoordinate preserves relative placement after resize', () => {
  assert.equal(scaleDanmakuCoordinate(160, 320, 640), 320);
  assert.equal(scaleDanmakuCoordinate(40, 320, 240), 30);
});

test('clampDanmakuY keeps comments inside the effective display area', () => {
  assert.equal(clampDanmakuY(4, 20, 120), 20);
  assert.equal(clampDanmakuY(200, 20, 120), 112);
  assert.equal(clampDanmakuY(64, 20, 120), 64);
});
