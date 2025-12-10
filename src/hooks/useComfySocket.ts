import { useEffect, useRef, useState, useCallback } from 'react';
import { ServerConnection } from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';

export interface ProcessStatus {
  status: 'running' | 'stopped' | 'starting' | 'error';
  message: string;
}

interface SocketMessage {
  type: 'status' | 'log';
  data: any;
}

export function useComfySocket() {
  const [status, setStatus] = useState<ProcessStatus['status']>('stopped');
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number>();

  const connect = useCallback(() => {
    const settings = ServerConnection.makeSettings();
    const token = settings.token;
    
    const namespace = 'comfyui-cockpit';
    const socketUrl = URLExt.join(
        settings.wsUrl,
        namespace,
        'socket'
    );

    // Token auth support
    const urlWithAuth = token ? `${socketUrl}?token=${token}` : socketUrl;

    console.debug('Connecting to WebSocket:', urlWithAuth);
    const ws = new WebSocket(urlWithAuth);

    ws.onopen = () => {
      console.log('ComfyUI Socket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg: SocketMessage = JSON.parse(event.data);
        if (msg.type === 'status') {
          const { status: newStatus, message: newMessage } = msg.data;
          setStatus(newStatus);
          setMessage(newMessage);
        }
      } catch (e) {
        console.error('Error parsing socket message:', e);
      }
    };

    ws.onclose = () => {
      console.log('ComfyUI Socket disconnected');
      setIsConnected(false);
      socketRef.current = null;
      // Reconnect after 3s
      reconnectTimeoutRef.current = window.setTimeout(connect, 3000);
    };

    ws.onerror = (err) => {
      console.error('ComfyUI Socket error:', err);
      // onerror will likely trigger onclose, so we let onclose handle reconnection
    };

    socketRef.current = ws;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) {
        // Prevent reconnection if unmounted
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        // Remove onclose handler to prevent reconnect logic running on cleanup
        socketRef.current.onclose = null;
        socketRef.current.close();
      }
    };
  }, [connect]);

  return { status, message, isConnected };
}

