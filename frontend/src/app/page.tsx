'use client';

import { useState, useEffect } from 'react';
import { AddTickerForm } from '../components/AddTickerForm';
import { ThemeToggle } from '../components/ThemeToggle';
import { CryptoIcon } from '../components/CryptoIcon';
import { useWebSocket } from '../hooks/useWebSocket';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Activity, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { getShortTimeString } from '../utils/timeUtils';
import { PriceChart } from '../components/PriceChart';

export default function Home() {
  const [tickers, setTickers] = useState<string[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [previousPrices, setPreviousPrices] = useState<Record<string, number>>({});
  const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>({});
  const [dailyOpenPrices, setDailyOpenPrices] = useState<Record<string, number>>({});
  const [priceDataWithTradingView, setPriceDataWithTradingView] = useState<Record<string, any>>({});

  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(getShortTimeString());
  const { theme } = useTheme();

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(getShortTimeString());
    };
    
    updateTime(); // Set initial time
    const interval = setInterval(updateTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  const { connectionState, manualReconnect } = useWebSocket({
    onMessage: (message: any) => {
      switch (message.type) {
        case 'activeTickers':
          setTickers(message.data || []);
          break;
        case 'prices':
          const newPrices: Record<string, number> = {};
          const newPriceDataWithTradingView: Record<string, any> = {};
          if (Array.isArray(message.data)) {
          message.data.forEach((price: any) => {
              if (price && price.ticker && typeof price.price === 'number') {
            newPrices[price.ticker] = price.price;
            newPriceDataWithTradingView[price.ticker] = price; // Store full price data including TradingView data
              }
          });
            setPreviousPrices(prices);
          setPrices(prev => ({ ...prev, ...newPrices }));
          setPriceDataWithTradingView(prev => ({ ...prev, ...newPriceDataWithTradingView }));
          
          // Update price history for line charts
          setPriceHistory(prev => {
            const updated = { ...prev };
            Object.entries(newPrices).forEach(([ticker, newPrice]) => {
              const currentHistory = updated[ticker] || [];
              const newHistory = [...currentHistory, newPrice];
              // Keep only last 20 prices for the chart
              updated[ticker] = newHistory.slice(-20);
            });
            return updated;
          });
          
          // Set daily open price from TradingView data
          setDailyOpenPrices(prev => {
            const updated = { ...prev };
            Object.entries(newPriceDataWithTradingView).forEach(([ticker, priceData]) => {
              // Use the dailyOpenPrice from TradingView if available, otherwise keep existing
              if (priceData.dailyOpenPrice && typeof priceData.dailyOpenPrice === 'number') {
                updated[ticker] = priceData.dailyOpenPrice;
              } else if (!updated[ticker]) {
                // Fallback: use first price received if no daily open price available
                updated[ticker] = priceData.price;
              }
            });
            return updated;
          });
          

          }
          break;
        case 'error':
          console.error('WebSocket error:', message.data?.message || 'Unknown error occurred');
          break;
        case 'pong':
          // Handle pong response
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    },
    onConnect: () => {
      console.log('Connected to price stream');
    },
    onDisconnect: () => {
      console.log('Disconnected from price stream');
    }
  });

  const addTicker = async (ticker: string) => {
    if (!ticker.trim()) {
      console.error('Please enter a valid ticker symbol');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/tickers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: ticker.toUpperCase().trim() })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 404 && data.code === 'TICKER_NOT_FOUND') {
          throw new Error(data.error || 'Ticker not found on TradingView');
        } else if (response.status === 409 && data.code === 'TICKER_EXISTS') {
          throw new Error('Ticker is already being tracked');
        } else {
          throw new Error(data.error || 'Failed to add ticker');
        }
      }
      
      console.log(`Successfully added ${data.ticker}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add ticker';
      console.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const removeTicker = async (ticker: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/tickers/${ticker}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove ticker');
      }
      
      console.log(`Successfully removed ${data.ticker}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove ticker';
      console.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectionStatusColor = () => {
    if (connectionState.isConnected) return 'text-green-600 bg-green-100';
    if (connectionState.isConnecting) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConnectionStatusIcon = () => {
    if (connectionState.isConnected) return <Wifi size={16} />;
    if (connectionState.isConnecting) return <Activity size={16} className="animate-pulse" />;
    return <WifiOff size={16} />;
  };

  const getPriceChange = (ticker: string) => {
    const currentPrice = prices[ticker];
    const previousPrice = previousPrices[ticker];
    if (!currentPrice || !previousPrice) return null;
    return currentPrice - previousPrice;
  };

  const getPriceChangePercent = (ticker: string) => {
    const currentPrice = prices[ticker];
    const previousPrice = previousPrices[ticker];
    if (!currentPrice || !previousPrice) return null;
    return ((currentPrice - previousPrice) / previousPrice) * 100;
  };

  const getDailyGain = (ticker: string): { dollar: number; percent: number } | null => {
    const currentPrice = prices[ticker];
    const openPrice = dailyOpenPrices[ticker];
    if (!currentPrice || !openPrice) return null;
    
    const dollarChange = currentPrice - openPrice;
    const percentChange = (dollarChange / openPrice) * 100;
    
    return {
      dollar: dollarChange,
      percent: percentChange
    };
  };



  return (
    <div className="h-screen bg-background transition-all duration-700 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 h-full flex flex-col">
        {/* Compact Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-between items-center mb-6"
        >
          {/* Left: Title */}
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl md:text-3xl font-light text-foreground tracking-tight"
            >
              Crypto
              <span className="font-medium text-foreground"> Tracker</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-sm text-muted-foreground"
            >
              Real-time cryptocurrency prices
            </motion.p>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={{ 
                  scale: connectionState.isConnected ? [1, 1.1, 1] : 1,
                  opacity: connectionState.isConnected ? [0.7, 1, 0.7] : 0.7
                }}
                transition={{ 
                  duration: 2, 
                  repeat: connectionState.isConnected ? Infinity : 0 
                }}
                className={`p-1.5 rounded-full ${connectionState.isConnected ? 'bg-foreground/10' : 'bg-muted'}`}
              >
                {getConnectionStatusIcon()}
              </motion.div>
              <div>
                <p className={`text-xs font-medium ${connectionState.isConnected ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {connectionState.isConnected ? 'Live' : 
                   connectionState.isConnecting ? 'Connecting...' : 'Offline'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tickers.length} active
                </p>
              </div>
            </motion.div>
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </motion.div>
        
        {/* Error Display */}
        {connectionState.lastError && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8 bg-destructive/10 rounded-xl border border-destructive/20 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-destructive font-medium">
                {connectionState.lastError}
              </div>
              {connectionState.lastError === 'Max reconnection attempts reached' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={manualReconnect}
                  className="px-4 py-2 bg-destructive text-destructive-foreground text-sm rounded-lg hover:bg-destructive/90 transition-colors"
                >
                  Reconnect
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

                {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Left Column: Add Ticker */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-lg border border-border/30 p-6 sticky top-4">
              <div className="mb-4">
                <h2 className="text-lg font-light text-foreground mb-1">Add Ticker</h2>
                <p className="text-sm text-muted-foreground">Track real-time prices</p>
              </div>
              <AddTickerForm onAddTicker={addTicker} isLoading={isLoading} />
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Popular:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['BTCUSD', 'ETHUSD', 'SOLUSD', 'ADAUSD', 'BNBUSD', 'XRPUSD', 'DOGEUSD'].map((ticker) => (
                    <motion.button
                      key={ticker}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addTicker(ticker)}
                      className="px-2.5 py-1 text-xs bg-secondary hover:bg-accent rounded-full transition-colors font-medium"
                    >
                      {ticker}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Live Market Data */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="lg:col-span-2 h-full overflow-hidden"
          >

            {/* Live Market Data */}
            <AnimatePresence>
              {tickers.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-lg border border-border/30 p-6 h-full flex flex-col"
                >
                  <div className="mb-6 flex-shrink-0">
                    <h2 className="text-xl font-light text-foreground mb-1">Live Market Data</h2>
                    <p className="text-sm text-muted-foreground">Real-time cryptocurrency prices</p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                <AnimatePresence mode="popLayout">
                  {tickers.sort().map((ticker, index) => {
                  const price = prices[ticker];
                  const isPriceAvailable = price !== undefined && price !== null;
                  const priceChange = getPriceChange(ticker);
                  const priceChangePercent = getPriceChangePercent(ticker);
                  const dailyGain = getDailyGain(ticker);
                  
                  // Get TradingView daily change data
                  const latestPriceData = priceDataWithTradingView[ticker];
                  const tradingViewChange = latestPriceData?.change;
                  const tradingViewChangePercent = latestPriceData?.changePercent;
                  // console.log(`Frontend Card: TradingView data for ${ticker}:`, { tradingViewChange, tradingViewChangePercent, latestPriceData });
                  
                  const isPositive = tradingViewChange !== undefined ? 
                    tradingViewChange > 0 : 
                    (dailyGain ? dailyGain.dollar > 0 : (priceChange && priceChange > 0));
                  
                  return (
                    <motion.div
                      key={ticker}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ 
                        duration: 0.4, 
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        layout: { duration: 0.3, ease: "easeInOut" }
                      }}
                      whileHover={{ 
                        scale: 1.01,
                        transition: { duration: 0.2 }
                      }}
                      className="relative group"
                    >
                                            <div className="bg-card/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-border/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted/20">
                              <CryptoIcon ticker={ticker} size={20} />
                            </div>
                            <div>
                              <h3 className="font-mono text-lg font-semibold text-foreground">{ticker}</h3>
                              <p className="text-xs text-muted-foreground">
                                {isPriceAvailable ? 
                                  (priceDataWithTradingView[ticker]?.tradingViewTimestamp || currentTime) : 
                                  'Connecting...'
                                }
                              </p>
          </div>
        </div>

                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ 
                              scale: 1.1,
                              opacity: 1
                            }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeTicker(ticker)}
                            disabled={isLoading}
                            className="group-hover:opacity-100 p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-all duration-200 disabled:opacity-50"
                            title={`Remove ${ticker}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </motion.button>
                        </div>
                        
                        {/* Price Display */}
                        <div className="mb-3">
                          <motion.div 
                            key={price} // This will trigger animation when price changes
                            initial={{ scale: 1.05, opacity: 0.8 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ 
                              duration: 0.2,
                              ease: "easeOut"
                            }}
                            className="text-3xl font-light text-foreground mb-2"
                          >
                            {isPriceAvailable ? (
                              <div className="flex items-center gap-3">
                                <span>${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</span>
                                {(() => {
                                  // Get TradingView daily change data from the latest price data
                                  const latestPriceData = priceDataWithTradingView[ticker];
                                  console.log(`Frontend: Latest price data for ${ticker}:`, latestPriceData);
                                  if (latestPriceData && typeof latestPriceData.change === 'number' && typeof latestPriceData.changePercent === 'number') {
                                    const isPositive = latestPriceData.change > 0;
                                    return (
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className={`font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                          {latestPriceData.change > 0 ? '+' : ''}${latestPriceData.change.toFixed(2)}
                                        </span>
                                        <span className={`font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                          ({latestPriceData.changePercent > 0 ? '+' : ''}{latestPriceData.changePercent.toFixed(2)}%)
                                        </span>
                                      </div>
                                    );
                                  }
                                  
                                  // Only show loading if no TradingView data is available
                                  return (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                      <span>Loading...</span>
                                    </div>
                                  );
                                })()}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 border-2 border-muted-foreground border-t-primary rounded-full animate-spin"></div>
                                Loading...
                              </div>
                            )}
                          </motion.div>
                          
                          {/* Price Change */}
                          {isPriceAvailable && priceChange !== null && priceChangePercent !== null && (
                            <motion.div 
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ 
                                duration: 0.3,
                                delay: 0.1,
                                ease: "easeOut"
                              }}
                              className="flex items-center justify-between"
                            >
                              {/* Daily Price Change Amount */}
                              <div className={`flex items-center gap-1 text-sm font-medium ${
                                isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                              }`}>
                                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                <span>
                                                                  {tradingViewChange !== undefined ? 
                                  `${tradingViewChange > 0 ? '+' : ''}${tradingViewChange.toFixed(2)}` :
                                  'Loading...'
                                }
                                </span>
                              </div>
                              
                              {/* Daily Percentage Change */}
                              <div className={`text-sm font-semibold px-2 py-1 rounded-md ${
                                isPositive 
                                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
                                  : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                              }`}>
                                {tradingViewChangePercent !== undefined ? 
                                  `${tradingViewChangePercent > 0 ? '+' : ''}${tradingViewChangePercent.toFixed(2)}%` :
                                  'Loading...'
                                }
                              </div>
                            </motion.div>
                          )}
          </div>

                        {/* Price Chart */}
                        {isPriceAvailable && priceHistory[ticker] && priceHistory[ticker].length > 1 && (
                          <div className="mb-3">
                            <PriceChart 
                              prices={priceHistory[ticker]} 
                              isPositive={isPositive || false}
                              size={{ width: 200, height: 40 }}
                              className="w-full"
            />
          </div>
                        )}
                        
                        {/* Status Indicator */}
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isPriceAvailable ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`}></div>
                          <span className="text-xs text-muted-foreground">
                            {isPriceAvailable ? 'Live data' : 'Connecting...'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                  })}
                                    </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Show message when no tickers */}
            <AnimatePresence>
              {tickers.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-lg border border-border/30 p-8 text-center"
                >
                  <div className="w-12 h-12 bg-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-foreground" />
                  </div>
                  <h2 className="text-lg font-light text-foreground mb-2">Ready to Track Markets?</h2>
                  <p className="text-sm text-muted-foreground">
                    Add your first cryptocurrency ticker to start monitoring real-time prices.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>


      </div>
    </div>
  );
}