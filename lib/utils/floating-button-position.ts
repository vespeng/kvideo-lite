export type FloatingAnchor = 'left' | 'right';

export interface FloatingButtonPosition {
  x: number;
  y: number;
}

export interface FloatingButtonViewport {
  width: number;
  height: number;
}

export interface FloatingButtonRatios {
  xRatio: number;
  yRatio: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getTravelDistance(size: number, buttonSize: number, margin: number) {
  return Math.max(0, size - buttonSize - margin * 2);
}

export function clampFloatingButtonPosition(
  position: FloatingButtonPosition,
  viewport: FloatingButtonViewport,
  buttonSize = 56,
  margin = 16,
): FloatingButtonPosition {
  return {
    x: clamp(
      position.x,
      margin,
      Math.max(margin, viewport.width - buttonSize - margin),
    ),
    y: clamp(
      position.y,
      margin,
      Math.max(margin, viewport.height - buttonSize - margin),
    ),
  };
}

export function getDefaultFloatingButtonPosition(
  viewport: FloatingButtonViewport,
  anchor: FloatingAnchor,
  defaultYRatio = 0.5,
  buttonSize = 56,
  margin = 16,
): FloatingButtonPosition {
  const x = anchor === 'left'
    ? margin
    : Math.max(margin, viewport.width - buttonSize - margin);
  const centeredY = viewport.height * defaultYRatio - buttonSize / 2;

  return clampFloatingButtonPosition(
    { x, y: centeredY },
    viewport,
    buttonSize,
    margin,
  );
}

/**
 * Convert a pixel position to a ratio within the draggable area. Using the
 * available travel distance keeps a button placed on an edge attached to
 * that edge when the viewport is resized.
 */
export function getFloatingButtonRatios(
  position: FloatingButtonPosition,
  viewport: FloatingButtonViewport,
  buttonSize = 56,
  margin = 16,
): FloatingButtonRatios {
  const clamped = clampFloatingButtonPosition(position, viewport, buttonSize, margin);
  const travelX = getTravelDistance(viewport.width, buttonSize, margin);
  const travelY = getTravelDistance(viewport.height, buttonSize, margin);

  return {
    xRatio: travelX === 0 ? 0 : clamp((clamped.x - margin) / travelX, 0, 1),
    yRatio: travelY === 0 ? 0 : clamp((clamped.y - margin) / travelY, 0, 1),
  };
}

export function getPositionFromFloatingButtonRatios(
  ratios: FloatingButtonRatios,
  viewport: FloatingButtonViewport,
  buttonSize = 56,
  margin = 16,
): FloatingButtonPosition {
  const travelX = getTravelDistance(viewport.width, buttonSize, margin);
  const travelY = getTravelDistance(viewport.height, buttonSize, margin);

  return clampFloatingButtonPosition(
    {
      x: margin + clamp(ratios.xRatio, 0, 1) * travelX,
      y: margin + clamp(ratios.yRatio, 0, 1) * travelY,
    },
    viewport,
    buttonSize,
    margin,
  );
}
