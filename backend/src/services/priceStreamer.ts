import { WebSocketServer } from 'ws';
import { TradingViewScraper } from './tradingViewScraper.js';
import type { PriceData } from '../types/index.js';

interface WebSocketClient {
  ws: any;
  id: string;
  lastPing: number;
}

export class PriceStreamer {
  private wss: WebSocketServer;
  private scraper: TradingViewScraper;
  private clients: Map<string, WebSocketClient> = new Map();
  private streamingInterval: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private isStreaming = false;
  private readonly STREAM_INTERVAL = 500; // 500ms for lower latency
  private readonly PING_INTERVAL = 60000; // 60 seconds
  private readonly CLIENT_TIMEOUT = 120000; // 120 seconds

  constructor(port: number) {
    this.wss = new WebSocketServer({ 
      port,
      perMessageDeflate: false // Disable compression for lower latency
    });
    this.scraper = new TradingViewScraper();
    this.setupWebSocketServer();
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      const client: WebSocketClient = {
        ws,
        id: clientId,
        lastPing: Date.now()
      };
      
      this.clients.set(clientId, client);
      console.log(`🔌 New client connected: ${clientId} (${this.clients.size} total)`);

      // Send current active tickers to new client
      this.sendToClient(client, {
        type: 'activeTickers',
        data: this.scraper.getActiveTickers(),
        timestamp: Date.now()
      });

      // Handle client messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(client, message);
        } catch (error) {
          console.error(`❌ Invalid message from client ${clientId}:`, error);
          this.sendToClient(client, {
            type: 'error',
            data: { message: 'Invalid message format' },
            timestamp: Date.now()
          });
        }
      });

      ws.on('close', () => {
        console.log(`🔌 Client disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });

      ws.on('error', (error) => {
        console.error(`❌ WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });

      ws.on('pong', () => {
        client.lastPing = Date.now();
      });

      // Send initial ping to establish connection
      setTimeout(() => {
        if (client.ws.readyState === 1) {
          client.ws.ping();
        }
      }, 1000);
    });

    this.wss.on('error', (error) => {
      console.error('❌ WebSocket server error:', error);
    });
  }

  private handleClientMessage(client: WebSocketClient, message: any): void {
    switch (message.type) {
      case 'ping':
        this.sendToClient(client, {
          type: 'pong',
          data: { timestamp: Date.now() },
          timestamp: Date.now()
        });
        break;
      case 'getTickers':
        this.sendToClient(client, {
          type: 'activeTickers',
          data: this.scraper.getActiveTickers(),
          timestamp: Date.now()
        });
        break;
      default:
        console.log(`📨 Unknown message type from client ${client.id}:`, message.type);
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sendToClient(client: WebSocketClient, message: any): void {
    try {
      if (client.ws.readyState === 1) { // WebSocket.OPEN
        client.ws.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error(`❌ Error sending to client ${client.id}:`, error);
      this.clients.delete(client.id);
    }
  }

  private broadcast(message: any): void {
    const data = JSON.stringify(message);
    const deadClients: string[] = [];
    
    this.clients.forEach((client) => {
      try {
        if (client.ws.readyState === 1) { // WebSocket.OPEN
          client.ws.send(data);
        } else {
          deadClients.push(client.id);
        }
      } catch (error) {
        console.error(`❌ Error broadcasting to client ${client.id}:`, error);
        deadClients.push(client.id);
      }
    });
    
    // Clean up dead clients
    deadClients.forEach(clientId => {
      this.clients.delete(clientId);
    });
  }

  async startStreaming(): Promise<void> {
    if (this.isStreaming) {
      console.log('⚠️ Streaming already started');
      return;
    }

    try {
      await this.scraper.initialize();
      this.isStreaming = true;
      
      // Start price streaming
      this.streamingInterval = setInterval(async () => {
        try {
          const prices = await this.scraper.getAllPrices();
          
          if (prices.length > 0) {
            console.log(`📊 Price data being sent to clients:`, prices);
            this.broadcast({
              type: 'prices',
              data: prices,
              timestamp: Date.now()
            });
            
            console.log(`📊 Streaming ${prices.length} price updates to ${this.clients.size} clients`);
          }
        } catch (error) {
          console.error('❌ Error streaming prices:', error);
          
          // Broadcast error to clients
          this.broadcast({
            type: 'error',
            data: { 
              message: 'Failed to fetch prices',
              timestamp: Date.now()
            },
            timestamp: Date.now()
          });
        }
      }, this.STREAM_INTERVAL);

      // Start ping/pong mechanism
      this.pingInterval = setInterval(() => {
        this.pingClients();
      }, this.PING_INTERVAL);

      console.log(`📡 Price streaming started (${this.STREAM_INTERVAL}ms intervals)`);
    } catch (error) {
      console.error('❌ Failed to start streaming:', error);
      this.isStreaming = false;
      throw error;
    }
  }

  private pingClients(): void {
    const now = Date.now();
    const deadClients: string[] = [];
    
    this.clients.forEach((client) => {
      try {
        if (client.ws.readyState === 1) { // WebSocket.OPEN
          client.ws.ping();
          
          // Check for timeout
          if (now - client.lastPing > this.CLIENT_TIMEOUT) {
            console.log(`⏰ Client ${client.id} timed out`);
            deadClients.push(client.id);
          }
        } else {
          deadClients.push(client.id);
        }
      } catch (error) {
        console.error(`❌ Error pinging client ${client.id}:`, error);
        deadClients.push(client.id);
      }
    });
    
    // Clean up dead clients
    deadClients.forEach(clientId => {
      this.clients.delete(clientId);
    });
  }

  async addTicker(ticker: string): Promise<void> {
    try {
      await this.scraper.addTicker(ticker);
      
      // Broadcast updated ticker list
      this.broadcast({
        type: 'activeTickers',
        data: this.scraper.getActiveTickers(),
        timestamp: Date.now()
      });
      
      console.log(`✅ Ticker ${ticker} added and broadcasted to ${this.clients.size} clients`);
    } catch (error) {
      console.error(`❌ Failed to add ticker ${ticker}:`, error);
      throw error;
    }
  }

  async removeTicker(ticker: string): Promise<void> {
    try {
      await this.scraper.removeTicker(ticker);
      
      // Broadcast updated ticker list
      this.broadcast({
        type: 'activeTickers',
        data: this.scraper.getActiveTickers(),
        timestamp: Date.now()
      });
      
      console.log(`✅ Ticker ${ticker} removed and broadcasted to ${this.clients.size} clients`);
    } catch (error) {
      console.error(`❌ Failed to remove ticker ${ticker}:`, error);
      throw error;
    }
  }

  getActiveTickers(): string[] {
    return this.scraper.getActiveTickers();
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getTickerCount(): number {
    return this.scraper.getTickerCount();
  }

  isStreamingActive(): boolean {
    return this.isStreaming;
  }

  async stop(): Promise<void> {
    console.log('🛑 Stopping price streaming...');
    
    this.isStreaming = false;
    
    if (this.streamingInterval) {
      clearInterval(this.streamingInterval);
      this.streamingInterval = null;
    }
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    // Close all client connections
    this.clients.forEach((client) => {
      try {
        client.ws.close();
      } catch (error) {
        console.warn(`Failed to close client ${client.id}:`, error);
      }
    });
    this.clients.clear();
    
    // Cleanup scraper
    await this.scraper.cleanup();
    
    // Close WebSocket server
    this.wss.close();
    
    console.log('✅ Price streaming stopped');
  }
}