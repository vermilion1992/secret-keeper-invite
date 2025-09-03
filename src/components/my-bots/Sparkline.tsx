'use client';
import * as React from 'react';

type Props = { data?: number[]; width?: number; height?: number; strokeWidth?: number };

export default function Sparkline({ data = [], width = 120, height = 32, strokeWidth = 2 }: Props) {
  if (!data || data.length < 2) {
    return <div className="text-xs opacity-60">no data</div>;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / span) * height;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label="sparkline">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        points={points}
      />
    </svg>
  );
}