import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Divider,
} from '@mui/material';
import { ProcessStatusArea } from './ProcessStatusArea';
import { useComfySocket } from '../../hooks/useComfySocket';
import { requestAPI } from '../../handler';

export const ProcessPanel = () => {
  const { status, message, logs, isConnected } = useComfySocket();
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [isStartPending, setIsStartPending] = useState(false);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const controlProcess = async (action: 'start' | 'stop' | 'restart') => {
    if (action === 'start') {
      setIsStartPending(true);
    }
    try {
      await requestAPI<{ status: string; message: string }>('process', {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
    } catch (error) {
      console.error(`Error ${action}ing process:`, error);
      if (action === 'start') {
        setIsStartPending(false);
      }
    }
  };

  useEffect(() => {
    if (isStartPending && (status === 'starting' || status === 'running' || status === 'error')) {
      setIsStartPending(false);
    }
  }, [status, isStartPending]);

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      {/* Status Area */}
      <ProcessStatusArea 
        status={status}
        message={message}
        onStart={() => controlProcess('start')}
        onStop={() => controlProcess('stop')}
        onRestart={() => controlProcess('restart')}
        isStartPending={isStartPending}
      />
      
      {!isConnected && (
          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
              Disconnected from server. Reconnecting...
          </Typography>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Logs */}
      <Typography
       variant="subtitle1"
       sx={{
        mb: 1,
       }}
      >
        Logs
      </Typography>
      <Box
        sx={{
          backgroundColor: '#111',
          color: '#eee',
          p: 2,
          borderRadius: 1,
          fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
          flexGrow: 1,
          overflowY: 'auto',
          minHeight: 0,
          fontSize: '0.85rem',
          lineHeight: 1.4,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all'
        }}
      >
        {logs.length === 0 ? (
            <Typography variant="body2" sx={{ opacity: 0.5 }}>
                Waiting for logs...
            </Typography>
        ) : (
            logs.map((log, index) => (
                <span key={index}>{log}</span>
            ))
        )}
        <div ref={logsEndRef} />
      </Box>
    </Box>
  );
};
