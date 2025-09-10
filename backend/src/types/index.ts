export interface PriceData {
  ticker: string;
  price: number;
  timestamp: number;
  change?: number;
  changePercent?: number;
  dailyOpenPrice?: number;
  tradingViewTimestamp?: string;
}

export interface TickerInfo {
  ticker: string;
  url: string;
  isActive: boolean;
}

export interface WebSocketMessage {
  type: 'prices' | 'activeTickers' | 'error';
  data: any;
}