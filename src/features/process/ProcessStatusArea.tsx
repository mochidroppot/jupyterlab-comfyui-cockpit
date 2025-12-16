import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import ReplayIcon from '@mui/icons-material/Replay';
import { ProcessStatus } from '../../hooks/useProcess';

interface ProcessStatusAreaProps {
  status: ProcessStatus['status'];
  message: string;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  isStartPending: boolean;
  isStopPending: boolean;
  isRestartPending: boolean;
  disabled?: boolean;
}

export const ProcessStatusArea: React.FC<ProcessStatusAreaProps> = ({
  status,
  message,
  onStart,
  onStop,
  onRestart,
  isStartPending,
  isStopPending,
  isRestartPending,
  disabled = false,
}) => {
  // Extract PID and Uptime from message if possible
  // message example: "comfyui RUNNING   pid 12345, uptime 0:00:10"
  const pidMatch = message.match(/pid (\d+)/);
  const uptimeMatch = message.match(/uptime ([\d:]+)/);
  const pid = pidMatch ? pidMatch[1] : '-';
  const uptime = uptimeMatch ? uptimeMatch[1] : '-';

  const isStartLoading = isStartPending || status === 'starting';
  const isAnyPending = isStartPending || isStopPending || isRestartPending || status === 'starting';

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
          loading={isStartLoading}
          disabled={disabled || status === 'running' || isAnyPending}
          onClick={onStart}
        >
          Start
        </LoadingButton>
        <LoadingButton
          variant="outlined"
          color="warning"
          size="small"
          startIcon={<StopIcon/>}
          sx={{minWidth: 80}}
          loading={isStopPending}
          disabled={disabled || status !== 'running' || isAnyPending}
          onClick={onStop}
        >
          Stop
        </LoadingButton>
        <LoadingButton
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<ReplayIcon/>}
          sx={{minWidth: 80}}
          loading={isRestartPending}
          disabled={disabled || isAnyPending}
          onClick={onRestart}
        >
          Restart
        </LoadingButton>
      </Stack>
    </Stack>
  );
};
