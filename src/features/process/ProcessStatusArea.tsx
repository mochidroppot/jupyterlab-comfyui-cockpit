import React from 'react';
import { Box, Stack, Typography, Button } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import ReplayIcon from '@mui/icons-material/Replay';
import { ProcessStatus } from '../../hooks/useComfySocket';

interface ProcessStatusAreaProps {
  status: ProcessStatus['status'];
  message: string;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  isStartPending: boolean;
}

export const ProcessStatusArea: React.FC<ProcessStatusAreaProps> = ({
  status,
  message,
  onStart,
  onStop,
  onRestart,
  isStartPending,
}) => {
  // Extract PID and Uptime from message if possible
  // message example: "comfyui RUNNING   pid 12345, uptime 0:00:10"
  const pidMatch = message.match(/pid (\d+)/);
  const uptimeMatch = message.match(/uptime ([\d:]+)/);
  const pid = pidMatch ? pidMatch[1] : '-';
  const uptime = uptimeMatch ? uptimeMatch[1] : '-';

  const isLoading = isStartPending || status === 'starting';

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
        {status === 'running' && <Typography variant="body1">Uptime: {uptime}</Typography>}
      </Stack>
      {status === 'running' && (
        <Typography variant="body2" color="text.secondary">
          PID: {pid}
        </Typography>
      )}

      {/* Controls */}
      <Stack
        direction="row"
        spacing={1}
        sx={{mt: 1}}
      >
          <LoadingButton
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<PlayArrowIcon/>}
          sx={{minWidth: 80}}
          loading={isLoading}
          disabled={status === 'running' || isLoading}
          onClick={onStart}
        >
          Start
        </LoadingButton>
        <Button
          variant="outlined"
          color="warning"
          size="small"
          startIcon={<StopIcon/>}
          sx={{minWidth: 80}}
          disabled={status !== 'running' || isLoading}
          onClick={onStop}
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
          onClick={onRestart}
        >
          Restart
        </Button>
      </Stack>
    </Stack>
  );
};
