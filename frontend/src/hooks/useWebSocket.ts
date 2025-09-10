import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * WebSocket message interface for type safety
 */
interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: number;
}

/**
 * Configuration options for the WebSocket hook
 */
interface UseWebSocketOptions {
  onMessage: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

/**
 * Current connection state information
 */
interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
  lastError: string | null;
}

/**
 * Custom React hook for managing WebSocket connections
 * 
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Connection state management
 * - Error handling and recovery
 * - Manual reconnection capability
 * - Proper cleanup on unmount
 * 
 * @param options - Configuration object with event handlers
 * @returns WebSocket management functions and connection state
 */
export function useWebSocket(options: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const { onMessage, onConnect, onDisconnect, onError } = options;
  
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0,
    lastError: null
  });

  const maxReconnectAttempts = 3;
  const reconnectDelay = 3000;

  const connect = useCallback(() => {
    // Prevent multiple simultaneous connections
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket already connected or connecting, skipping...');
      return;
    }

    // Clean up existing connection properly
    if (wsRef.current) {
      console.log('Cleaning up existing WebSocket connection...');
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    console.log('🔄 Attempting to connect to WebSocket...');
    setConnectionState(prev => ({ ...prev, isConnecting: true, lastError: null }));

    try {
      wsRef.current = new WebSocket('ws://localhost:3002');
      
      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected');
        reconnectAttemptsRef.current = 0;
        setConnectionState({
          isConnected: true,
          isConnecting: false,
          reconnectAttempts: 0,
          lastError: null
        });
        onConnect?.();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          onMessage(message);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };



      wsRef.current.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setConnectionState(prev => ({ 
          ...prev, 
          isConnected: false, 
          isConnecting: false 
        }));
        onDisconnect?.();
        
        // Only reconnect if it wasn't a manual close and we haven't exceeded max attempts
        if (event.code !== 1000 && event.code !== 1001 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(reconnectDelay * Math.pow(1.5, reconnectAttemptsRef.current - 1), 10000);
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          setConnectionState(prev => ({ 
            ...prev, 
            reconnectAttempts: reconnectAttemptsRef.current 
          }));
          
          reconnectTimeoutRef.current = setTimeout(() => {
            // Only reconnect if we don't already have a connection
            if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
              connect();
            }
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.log('❌ Max reconnection attempts reached');
          setConnectionState(prev => ({ 
            ...prev, 
            lastError: 'Max reconnection attempts reached' 
          }));
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionState(prev => ({ 
          ...prev, 
          lastError: 'Connection error',
          isConnecting: false 
        }));
        onError?.(error);
      };
    } catch (error) {
      console.error('❌ Error creating WebSocket:', error);
      setConnectionState(prev => ({ 
        ...prev, 
        lastError: 'Failed to create connection',
        isConnecting: false 
      }));
    }
  }, [onMessage, onConnect, onDisconnect, onError, maxReconnectAttempts, reconnectDelay]);

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket...');
    
    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Properly close WebSocket connection
    if (wsRef.current) {
      // Remove all event listeners to prevent memory leaks
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;

      
      // Close the connection
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close(1000, 'Manual disconnect');
      }
      wsRef.current = null;
    }
    
    // Update connection state
    setConnectionState(prev => ({ 
      ...prev, 
      isConnected: false, 
      isConnecting: false 
    }));
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send message:', message);
    }
  }, []);

  useEffect(() => {
    // Only connect once when component mounts
    if (!wsRef.current) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, []); // Empty dependency array to prevent re-creation

  const manualReconnect = useCallback(() => {
    console.log('🔄 Manual reconnect requested');
    reconnectAttemptsRef.current = 0;
    setConnectionState(prev => ({ 
      ...prev, 
      reconnectAttempts: 0,
      lastError: null 
    }));
    disconnect();
    setTimeout(() => {
      connect();
    }, 1000);
  }, [connect, disconnect]);

  return { 
    sendMessage, 
    connect, 
    disconnect, 
    manualReconnect,
    connectionState 
  };
}