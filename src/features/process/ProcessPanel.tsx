import React, { useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  Divider,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import ReplayIcon from '@mui/icons-material/Replay';

export const ProcessPanel = (): JSX.Element => {
  const [status, setStatus] = useState<'running' | 'stopped' | 'error'>('running');

  const handleStart = () => setStatus('running');
  const handleStop = () => setStatus('stopped');
  const handleRestart = () => {
    setStatus('stopped');
    setTimeout(() => setStatus('running'), 1000);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Status Area */}
      <Stack spacing={1}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor:
                  status === 'running' ? '#4caf50' : status === 'error' ? '#f44336' : '#9e9e9e',
              }}
            />
            <Typography variant="body1">
              {status === 'running' ? '稼働' : status === 'error' ? 'エラー' : '停止'}
            </Typography>
          </Stack>
          <Typography variant="body1">Uptime: 00:12:49</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          PID: 23810
        </Typography>

        {/* Controls */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 1 }}
        >
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<PlayArrowIcon />}
            sx={{ minWidth: 80 }}
            disabled={status === 'running'}
            onClick={handleStart}
          >
            Start
          </Button>
          <Button
            variant="outlined"
            color="warning"
            size="small"
            startIcon={<StopIcon />}
            sx={{ minWidth: 80 }}
            disabled={status !== 'running'}
            onClick={handleStop}
          >
            Stop
          </Button>
          <Button variant="outlined" color="primary" size="small"
            startIcon={<ReplayIcon />}
            sx={{ minWidth: 80 }}
            onClick={handleRestart}
          >
            Restart
          </Button>
        </Stack>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Logs */}
      <Typography
       variant="subtitle1"
       sx={{
        mt: 2,
        mb: 1,
       }}
      >
        Logs
      </Typography>
      <Box
        sx={{
          backgroundColor: '#111',
          color: '#fff',
          p: 2,
          borderRadius: 1,
          fontFamily: 'monospace',
          height: 240,
          overflow: 'auto',
        }}
      >
        12:00:10 Starting ComfyUI...
        <br />
        12:00:11 Loading models...
        <br />
        12:00:13 Web UI running on 0.0.0.0:8188
        <br />
        ...
      </Box>
    </Box>
  );
};
