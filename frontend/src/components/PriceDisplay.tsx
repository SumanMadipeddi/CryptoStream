'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceDisplayProps {
  tickers: string[];
  prices: Record<string, number>;
}

export function PriceDisplay({ tickers, prices }: PriceDisplayProps) {
  if (tickers.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No tickers to display. Add a ticker to see live prices.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tickers.map((ticker) => {
        const price = prices[ticker];
        return (
          <div
            key={ticker}
            className="p-4 bg-gray-50 rounded-lg border"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-mono text-lg font-semibold">{ticker}</h3>
              <TrendingUp size={16} className="text-green-600" />
            </div>
            <div className="text-2xl font-bold">
              {price ? `$${price.toLocaleString()}` : 'Loading...'}
            </div>
            <div className="text-sm text-gray-500">
              {price ? 'Live price' : 'Connecting...'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
