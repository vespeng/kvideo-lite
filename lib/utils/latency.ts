/**
 * Latency utilities for displaying response times
 * Following Liquid Glass design system principles
 */

interface LatencyInfo {
  value: number;
  label: string;
  color: string;
  level: 'excellent' | 'good' | 'fair' | 'slow';
}

export interface LatencyProbeTarget {
  id: string;
  baseUrl: string;
}

export interface LatencyProbeResult {
  id: string;
  latency: number | null;
}

export async function probeLatencyTargets(
  targets: LatencyProbeTarget[],
  probe: (target: LatencyProbeTarget) => Promise<number | null>,
  concurrency: number = 4,
): Promise<LatencyProbeResult[]> {
  if (targets.length === 0) return [];

  const results = new Array<LatencyProbeResult>(targets.length);
  const workerCount = Math.min(
    targets.length,
    Math.max(1, Math.floor(concurrency)),
  );
  let nextIndex = 0;

  const workers = Array.from({ length: workerCount }, async () => {
    while (nextIndex < targets.length) {
      const index = nextIndex;
      nextIndex += 1;
      const target = targets[index];
      results[index] = {
        id: target.id,
        latency: await probe(target),
      };
    }
  });

  await Promise.all(workers);
  return results;
}

/**
 * Get latency information with color coding
 * @param latency - Response time in milliseconds
 * @returns Formatted latency info with color and level
 */
export function getLatencyInfo(latency: number): LatencyInfo {
  let level: LatencyInfo['level'];
  let color: string;

  if (latency < 500) {
    level = 'excellent';
    color = '#34c759'; // Green
  } else if (latency < 1000) {
    level = 'good';
    color = '#30d158'; // Light green
  } else if (latency < 2000) {
    level = 'fair';
    color = '#ff9500'; // Orange
  } else {
    level = 'slow';
    color = '#ff3b30'; // Red
  }

  return {
    value: latency,
    label: formatLatency(latency),
    color,
    level,
  };
}



/**
 * Format latency for display
 * @param latency - Response time in milliseconds
 * @returns Formatted string in milliseconds (e.g., "345ms", "1240ms")
 */
function formatLatency(latency: number): string {
  return `${latency}ms`;
}
