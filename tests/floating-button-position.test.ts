import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getDefaultFloatingButtonPosition,
  getFloatingButtonRatios,
  getPositionFromFloatingButtonRatios,
} from '@/lib/utils/floating-button-position';

const buttonSize = 56;
const margin = 16;

test('default right-anchored buttons follow the right edge after a viewport resize', () => {
  const initial = getDefaultFloatingButtonPosition(
    { width: 1280, height: 720 },
    'right',
    0.5,
    buttonSize,
    margin,
  );
  const resized = getDefaultFloatingButtonPosition(
    { width: 1920, height: 720 },
    'right',
    0.5,
    buttonSize,
    margin,
  );

  assert.equal(initial.x, 1208);
  assert.equal(resized.x, 1848);
  assert.equal(1280 - initial.x - buttonSize, margin);
  assert.equal(1920 - resized.x - buttonSize, margin);
});

test('default left-anchored buttons remain attached to the left edge', () => {
  const resized = getDefaultFloatingButtonPosition(
    { width: 1920, height: 900 },
    'left',
    0.5,
    buttonSize,
    margin,
  );

  assert.equal(resized.x, margin);
  assert.equal(resized.y, 422);
});

test('custom positions preserve their relative draggable-area placement on resize', () => {
  const initialViewport = { width: 1280, height: 720 };
  const initialPosition = { x: 1208, y: 332 };
  const ratios = getFloatingButtonRatios(initialPosition, initialViewport, buttonSize, margin);
  const resized = getPositionFromFloatingButtonRatios(
    ratios,
    { width: 1920, height: 900 },
    buttonSize,
    margin,
  );

  assert.equal(ratios.xRatio, 1);
  assert.equal(resized.x, 1848);
  assert.equal(resized.y, 422);
});
