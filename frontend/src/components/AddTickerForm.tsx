'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles, AlertCircle } from 'lucide-react';

interface AddTickerFormProps {
  onAddTicker: (ticker: string) => void;
  isLoading?: boolean;
}

// Popular cryptocurrency examples for suggestions
const POPULAR_CRYPTO_TICKERS = [
  'BTCUSD', 'ETHUSD', 'SOLUSD', 'ADAUSD', 'BNBUSD', 'XRPUSD', 'DOGEUSD',
  'MATICUSD', 'DOTUSD', 'AVAXUSD', 'LINKUSD', 'UNIUSD', 'LTCUSD', 'ATOMUSD',
  'NEARUSD', 'FTMUSD', 'ALGOUSD', 'VETUSD', 'ICPUSD', 'FILUSD', 'TRXUSD',
  'ETCUSD', 'XLMUSD', 'HBARUSD', 'MANAUSD', 'SANDUSD', 'AXSUSD', 'CHZUSD',
  'ENJUSD', 'BATUSD', 'ZECUSD', 'DASHUSD', 'XMRUSD', 'EOSUSD', 'XTZUSD',
  'AAVEUSD', 'COMPUSD', 'MKRUSD', 'SNXUSD', 'YFIUSD', 'SUSHIUSD', 'CRVUSD'
];

export function AddTickerForm({ onAddTicker, isLoading: externalLoading }: AddTickerFormProps) {
  const [ticker, setTicker] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const loading = isLoading || externalLoading;

  const validateTicker = (tickerValue: string): string | null => {
    const cleanTicker = tickerValue.trim().toUpperCase();
    
    // Check if ticker ends with USD
    if (!cleanTicker.endsWith('USD')) {
      return 'Ticker must end with USD (e.g., BTCUSD)';
    }
    
    // Check basic format (alphanumeric, reasonable length)
    if (!/^[A-Z0-9]+USD$/.test(cleanTicker)) {
      return 'Ticker must contain only letters and numbers followed by USD';
    }
    // if (!/^[A-Z0-9]+$/.test(cleanTicker)) {
    //   return 'Ticker must contain only letters and numbers';
    // }
    
    if (cleanTicker.length < 4 || cleanTicker.length > 15) {
      return 'Ticker must be 4-15 characters long (including USD)';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticker.trim()) return;
    
    // Clear previous error
    setError('');
    
    // Validate ticker
    const validationError = validateTicker(ticker);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsLoading(true);
    try {
      await onAddTicker(ticker.trim().toUpperCase());
      setTicker('');
      setError(''); // Clear error on success
    } catch (error) {
      console.error('Error adding ticker:', error);
      
      // Check if it's a TradingView availability error
      if (error instanceof Error && (error.message.includes('not available on TradingView') || error.message.includes('not found on TradingView'))) {
        setError(error.message);
      } else if (error instanceof Error && error.message.includes('not a supported cryptocurrency')) {
        setError(error.message);
      } else if (error instanceof Error && error.message.includes('already being tracked')) {
        setError(error.message);
      } else {
        setError('Failed to add ticker. Please check if the ticker exists on TradingView.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setTicker(value);
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type="text"
          value={ticker}
          onChange={handleTickerChange}
          placeholder="Enter ticker (e.g., BTCUSD)"
          className={`flex-1 px-4 py-3 bg-input border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-foreground placeholder:text-muted-foreground ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-border'
          }`}
          disabled={loading}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={!ticker.trim() || loading}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles size={16} />
            </motion.div>
          ) : (
            <Plus size={16} />
          )}
          {loading ? 'Adding...' : 'Add'}
        </motion.button>
      </form>
      
      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </motion.div>
      )}
    </div>
  );
}
