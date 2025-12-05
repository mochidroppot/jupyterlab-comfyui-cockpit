import React from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import ReplayIcon from '@mui/icons-material/Replay';
import { useProcessStatus } from '../../hooks/useProcess';

export const ProcessStatusArea = (): JSX.Element => {
  const { status, isLoading, start, stop, restart } = useProcessStatus();

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor:
                status === 'running' ? '#4caf50' : status === 'error' ? '#f44336' : status === 'starting' ? '#ff9800' : '#9e9e9e',
            }}
          />
          <Typography variant="body1">
            {status === 'running' ? '稼働' : status === 'error' ? 'エラー' : status === 'starting' ? '起動中' : '停止'}
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
        sx={{mt: 1}}
      >
          <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<PlayArrowIcon/>}
          sx={{minWidth: 80}}
          disabled={status === 'running' || isLoading}
          onClick={start}
        >
          Start
        </Button>
        <Button
          variant="outlined"
          color="warning"
          size="small"
          startIcon={<StopIcon/>}
          sx={{minWidth: 80}}
          disabled={status !== 'running' || isLoading}
          onClick={stop}
        >
          Stop
        </Button>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<ReplayIcon/>}
          sx={{minWidth: 80}}
          disabled={isLoading}
          onClick={restart}
        >
          Restart
        </Button>
      </Stack>
    </Stack>
  );
};
