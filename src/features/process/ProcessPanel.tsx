import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Divider,
} from '@mui/material';
import { ProcessStatusArea } from './ProcessStatusArea';
import { useComfySocket } from '../../hooks/useComfySocket';
import { requestAPI } from '../../handler';

type ProcessAction = 'start' | 'stop' | 'restart';

export const ProcessPanel = () => {
  const { status, message, isConnected } = useComfySocket();
  const [pendingActions, setPendingActions] = useState<Record<ProcessAction, boolean>>({
    start: false,
    stop: false,
    restart: false,
  });

  const setPendingAction = (action: ProcessAction, value: boolean) => {
    setPendingActions((prev) => {
      if (prev[action] === value) {
        return prev;
      }
      return { ...prev, [action]: value };
    });
  };

  const controlProcess = async (action: ProcessAction) => {
    setPendingAction(action, true);
    try {
      await requestAPI<{ status: string; message: string }>('process', {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
    } catch (error) {
      console.error(`Error ${action}ing process:`, error);
      setPendingAction(action, false);
    }
  };

  useEffect(() => {
    setPendingActions((prev) => {
      let hasChanges = false;
      const next = { ...prev };

      if (prev.start && (status === 'starting' || status === 'running' || status === 'error')) {
        next.start = false;
        hasChanges = true;
      }
      if (prev.stop && (status === 'stopped' || status === 'error')) {
        next.stop = false;
        hasChanges = true;
      }
      if (prev.restart && (status === 'starting' || status === 'running' || status === 'error')) {
        next.restart = false;
        hasChanges = true;
      }

      return hasChanges ? next : prev;
    });
  }, [status]);

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      {/* Status Area */}
      <ProcessStatusArea 
        status={status}
        message={message}
        onStart={() => controlProcess('start')}
        onStop={() => controlProcess('stop')}
        onRestart={() => controlProcess('restart')}
        isStartPending={pendingActions.start}
        isStopPending={pendingActions.stop}
        isRestartPending={pendingActions.restart}
      />
      
      {!isConnected && (
          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
              Disconnected from server. Reconnecting...
          </Typography>
      )}

      <Divider sx={{ my: 2 }} />
    </Box>
  );
};
