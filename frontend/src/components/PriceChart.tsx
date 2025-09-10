'use client';

import { useEffect, useState } from 'react';

interface PriceChartProps {
  prices: number[];
  isPositive: boolean;
  size?: { width: number; height: number };
  className?: string;
}

export function PriceChart({ prices, isPositive, size = { width: 100, height: 40 }, className = "" }: PriceChartProps) {
  const [chartData, setChartData] = useState<string>('');

  useEffect(() => {
    if (prices.length < 2) {
      setChartData('');
      return;
    }

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const points = prices.map((price, index) => {
      const x = (index / (prices.length - 1)) * size.width;
      const y = size.height - ((price - min) / range) * size.height;
      return `${x},${y}`;
    }).join(' ');

    setChartData(points);
  }, [prices, size.width, size.height]);

  if (prices.length < 2) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width: size.width, height: size.height }}
      >
        <div className="w-full h-px bg-muted-foreground/30"></div>
      </div>
    );
  }

  const strokeColor = isPositive ? '#10B981' : '#EF4444'; // Green for positive, red for negative

  return (
    <div className={className} style={{ width: size.width, height: size.height }}>
      <svg width={size.width} height={size.height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={chartData}
          className="drop-shadow-sm"
        />
        {/* Gradient fill */}
        <defs>
          <linearGradient id={`gradient-${isPositive ? 'up' : 'down'}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          fill={`url(#gradient-${isPositive ? 'up' : 'down'})`}
          points={`0,${size.height} ${chartData} ${size.width},${size.height}`}
        />
      </svg>
    </div>
  );
}
