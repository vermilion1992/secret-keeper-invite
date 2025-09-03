'use client';
import * as React from 'react';

export default function Sparkline({ data = [], width = 120, height = 32, strokeWidth = 2 }: { data?: number[]; width?: number; height?: number; strokeWidth?: number }) {
  if (!data || data.length < 2) return <div className="text-xs opacity-60">no data</div>;
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1, step = width / (data.length - 1);
  const pts = data.map((v, i) => `${(i*step).toFixed(2)},${(height - ((v-min)/span)*height).toFixed(2)}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label="sparkline">
      <polyline fill="none" stroke="currentColor" strokeWidth={strokeWidth} points={pts} />
    </svg>
  );
}