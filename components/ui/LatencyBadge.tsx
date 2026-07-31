/**
 * LatencyBadge - Display latency with color coding
 * Following Liquid Glass design system
 */

import React, { memo, useMemo } from 'react';
import { getLatencyInfo } from '@/lib/utils/latency';

interface LatencyBadgeProps {
  latency: number;
  className?: string;
}

export const LatencyBadge = memo(function LatencyBadge({ latency, className = '' }: LatencyBadgeProps) {
  // Memoize the latency info calculation
  const info = useMemo(() => getLatencyInfo(latency), [latency]);

  return (
    <span
      className={`
        inline-flex items-center justify-center
        px-1.5 py-0.5
        rounded-[var(--radius-full)]
        text-[10px] font-mono font-semibold
        border
        ${className}
      `}
      style={{
        backgroundColor: `${info.color}30`,
        borderColor: info.color,
        color: info.color,
        willChange: 'auto',
        transform: 'translate3d(0,0,0)',
      }}
      title={`Response time: ${info.label} (${info.level})`}
      aria-label={`Latency: ${info.label}`}
    >
      {info.label}
    </span>
  );
});
