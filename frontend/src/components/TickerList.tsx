'use client';

import { Trash2 } from 'lucide-react';

interface TickerListProps {
  tickers: string[];
  onRemoveTicker: (ticker: string) => void;
  isLoading?: boolean;
}

export function TickerList({ tickers, onRemoveTicker, isLoading }: TickerListProps) {
  if (tickers.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No tickers added yet. Add a ticker to start tracking prices.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tickers.map((ticker) => (
        <div
          key={ticker}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
        >
          <span className="font-mono text-lg font-semibold">{ticker}</span>
          <button
            onClick={() => onRemoveTicker(ticker)}
            disabled={isLoading}
            className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={`Remove ${ticker}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
