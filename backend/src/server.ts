import express from 'express';
import cors from 'cors';
import { PriceStreamer } from './services/priceStreamer.js';

// Popular cryptocurrency examples for error messages
const POPULAR_CRYPTO_TICKERS = [
  'BTCUSD', 'ETHUSD', 'SOLUSD', 'ADAUSD', 'BNBUSD', 'XRPUSD', 'DOGEUSD',
  'MATICUSD', 'DOTUSD', 'AVAXUSD', 'LINKUSD', 'UNIUSD', 'LTCUSD', 'ATOMUSD',
  'NEARUSD', 'FTMUSD', 'ALGOUSD', 'VETUSD', 'ICPUSD', 'FILUSD', 'TRXUSD',
  'ETCUSD', 'XLMUSD', 'HBARUSD', 'MANAUSD', 'SANDUSD', 'AXSUSD', 'CHZUSD',
  'ENJUSD', 'BATUSD', 'ZECUSD', 'DASHUSD', 'XMRUSD', 'EOSUSD', 'XTZUSD',
  'AAVEUSD', 'COMPUSD', 'MKRUSD', 'SNXUSD', 'YFIUSD', 'SUSHIUSD', 'CRVUSD'
];

const app = express();
const PORT = process.env.PORT || 3001;
const WS_PORT = parseInt(process.env.WS_PORT || '3002', 10);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:3000'] 
    : true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize price streamer
const priceStreamer = new PriceStreamer(WS_PORT);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: Date.now(),
    uptime: process.uptime(),
    clients: priceStreamer.getClientCount(),
    tickers: priceStreamer.getTickerCount(),
    streaming: priceStreamer.isStreamingActive()
  });
});

// API Routes
app.post('/api/tickers', async (req, res) => {
  try {
    const { ticker } = req.body;
    
    // Input validation
    if (!ticker) {
      return res.status(400).json({ 
        error: 'Ticker is required',
        code: 'MISSING_TICKER'
      });
    }

    if (typeof ticker !== 'string') {
      return res.status(400).json({ 
        error: 'Ticker must be a string',
        code: 'INVALID_TICKER_TYPE'
      });
    }

    const normalizedTicker = ticker.toUpperCase().trim();
    
    if (!/^[A-Z0-9]+$/.test(normalizedTicker)) {
      return res.status(400).json({ 
        error: 'Ticker must contain only alphanumeric characters',
        code: 'INVALID_TICKER_FORMAT'
      });
    }

    if (normalizedTicker.length < 3 || normalizedTicker.length > 10) {
      return res.status(400).json({ 
        error: 'Ticker must be 3-10 characters long',
        code: 'INVALID_TICKER_LENGTH'
      });
    }

    // Check if ticker ends with USD
    if (!normalizedTicker.endsWith('USD')) {
      return res.status(400).json({ 
        error: 'Ticker must end with USD (e.g., BTCUSD)',
        code: 'INVALID_TICKER_FORMAT'
      });
    }

    // Check basic format (alphanumeric, reasonable length)
    if (!/^[A-Z0-9]+USD$/.test(normalizedTicker)) {
      return res.status(400).json({ 
        error: 'Ticker must contain only letters and numbers followed by USD',
        code: 'INVALID_TICKER_FORMAT'
      });
    }

    if (normalizedTicker.length < 4 || normalizedTicker.length > 15) {
      return res.status(400).json({ 
        error: 'Ticker must be 4-15 characters long (including USD)',
        code: 'INVALID_TICKER_LENGTH'
      });
    }

    // Check if ticker is already active
    if (priceStreamer.getActiveTickers().includes(normalizedTicker)) {
      return res.status(409).json({ 
        error: 'Ticker is already being tracked',
        code: 'TICKER_EXISTS'
      });
    }

    await priceStreamer.addTicker(normalizedTicker);
    
    res.json({ 
      success: true, 
      ticker: normalizedTicker,
      message: `Successfully added ${normalizedTicker}`
    });
    
  } catch (error) {
    console.error('Error adding ticker:', error);
    
    if (error instanceof Error) {
      // Check if it's a "not found on TradingView" or "not available on TradingView" error
      if (error.message.includes('not found on TradingView') || error.message.includes('not available on TradingView')) {
        res.status(404).json({ 
          error: error.message,
          code: 'TICKER_NOT_FOUND'
        });
      } else {
        res.status(500).json({ 
          error: error.message,
          code: 'ADD_TICKER_FAILED'
        });
      }
    } else {
      res.status(500).json({ 
        error: 'Failed to add ticker',
        code: 'UNKNOWN_ERROR'
      });
    }
  }
});

app.delete('/api/tickers/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    
    if (!ticker) {
      return res.status(400).json({ 
        error: 'Ticker parameter is required',
        code: 'MISSING_TICKER_PARAM'
      });
    }

    const normalizedTicker = ticker.toUpperCase().trim();
    
    // Check if ticker exists
    if (!priceStreamer.getActiveTickers().includes(normalizedTicker)) {
      return res.status(404).json({ 
        error: 'Ticker not found',
        code: 'TICKER_NOT_FOUND'
      });
    }

    await priceStreamer.removeTicker(normalizedTicker);
    
    res.json({ 
      success: true, 
      ticker: normalizedTicker,
      message: `Successfully removed ${normalizedTicker}`
    });
    
  } catch (error) {
    console.error('Error removing ticker:', error);
    
    if (error instanceof Error) {
      res.status(500).json({ 
        error: error.message,
        code: 'REMOVE_TICKER_FAILED'
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to remove ticker',
        code: 'UNKNOWN_ERROR'
      });
    }
  }
});

app.get('/api/tickers', (req, res) => {
  try {
    const tickers = priceStreamer.getActiveTickers();
    
    res.json({ 
      tickers,
      count: tickers.length,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error getting tickers:', error);
    res.status(500).json({ 
      error: 'Failed to get tickers',
      code: 'GET_TICKERS_FAILED'
    });
  }
});

// Get WebSocket connection info
app.get('/api/websocket', (req, res) => {
  res.json({
    url: `ws://localhost:${WS_PORT}`,
    port: WS_PORT,
    clients: priceStreamer.getClientCount(),
    streaming: priceStreamer.isStreamingActive()
  });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    path: req.originalUrl
  });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`🔌 WebSocket server will run on port ${WS_PORT}`);
  
  try {
    // Start price streaming
    await priceStreamer.startStreaming();
    console.log('✅ Price streaming started successfully');
  } catch (error) {
    console.error('❌ Failed to start price streaming:', error);
    process.exit(1);
  }
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Stop accepting new connections
    server.close(() => {
      console.log('✅ HTTP server closed');
    });
    
    // Stop price streaming
    await priceStreamer.stop();
    console.log('✅ Price streaming stopped');
    
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});