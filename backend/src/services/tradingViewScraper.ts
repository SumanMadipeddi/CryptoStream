import { chromium, type Browser, type Page } from 'playwright';
import type { PriceData, TickerInfo } from '../types/index.js';
export class TradingViewScraper {
  private browser: Browser | null = null;
  private pages: Map<string, Page> = new Map();
  private activeTickers: Set<string> = new Set();
  private maxRetries = 2;
  private retryDelay = 500;
  private lastPriceUpdate: Map<string, number> = new Map();
  private readonly PRICE_CACHE_DURATION = 200; // Cache prices for 200ms

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Playwright browser in headless mode...');
    
    try {
    this.browser = await chromium.launch({
        headless: true, // MUST be true for headedless mode
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ]
    });
    
    console.log('✅ Browser initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error);
      throw new Error('Browser initialization failed');
    }
  }

  async addTicker(ticker: string): Promise<void> {
    // Validate ticker format
    if (!ticker || typeof ticker !== 'string') {
      throw new Error('Invalid ticker: must be a non-empty string');
    }

    const normalizedTicker = ticker.toUpperCase().trim();
    
    if (!/^[A-Z0-9]+$/.test(normalizedTicker)) {
      throw new Error(`Invalid ticker format: ${ticker}. Only alphanumeric characters allowed.`);
    }

    if (normalizedTicker.length < 3 || normalizedTicker.length > 10) {
      throw new Error(`Invalid ticker length: ${ticker}. Must be 3-10 characters.`);
    }

    if (this.activeTickers.has(normalizedTicker)) {
      console.log(`⚠️ Ticker ${normalizedTicker} is already being tracked`);
      return;
    }

    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    console.log(`📈 Adding ticker: ${normalizedTicker}`);
    
    const url = `https://www.tradingview.com/symbols/${normalizedTicker}/?exchange=BINANCE`;
    
    try {
      // Create new page for this ticker
      const page = await this.browser.newPage();
      
      // Set realistic user agent and viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      
      // Set extra headers to appear more like a real browser
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      });
      
      // Navigate to TradingView page
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 5000 
      });

      // IMMEDIATE ERROR CHECK - Check for error page right after navigation
      const errorPageTitle = await page.$('.tv-http-error-page__title');
      if (errorPageTitle) {
        const errorText = await errorPageTitle.textContent();
        if (errorText && errorText.includes("This isn't the page you're looking for")) {
          await page.close();
          throw new Error(`"${normalizedTicker}" is not found on TradingView. Please verify the ticker and try again.`);
        }
      }
      
      // Also check page content for error indicators
      const pageContent = await page.content();
      if (pageContent.includes('tv-http-error-page__title') && 
          pageContent.includes("This isn't the page you're looking for")) {
        await page.close();
        throw new Error(`"${normalizedTicker}" is not found on TradingView. Please verify the ticker symbol and try again.`);
      }
      
      // If we get here, the ticker is valid - add it to active tickers
      this.pages.set(normalizedTicker, page);
      this.activeTickers.add(normalizedTicker);
      
      console.log(`✅ Successfully added ticker: ${normalizedTicker}`);
      
    } catch (error) {
      console.error(`❌ Failed to add ticker ${normalizedTicker}:`, error);
      // Clean up page if it was created
      const page = this.pages.get(normalizedTicker);
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          console.warn('Failed to close page during cleanup:', closeError);
        }
        this.pages.delete(normalizedTicker);
      }
      throw error;
    }
  }

  async removeTicker(ticker: string): Promise<void> {
    const normalizedTicker = ticker.toUpperCase().trim();
    console.log(`📉 Removing ticker: ${normalizedTicker}`);
    
    const page = this.pages.get(normalizedTicker);
    if (page) {
      try {
      await page.close();
      } catch (error) {
        console.warn(`Failed to close page for ${normalizedTicker}:`, error);
      }
      this.pages.delete(normalizedTicker);
    }
    
    this.activeTickers.delete(normalizedTicker);
    console.log(`✅ Successfully removed ticker: ${normalizedTicker}`);
  }

  async getPrice(ticker: string): Promise<PriceData | null> {
    const normalizedTicker = ticker.toUpperCase().trim();
    const page = this.pages.get(normalizedTicker);
    if (!page) {
      return null;
    }

    // Check if we should skip this update due to caching
    const now = Date.now();
    const lastUpdate = this.lastPriceUpdate.get(normalizedTicker) || 0;
    if (now - lastUpdate < this.PRICE_CACHE_DURATION) {
      return null; // Skip this update, too soon
    }

    try {
      // Primary TradingView selectors for price
      const priceSelectors = [
        '.js-symbol-last',
        '.last-zoF9r75I',
        '.tv-symbol-price-quote__value',
        '[data-field="last_price"]'
      ];

      let priceText: string | null = null;
      
      for (const selector of priceSelectors) {
        try {
          priceText = await page.textContent(selector, { timeout: 1000 });
          if (priceText && priceText.trim()) {
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!priceText || !priceText.trim()) {
        return null;
      }

      // Parse price
      const cleanPrice = priceText
        .replace(/[^\d.,-]/g, '')
        .replace(/,/g, '')
        .trim();
      
      const price = parseFloat(cleanPrice);
      
      if (isNaN(price) || price <= 0) {
        return null;
      }

      // Get daily change data
      let dailyChange: number | null = null;
      let dailyChangePercent: number | null = null;
      
      try {
        const changeSelectors = [
          '.js-symbol-change-direction span:first-child',
          '.change-zoF9r75I span:first-child'
        ];
        
        const changePercentSelectors = [
          '.js-symbol-change-pt',
          '.change-zoF9r75I .js-symbol-change-pt'
        ];
        
        // Get daily change amount
        for (const selector of changeSelectors) {
          try {
            const changeText = await page.textContent(selector, { timeout: 1000 });
            if (changeText && changeText.trim()) {
              let cleanChange = changeText.trim();
              const hasSign = cleanChange.startsWith('+') || cleanChange.startsWith('−') || cleanChange.startsWith('-');
              const sign = cleanChange.startsWith('+') ? '+' : (cleanChange.startsWith('−') || cleanChange.startsWith('-') ? '-' : '');
              
              cleanChange = cleanChange.replace(/[^\d.,+-]/g, '').replace(/,/g, '');
              
              if (hasSign && !cleanChange.startsWith('+') && !cleanChange.startsWith('-')) {
                cleanChange = sign + cleanChange;
              }
              
              const change = parseFloat(cleanChange);
              if (!isNaN(change)) {
                dailyChange = change;
                break;
              }
            }
          } catch (e) {
            continue;
          }
        }
        
        // Get daily change percentage
        for (const selector of changePercentSelectors) {
          try {
            const changePercentText = await page.textContent(selector, { timeout: 1000 });
            if (changePercentText && changePercentText.trim()) {
              let cleanChangePercent = changePercentText.trim();
              const hasSign = cleanChangePercent.startsWith('+') || cleanChangePercent.startsWith('−') || cleanChangePercent.startsWith('-');
              const sign = cleanChangePercent.startsWith('+') ? '+' : (cleanChangePercent.startsWith('−') || cleanChangePercent.startsWith('-') ? '-' : '');
              
              cleanChangePercent = cleanChangePercent.replace(/[^\d.,+-]/g, '').replace(/,/g, '');
              
              if (hasSign && !cleanChangePercent.startsWith('+') && !cleanChangePercent.startsWith('-')) {
                cleanChangePercent = sign + cleanChangePercent;
              }
              
              const changePercent = parseFloat(cleanChangePercent);
              if (!isNaN(changePercent)) {
                dailyChangePercent = changePercent;
                break;
              }
            }
          } catch (e) {
            continue;
          }
        }
      } catch (error) {
        console.warn(`Could not get daily change data for ${normalizedTicker}:`, error);
      }

      // Get timestamp
      let timestamp: string | null = null;
      try {
        const timestampText = await page.textContent('.js-symbol-lp-time', { timeout: 1000 });
        if (timestampText && timestampText.trim()) {
          timestamp = timestampText.trim();
        }
      } catch (error) {
        // Ignore timestamp errors
      }

      // Update cache timestamp
      this.lastPriceUpdate.set(normalizedTicker, now);

      const result: PriceData = {
        ticker: normalizedTicker,
        price,
        timestamp: Date.now()
      };
      
      if (dailyChange !== null) {
        result.change = dailyChange;
      }
      
      if (dailyChangePercent !== null) {
        result.changePercent = dailyChangePercent;
      }
      
      if (timestamp !== null) {
        result.tradingViewTimestamp = timestamp;
      }
      
      return result;
      
    } catch (error) {
      console.error(`❌ Error getting price for ${normalizedTicker}:`, error);
      return null;
    }
  }

  async getAllPrices(): Promise<PriceData[]> {
    const pricePromises = Array.from(this.activeTickers).map(async (ticker) => {
      try {
        return await this.getPrice(ticker);
      } catch (error) {
        console.error(`Error getting price for ${ticker}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(pricePromises);
    return results.filter((price): price is PriceData => price !== null);
  }

  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up Playwright resources...');
    
    // Close all pages first
    for (const [ticker, page] of this.pages) {
      try {
        await page.close();
      } catch (error) {
        console.warn(`Failed to close page for ${ticker}:`, error);
      }
    }
    
    // Close browser
    if (this.browser) {
      try {
      await this.browser.close();
      } catch (error) {
        console.warn('Failed to close browser:', error);
      }
      this.browser = null;
    }
    
    // Clear all data structures
    this.pages.clear();
    this.activeTickers.clear();
    
    console.log('✅ Cleanup completed');
  }

  getActiveTickers(): string[] {
    return Array.from(this.activeTickers).sort(); // Sort alphabetically as required
  }

  getTickerCount(): number {
    return this.activeTickers.size;
  }

  isTickerActive(ticker: string): boolean {
    return this.activeTickers.has(ticker.toUpperCase().trim());
  }
}