export interface DanmakuCanvasSizeCandidates {
  computedWidth?: number;
  computedHeight?: number;
  clientWidth?: number;
  clientHeight?: number;
  offsetWidth?: number;
  offsetHeight?: number;
  boundingWidth?: number;
  boundingHeight?: number;
  devicePixelRatio?: number;
}

export interface DanmakuCanvasMetrics {
  width: number;
  height: number;
  dpr: number;
  bitmapWidth: number;
  bitmapHeight: number;
}

const METRIC_EPSILON = 0.5;

function pickPositiveFinite(values: Array<number | undefined>): number | null {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value;
    }
  }

  return null;
}

function normalizeDpr(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 1;
}

export function resolveDanmakuCanvasMetrics(
  candidates: DanmakuCanvasSizeCandidates,
): DanmakuCanvasMetrics | null {
  const width = pickPositiveFinite([
    candidates.computedWidth,
    candidates.clientWidth,
    candidates.offsetWidth,
    candidates.boundingWidth,
  ]);
  const height = pickPositiveFinite([
    candidates.computedHeight,
    candidates.clientHeight,
    candidates.offsetHeight,
    candidates.boundingHeight,
  ]);

  if (width === null || height === null) {
    return null;
  }

  const dpr = normalizeDpr(candidates.devicePixelRatio);

  return {
    width,
    height,
    dpr,
    bitmapWidth: Math.max(1, Math.round(width * dpr)),
    bitmapHeight: Math.max(1, Math.round(height * dpr)),
  };
}

export function haveDanmakuCanvasMetricsChanged(
  previous: DanmakuCanvasMetrics | null,
  next: DanmakuCanvasMetrics,
): boolean {
  if (!previous) return true;

  return (
    Math.abs(previous.width - next.width) > METRIC_EPSILON ||
    Math.abs(previous.height - next.height) > METRIC_EPSILON ||
    Math.abs(previous.dpr - next.dpr) > 0.01 ||
    previous.bitmapWidth !== next.bitmapWidth ||
    previous.bitmapHeight !== next.bitmapHeight
  );
}

export function scaleDanmakuCoordinate(value: number, previousSize: number, nextSize: number): number {
  if (!Number.isFinite(value) || previousSize <= 0 || nextSize <= 0) {
    return value;
  }

  return value * (nextSize / previousSize);
}

export function clampDanmakuY(value: number, fontSize: number, effectiveHeight: number): number {
  const minY = Math.max(0, fontSize);
  const maxY = Math.max(minY, effectiveHeight - fontSize * 0.4);

  return Math.min(maxY, Math.max(minY, value));
}
